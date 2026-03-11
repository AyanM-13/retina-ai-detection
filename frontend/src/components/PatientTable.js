export default function PatientTable({ history }) {
  
  // Helper to color-code the severity levels
  const getStatusStyle = (diagnosis) => {
    const baseStyle = {
      padding: '4px 8px',
      borderRadius: '4px',
      fontWeight: 'bold',
      fontSize: '0.85rem'
    };

    switch (diagnosis) {
      case "No DR":
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' }; // Green
      case "Mild":
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' }; // Yellow
      case "Moderate":
        return { ...baseStyle, backgroundColor: '#ffe5d0', color: '#d35400' }; // Orange
      case "Severe":
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' }; // Red
      case "Proliferative":
        return { ...baseStyle, backgroundColor: '#e2d9f3', color: '#512da8' }; // Purple
      default:
        return baseStyle;
    }
  };

  return (
    <div className="card">
      <h3>Patient Records</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Result</th>
            <th>Confidence</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {history.map((p) => (
            <tr key={p._id}>
              <td>{p.patient?.name || "N/A"}</td>
              <td>{p.patient?.age || "N/A"}</td>
              <td>
                {/* CHANGED: Now displays the actual label with a color badge */}
                <span style={getStatusStyle(p.disease)}>
                  {p.disease}
                </span>
              </td>
              <td>
                {/* CHANGED: Backend now sends a formatted string like "95.50%" */}
                {typeof p.confidence === 'string' ? p.confidence : `${(p.confidence * 100).toFixed(1)}%`}
              </td>
              <td>
                {/* Added link to PDF if available */}
                {p.report && <a href={`http://localhost:5000${p.report}`} target="_blank" rel="noreferrer">PDF</a>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}