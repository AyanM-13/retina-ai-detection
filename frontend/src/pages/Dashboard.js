import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Analytics from "../components/Analytics";
import PatientTable from "../components/PatientTable";
import { api, AI_BASE_URL } from "../api/client";

import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import GaugeChart from "react-gauge-chart";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const [patient, setPatient] = useState({
    name: "",
    age: "",
    gender: "Male",
    diabetesHistory: "No",
    hypertension: "No",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/history");
      setHistory(res.data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        navigate("/");
      }
    }
  };

  const predict = async () => {
    setError("");

    if (!file) {
      setError("Please upload a retinal image.");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("image", file);
      fd.append("patient", JSON.stringify(patient));

      const res = await api.post("/predict", fd);

      setResult(res.data);
      loadHistory();
    } catch (err) {
      console.error(err);
      setError("AI prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Topbar />

        <h1 className="header">🧠 AI Retinal Clinical Platform</h1>

        {/* Patient Info */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>Patient Details</h3>

          <div className="form-grid">
            <input
              placeholder="Patient Name"
              value={patient.name}
              onChange={(e) =>
                setPatient({ ...patient, name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Age"
              value={patient.age}
              onChange={(e) =>
                setPatient({ ...patient, age: e.target.value })
              }
            />

            <select
              value={patient.gender}
              onChange={(e) =>
                setPatient({ ...patient, gender: e.target.value })
              }
            >
              <option>Male</option>
              <option>Female</option>
            </select>

            <select
              value={patient.diabetesHistory}
              onChange={(e) =>
                setPatient({ ...patient, diabetesHistory: e.target.value })
              }
            >
              <option>No Diabetes</option>
              <option>Diabetes</option>
            </select>

            <select
              value={patient.hypertension}
              onChange={(e) =>
                setPatient({ ...patient, hypertension: e.target.value })
              }
            >
              <option>No Hypertension</option>
              <option>Hypertension</option>
            </select>
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h3>Upload Retinal Image</h3>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selected = e.target.files[0];
              setFile(selected || null);
              setPreview(selected ? URL.createObjectURL(selected) : null);
            }}
          />

          {preview && (
            <div className="scan-container">

              <img
                src={preview}
                alt="retina preview"
                className="img"
              />

              {loading && <div className="scan-line"></div>}

            </div>
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button onClick={predict} disabled={loading}>
            {loading ? "Analyzing Retina..." : "Run AI Analysis"}
          </button>

          {loading && (
            <p style={{ marginTop: "10px", color: "#00ffff" }}>
              🔬 AI analyzing retinal image...
            </p>
          )}
        </motion.div>

        {/* Result Section */}
        {result && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>AI Diagnosis</h3>

            <p>
              Disease:
              <span className={result.disease ? "positive" : "negative"}>
                {result.disease ? " Positive" : " Negative"}
              </span>
            </p>

            <p>
              Confidence: {(result.confidence * 100).toFixed(2)}%
            </p>

            {/* Confidence Gauge */}
            <GaugeChart
              id="confidence-gauge"
              nrOfLevels={20}
              percent={result.confidence}
              colors={["#00ff99", "#ffcc00", "#ff4b4b"]}
            />

            {/* Heatmap */}
            <img
              src={`${AI_BASE_URL}${result.heatmap}`}
              alt="AI Heatmap"
              className="img"
            />

            {result.report && (
              <p>
                <a
                  href={result.report}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download PDF Report
                </a>
              </p>
            )}
          </motion.div>
        )}

        {/* Analytics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Analytics history={history} />
        </motion.div>

        {/* Patient Table */}
        <PatientTable history={history} />
      </div>
    </div>
  );
}