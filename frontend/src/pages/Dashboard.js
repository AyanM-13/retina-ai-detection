import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Analytics from "../components/Analytics";
import PatientTable from "../components/PatientTable";
import { api, AI_BASE_URL } from "../api/client";

import { motion } from "framer-motion";
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

  // Helper to determine text color based on severity string
  const getSeverityClass = (diagnosis) => {
    if (diagnosis === "No DR") return "negative"; // Green style
    if (diagnosis === "Severe" || diagnosis === "Proliferative") return "positive"; // Red style
    return "warning-text"; // You can add a yellow style in your CSS
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Topbar />

        <h1 className="header">👁️ RetinaVision Clinical Platform</h1>

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
              onChange={(e) => setPatient({ ...patient, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Age"
              value={patient.age}
              onChange={(e) => setPatient({ ...patient, age: e.target.value })}
            />
            <select
              value={patient.gender}
              onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
            >
              <option>Male</option>
              <option>Female</option>
            </select>
            <select
              value={patient.diabetesHistory}
              onChange={(e) => setPatient({ ...patient, diabetesHistory: e.target.value })}
            >
              <option>No Diabetes</option>
              <option>Diabetes</option>
            </select>
            <select
              value={patient.hypertension}
              onChange={(e) => setPatient({ ...patient, hypertension: e.target.value })}
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
              <img src={preview} alt="retina preview" className="img" />
              {loading && <div className="scan-line"></div>}
            </div>
          )}

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button onClick={predict} disabled={loading}>
            {loading ? "Analyzing Retina..." : "Run AI Analysis"}
          </button>
        </motion.div>

        {/* Result Section */}
        {result && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>AI Diagnosis Results</h3>
            
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '1.2rem' }}>
                Severity Grade: 
                <strong className={getSeverityClass(result.disease)}>
                  {` ${result.disease}`}
                </strong>
              </p>
              
              <p>Confidence Level</p>
              <GaugeChart
                id="confidence-gauge"
                nrOfLevels={20}
                // Confidence is now a string like "95.50%", convert back to 0-1 for gauge
                percent={parseFloat(result.confidence) / 100}
                colors={["#ff4b4b", "#ffcc00", "#00ff99"]} 
                textColor="#ffffff"
              />
              <p>Match Confidence: {result.confidence}</p>
            </div>

            <div className="result-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
               <div>
                  <h4>Original Scan</h4>
                  <img src={preview} alt="Original" className="img" />
               </div>
               <div>
                  <h4>AI Feature Heatmap</h4>
                  <img
                    src={`${AI_BASE_URL}${result.heatmap}`}
                    alt="AI Heatmap"
                    className="img"
                  />
               </div>
            </div>

            {result.report && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <a
                  href={`http://localhost:5000${result.report}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-link"
                  style={{ color: '#00ffff', textDecoration: 'underline' }}
                >
                  📄 Download Detailed Medical Report (PDF)
                </a>
              </div>
            )}
          </motion.div>
        )}

        {/* Analytics & History */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <Analytics history={history} />
        </motion.div>

        <PatientTable history={history} />
      </div>
    </div>
  );
}