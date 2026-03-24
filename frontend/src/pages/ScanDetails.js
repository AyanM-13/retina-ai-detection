import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { api, AI_BASE_URL } from "../api/client";
import { motion } from "framer-motion";
import GaugeChart from "react-gauge-chart";

export default function ScanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/history")
      .then((res) => {
        const record = res.data.find(r => r._id === id);
        if (record) {
          setData(record);
        } else {
          navigate("/dashboard");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id, navigate]);

  const getSeverityClass = (diagnosis) => {
    if (diagnosis === "No DR") return "negative"; 
    if (diagnosis === "Severe" || diagnosis === "Proliferative") return "positive"; 
    return "warning-text"; 
  };

  if (loading) return <div className="layout"><Sidebar /><div className="main"><Topbar /><h2>Loading...</h2></div></div>;
  if (!data) return null;

  const confidenceValue = typeof data.confidence === 'string' 
    ? parseFloat(data.confidence) / 100 
    : data.confidence;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 className="header" style={{ margin: 0 }}>Patient Scan Details</h1>
          <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: 'var(--glass-border)' }}>
            ⬅ Back
          </button>
        </div>

        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            {/* Patient Info Column */}
            <div style={{ paddingRight: '30px', borderRight: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Patient Profile</h3>
              <p><strong>Name:</strong> <span style={{ color: 'var(--text-primary)' }}>{data.patient?.name || "Unknown"}</span></p>
              <p><strong>Age:</strong> <span style={{ color: 'var(--text-primary)' }}>{data.patient?.age || "N/A"}</span></p>
              <p><strong>Gender:</strong> <span style={{ color: 'var(--text-primary)' }}>{data.patient?.gender || "N/A"}</span></p>
              <p><strong>Diabetes History:</strong> <span style={{ color: 'var(--text-primary)' }}>{data.patient?.diabetesHistory || "No"}</span></p>
              <p><strong>Hypertension:</strong> <span style={{ color: 'var(--text-primary)' }}>{data.patient?.hypertension || "No"}</span></p>
              <p><strong>Date of Scan:</strong> <span style={{ color: 'var(--text-primary)' }}>{new Date(data.date || data.createdAt).toLocaleDateString()}</span></p>
              
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ color: 'var(--text-secondary)' }}>Diagnosis</h3>
                <h2 className={getSeverityClass(data.disease)} style={{ fontSize: '2rem', margin: '10px 0' }}>
                  {data.disease}
                </h2>
              </div>
            </div>

            {/* AI Analysis Column */}
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>AI Confidence</p>
                  <GaugeChart
                    id="details-gauge"
                    nrOfLevels={20}
                    percent={confidenceValue}
                    colors={["#ef4444", "#f59e0b", "#10b981"]}
                    textColor="var(--text-primary)"
                  />
                  <p style={{ marginTop: '-10px', fontWeight: 600 }}>{typeof data.confidence === 'string' ? data.confidence : `${(confidenceValue * 100).toFixed(1)}%`}</p>
                </div>
                
                {data.report && (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>Clinical Report available</p>
                    <a
                      href={`http://localhost:5000${data.report}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-link"
                      style={{ color: 'white', background: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, padding: '12px 24px', borderRadius: '8px', transition: '0.3s' }}
                    >
                      📄 Download PDF Report
                    </a>
                  </div>
                )}
              </div>

              {data.heatmap && (
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>AI Feature Mapping</h4>
                  <img
                    src={`${AI_BASE_URL}${data.heatmap}`}
                    alt="AI Heatmap"
                    style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px', border: 'var(--glass-border)' }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
