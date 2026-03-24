import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { api, AI_BASE_URL } from "../api/client";
import { motion } from "framer-motion";

export default function History() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("All");

  const navigate = useNavigate();

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
      link.remove();
    } catch (err) {
      alert("Error downloading report");
    }
  };

  const downloadCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ["Patient ID", "Name", "Age", "Gender", "Diagnosis", "Confidence", "Date"];
    const rows = data.map(d => [
      d.patient?.id || d._id,
      d.patient?.name || "Unknown",
      d.patient?.age || "N/A",
      d.patient?.gender || "N/A",
      d.disease,
      typeof d.confidence === 'string' ? d.confidence : `${(d.confidence * 100).toFixed(2)}%`,
      new Date(d.date || d.createdAt).toLocaleString().replace(/,/g, "")
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clinical_patient_history.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredData = data.filter(d => {
    const matchesSearch = (d.patient?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === "All" || d.disease === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="layout">
      <Sidebar />

      <div className="main history-bg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="header">📊 Prediction History</h1>
          <button 
            onClick={downloadCSV}
            style={{ 
              background: 'var(--success)', 
              color: 'white', 
              padding: '10px 20px', 
              borderRadius: '8px', 
              border: 'none', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📥 Export to CSV
          </button>
        </div>

        {/* Filters Section */}
        <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '20px', padding: '15px 25px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>🔍 Search Patient</label>
            <input 
              type="text" 
              placeholder="Enter patient name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ width: '100%', marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>🏷 Filter by Diagnosis</label>
            <select 
              value={filterSeverity} 
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="input-field"
              style={{ width: '100%', marginBottom: 0 }}
            >
              <option value="All">All Severity Levels</option>
              <option value="No DR">No DR (Healthy)</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
              <option value="Proliferative">Proliferative</option>
            </select>
          </div>
        </div>

        <div className="history-grid">
          {filteredData.length === 0 ? (
             <p style={{ color: 'var(--text-muted)' }}>No patients found matching your criteria.</p>
          ) : (
            filteredData.map((d, i) => (
              <motion.div
                key={d._id}
                className="card history-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {/* Left Side: Info */}
                <div className="history-info">
                  <h3>{d.patient?.name || "Unknown Patient"}</h3>
                  <div className="history-details">
                    <p><strong>Age:</strong> {d.patient?.age || "N/A"} | <strong>{d.patient?.gender || "N/A"}</strong></p>
                    <p>Result: <span className={getResultClass(d.disease)}>{d.disease}</span></p>
                    <p>Confidence: <strong>{typeof d.confidence === 'string' ? d.confidence : `${(d.confidence * 100).toFixed(2)}%`}</strong></p>
                    <p className="date" style={{ color: 'var(--text-muted)' }}>📅 {new Date(d.date || d.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                      className="download-btn-small" 
                      onClick={() => navigate(`/patient/${d._id}`)}
                      style={{ background: 'var(--accent-primary)', color: 'white', border: 'transparent' }}
                    >
                      🔍 View Detailed Scan
                    </button>

                    <button 
                      className="download-btn-small" 
                      onClick={() => downloadReport(d._id)}
                    >
                      📄 Download PDF
                    </button>
                  </div>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}