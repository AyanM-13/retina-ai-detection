const path = require("path");

require("dotenv").config({
  path: path.resolve(process.cwd(), "..", ".env"),
});

const NODE_ENV = process.env.NODE_ENV || "development";

module.exports = {
  env: NODE_ENV,
  port: process.env.BACKEND_PORT || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/retinaAI",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-env",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  uploadsDir: process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads"),
};

