// export default function Topbar(){

//   return(
//     <div className="topbar">

//       <h2>AI Retinal Clinical Platform</h2>

//       <div className="doctor">
//         Doctor Panel
//       </div>

//     </div>
//   );

// }

import { useState, useEffect } from "react";

export default function Topbar() {
  const [isDark, setIsDark] = useState(true);

  // Initialize theme based on document body class
  useEffect(() => {
    setIsDark(!document.body.classList.contains('light-theme'));
  }, []);

  const toggleTheme = () => {
    document.body.classList.toggle('light-theme');
    setIsDark(!isDark);
  };

  return (
    <div className="topbar">
      <h2>RetinaAI Diagnostic Dashboard</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        
        <div className="doctor">
          <span style={{ marginRight: '10px' }}>👨‍⚕️</span>
          Clinical Portal
        </div>
      </div>
    </div>
  );
}