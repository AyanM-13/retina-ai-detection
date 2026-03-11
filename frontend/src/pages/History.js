import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { api, AI_BASE_URL } from "../api/client";
import { motion } from "framer-motion";

export default function History() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api
      .get("/history")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  const getResultClass = (diagnosis) => {
    if (diagnosis === "No DR") return "negative"; 
    if (diagnosis === "Severe" || diagnosis === "Proliferative") return "positive"; 
    return "warning-text"; 
  };

  const downloadReport = async (predictionId) => {
    try {
      const response = await api.get(`/report/${predictionId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Report_${predictionId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Error downloading report");
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <div className="main history-bg">
        <h1 className="header">📊 Prediction History</h1>

        <div className="history-grid">
          {data.map((d, i) => (
            <motion.div
              key={d._id}
              className="card history-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Left Side: Info */}
              <div className="history-info">
                <h3>{d.patient?.name || "Unknown Patient"}</h3>
                <div className="history-details">
                  <p><strong>Age:</strong> {d.patient?.age || "N/A"} | <strong>{d.patient?.gender || "N/A"}</strong></p>
                  <p>Result: <span className={getResultClass(d.disease)}>{d.disease}</span></p>
                  <p>Confidence: <strong>{typeof d.confidence === 'string' ? d.confidence : `${(d.confidence * 100).toFixed(2)}%`}</strong></p>
                  <p className="date">📅 {new Date(d.date || d.createdAt).toLocaleString()}</p>
                </div>
                
                <button 
                  className="download-btn-small" 
                  onClick={() => downloadReport(d._id)}
                >
                  📄 Download PDF
                </button>
              </div>

              {/* Right Side: Image Mapping */}
              {d.heatmap && (
                <div className="history-visual">
                  <img
                    src={`${AI_BASE_URL}${d.heatmap}`}
                    alt="retina heatmap"
                    className="img-small"
                  />
                  <p className="caption">AI Feature Mapping</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}