const path = require("path");
const fs = require("fs");

const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const FormData = require("form-data");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const Prediction = require("./models/prediction");
const createReport = require("./pdf");
const Doctor = require("./models/Doctor");
const config = require("./config");


// -----------------------------
// DATABASE CONNECTION
// -----------------------------

mongoose
  .connect(config.mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });


// -----------------------------
// EXPRESS SETUP
// -----------------------------

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

app.use(morgan(config.env === "production" ? "combined" : "dev"));


// -----------------------------
// STATIC FILES
// -----------------------------

app.use("/files", express.static(config.uploadsDir));

if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}


// -----------------------------
// MULTER CONFIG
// -----------------------------

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsDir),

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";

    cb(
      null,
      `retina_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`
    );
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});


// -----------------------------
// RATE LIMITERS
// -----------------------------

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

const predictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});


// -----------------------------
// AUTH HELPERS
// -----------------------------

function generateToken(doctor) {
  return jwt.sign(
    {
      id: doctor._id,
      email: doctor.email,
    },
    config.jwtSecret,
    { expiresIn: "1d" }
  );
}

function auth(req, res, next) {

  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid authorization format" });
  }

  try {

    const decoded = jwt.verify(token, config.jwtSecret);

    req.user = decoded;

    next();

  } catch {

    return res.status(403).json({ error: "Invalid or expired token" });

  }
}


// -----------------------------
// LOGIN ROUTE
// -----------------------------

app.post("/login", loginLimiter, async (req, res, next) => {

  try {

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const doctor = await Doctor.findOne({ email });

    if (!doctor) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, doctor.password);

    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(doctor);

    return res.json({ token });

  } catch (err) {
    next(err);
  }
});

// -----------------------------
// REGISTER DOCTOR
// -----------------------------

app.post("/register", async (req, res, next) => {

  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const existing = await Doctor.findOne({ email });

    if (existing) {
      return res.status(400).json({ error: "Doctor already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      email,
      password: hashed
    });

    const token = jwt.sign(
      { id: doctor._id, email: doctor.email },
      config.jwtSecret,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    next(err);
  }

});


// -----------------------------
// PREDICT ROUTE
// -----------------------------

app.post(
  "/predict",
  auth,
  predictLimiter,
  upload.single("image"),

  async (req, res, next) => {

    try {

      if (!req.file) {
        return res.status(400).json({ error: "Retinal image is required" });
      }

      const filePath = req.file.path;

      let patient = null;

      if (req.body.patient) {
        try {
          patient = JSON.parse(req.body.patient);
        } catch {
          return res.status(400).json({ error: "Invalid patient payload" });
        }
      }


      // -----------------------------
      // CALL PYTHON AI SERVICE
      // -----------------------------

      const form = new FormData();

      form.append("file", fs.createReadStream(filePath));

      let aiResponse;

      try {

        aiResponse = await axios.post(
          `${config.aiServiceUrl}/predict`,
          form,
          {
            headers: form.getHeaders(),
            timeout: 60000, // increase timeout to 60s
          }
        );

      } catch (aiErr) {

        console.error("AI service error:", aiErr.message);

        return res.status(500).json({
          error: "AI prediction failed",
        });

      }


      const data = aiResponse.data;


      // -----------------------------
      // SAVE TO DATABASE
      // -----------------------------

      const record = await Prediction.create({
        doctor: req.user.id,
        patient,
        disease: data.disease,
        confidence: data.confidence,
        image: filePath,
        heatmap: data.heatmap,
      });


      // -----------------------------
      // CREATE PDF REPORT
      // -----------------------------

      const pdfPath = path.join(
        config.uploadsDir,
        `report_${record._id}.pdf`
      );

      createReport({ ...data, patient }, pdfPath);


      const relativeImage = path.relative(config.uploadsDir, filePath);

      const relativeReport = path.relative(config.uploadsDir, pdfPath);


      return res.json({

        disease: data.disease,

        confidence: data.confidence,

        heatmap: data.heatmap,

        image: `/files/${relativeImage}`,

        report: `/files/${relativeReport}`,

        id: record._id,

      });

    } catch (err) {
      next(err);
    }
  }
);


// -----------------------------
// HISTORY ROUTE
// -----------------------------

app.get("/history", auth, async (req, res, next) => {

  try {

    const { limit = 50 } = req.query;

    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 200);

    const data = await Prediction.find({
      doctor: req.user.id
    })
      .sort({ date: -1 })
      .limit(parsedLimit);

    return res.json(data);

  } catch (err) {
    next(err);
  }
});


// -----------------------------
// GLOBAL ERROR HANDLER
// -----------------------------

app.use((err, _req, res, _next) => {

  console.error("Unhandled error:", err);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  if (err.message === "Only image uploads are allowed") {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal Server Error" });

});


// -----------------------------
// START SERVER
// -----------------------------

app.listen(config.port, () =>
  console.log(`Backend running on port ${config.port}`)
);