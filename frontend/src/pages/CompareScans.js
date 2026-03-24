import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { api, AI_BASE_URL } from "../api/client";
import { motion } from "framer-motion";

export default function CompareScans() {
  const [history, setHistory] = useState([]);
  const [scan1Id, setScan1Id] = useState("");
  const [scan2Id, setScan2Id] = useState("");

  useEffect(() => {
    api.get("/history")
      .then(res => setHistory(res.data))
      .catch(err => console.error("Failed to load history for comparison", err));
  }, []);

  const scan1 = history.find(h => h._id === scan1Id);
  const scan2 = history.find(h => h._id === scan2Id);

  const getResultColor = (disease) => {
    if (disease === "No DR") return "var(--success)";
    if (disease === "Severe" || disease === "Proliferative") return "var(--danger)";
    return "var(--warning)";
  };

  const renderScanPane = (scan, setScanId, label) => (
    <div className="card glass-panel" style={{ flex: 1, padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0 }}>{label}</h3>
      
      <select 
        className="input-field" 
        value={scan ? scan._id : ""} 
        onChange={(e) => setScanId(e.target.value)}
        style={{ width: '100%', marginBottom: 0, cursor: 'pointer' }}
      >
        <option value="">-- Select a Patient Scan --</option>
        {history.map(h => (
          <option key={h._id} value={h._id}>
            {h.patient?.name || "Unknown"} | {new Date(h.date || h.createdAt).toLocaleDateString()}
          </option>
        ))}
      </select>

      {scan ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
        >
          <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: 600 }}>{scan.patient?.name}</p>
            <p style={{ margin: '0 0 5px 0', color: 'var(--text-secondary)' }}>Age: {scan.patient?.age} | {scan.patient?.gender}</p>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Scanned: {new Date(scan.date || scan.createdAt).toLocaleString()}</p>
          </div>

          <div style={{ padding: '15px', borderLeft: `4px solid ${getResultColor(scan.disease)}`, background: 'rgba(255,255,255,0.03)' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>AI Diagnosis</h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: getResultColor(scan.disease), fontWeight: 'bold' }}>
              {scan.disease}
            </p>
            <p style={{ margin: 0 }}>Confidence: <strong>{typeof scan.confidence === 'string' ? scan.confidence : `${(scan.confidence * 100).toFixed(2)}%`}</strong></p>
          </div>

          {scan.heatmap && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <p style={{ marginBottom: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>AI Heatmap Overlay</p>
              <img 
                src={`${AI_BASE_URL}${scan.heatmap}`} 
                alt="Retinal Heatmap" 
                style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              />
            </div>
          )}
        </motion.div>
      ) : (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
          <p>Please select a scan from the dropdown above.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 className="header" style={{ margin: 0 }}>⚖️ Progression Comparison</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Select two clinical records to evaluate retinopathic changes.</p>
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          {/* Left Pane */}
          {renderScanPane(scan1, setScan1Id, "Baseline Scan (A)")}

          {/* VS Divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--accent-glow)' }}>
              VS
            </div>
          </div>

          {/* Right Pane */}
          {renderScanPane(scan2, setScan2Id, "Follow-up Scan (B)")}
        </div>
      </div>
    </div>
  );
}
