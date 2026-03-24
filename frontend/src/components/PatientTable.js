import { Link } from "react-router-dom";

export default function PatientTable({ history }) {
  
  // Helper to color-code the severity levels
  const getStatusStyle = (diagnosis) => {
    const baseStyle = {
      padding: '6px 12px',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.85rem',
      display: 'inline-block'
    };

    switch (diagnosis) {
      case "No DR":
        return { ...baseStyle, backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }; 
      case "Mild":
        return { ...baseStyle, backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case "Moderate":
        return { ...baseStyle, backgroundColor: 'rgba(234, 88, 12, 0.2)', color: '#f97316', border: '1px solid rgba(234, 88, 12, 0.3)' }; 
      case "Severe":
        return { ...baseStyle, backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }; 
      case "Proliferative":
        return { ...baseStyle, backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }; 
      default:
        return baseStyle;
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Patient Records</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Age</th>
              <th>AI Diagnosis Result</th>
              <th>Match Confidence</th>
              <th>Clinical Report</th>
            </tr>
          </thead>
          <tbody>
            {history.map((p) => (
              <tr key={p._id}>
                <td style={{ fontWeight: 500 }}>
                  <Link to={`/patient/${p._id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {p.patient?.name || "N/A"} 
                    <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>↗</span>
                  </Link>
                </td>
                <td>{p.patient?.age || "N/A"}</td>
                <td>
                  <span style={getStatusStyle(p.disease)}>
                    {p.disease}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>
                  {typeof p.confidence === 'string' ? p.confidence : `${(p.confidence * 100).toFixed(1)}%`}
                </td>
                <td>
                  {p.report ? (
                    <a 
                      href={`http://localhost:5000${p.report}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                      📄 View PDF
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Unavailable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}