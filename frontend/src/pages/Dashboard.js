import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Analytics from "../components/Analytics";
import PatientTable from "../components/PatientTable";
import { api, AI_BASE_URL } from "../api/client";

import { motion } from "framer-motion";
import GaugeChart from "react-gauge-chart";
import { FaUsers, FaExclamationTriangle, FaVial } from "react-icons/fa";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getSeverityClass = (diagnosis) => {
    if (diagnosis === "No DR") return "negative"; 
    if (diagnosis === "Severe" || diagnosis === "Proliferative") return "positive"; 
    return "warning-text"; 
  };

  // Metrics Calculations
  const totalScans = history.length;
  const highRisk = history.filter(h => h.disease === "Severe" || h.disease === "Proliferative").length;
  const recentPatients = history.filter(h => {
     const date = new Date(h.date || h.createdAt);
     const oneWeekAgo = new Date();
     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
     return date > oneWeekAgo;
  }).length;

  return (
    <div className="layout">
      <Sidebar />

      <div className="main">
        <Topbar />

        {/* METRICS CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          <motion.div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', margin: 0 }}
             initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div style={{ fontSize: '2.5rem', color: 'var(--accent-primary)' }}><FaVial /></div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 600 }}>Total Scans</p>
              <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>{totalScans}</h2>
            </div>
          </motion.div>

          <motion.div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', margin: 0 }}
             initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={{ fontSize: '2.5rem', color: 'var(--danger)' }}><FaExclamationTriangle /></div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 600 }}>High-Risk Detections</p>
              <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>{highRisk}</h2>
            </div>
          </motion.div>

          <motion.div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', margin: 0 }}
             initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div style={{ fontSize: '2.5rem', color: 'var(--success)' }}><FaUsers /></div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 600 }}>Recent Patients (7d)</p>
              <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>{recentPatients}</h2>
            </div>
          </motion.div>
        </div>

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
            style={{ marginBottom: '20px' }}
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

          {error && <p style={{ color: "var(--danger)", marginTop: "10px" }}>{error}</p>}

          <button onClick={predict} disabled={loading} style={{ marginTop: '20px' }}>
            {loading ? "Analyzing Retina..." : "Run AI Analysis"}
          </button>
        </motion.div>

        {/* Result Section */}
        {result && (
          <motion.div
            className="card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
          >
            <h3>AI Diagnosis Results</h3>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Severity Grade: 
                <span className={getSeverityClass(result.disease)} style={{ fontSize: '1.5rem', marginLeft: '10px' }}>
                  {result.disease}
                </span>
              </p>
              
              <div style={{ width: '100%', maxWidth: '300px', margin: '20px auto' }}>
                <GaugeChart
                  id="confidence-gauge"
                  nrOfLevels={20}
                  percent={parseFloat(result.confidence) / 100}
                  colors={["#ef4444", "#f59e0b", "#10b981"]} 
                  textColor="var(--text-primary)"
                />
              </div>
              <p style={{ color: 'var(--text-muted)' }}>Match Confidence: <strong>{result.confidence}</strong></p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
               <div>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>Original Scan</h4>
                  <img src={preview} alt="Original" className="img" style={{ width: '100%', borderRadius: '12px' }} />
               </div>
               <div>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>AI Feature Heatmap</h4>
                  <img
                    src={`${AI_BASE_URL}${result.heatmap}`}
                    alt="AI Heatmap"
                    className="img"
                    style={{ width: '100%', borderRadius: '12px' }}
                  />
               </div>
            </div>

            {result.report && (
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <a
                  href={`http://localhost:5000${result.report}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-link"
                  style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, padding: '12px 24px', border: '1px solid var(--accent-primary)', borderRadius: '8px', display: 'inline-block', transition: '0.3s' }}
                  onMouseEnter={(e) => { e.target.style.background = 'var(--accent-primary)'; e.target.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--accent-primary)'; }}
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