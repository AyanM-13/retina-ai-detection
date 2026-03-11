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

export default function Topbar() {
  return (
    <div className="topbar">
      {/* Updated the title to reflect the diagnostic nature of the tool */}
      <h2>RetinaAI Diagnostic Dashboard</h2>

      <div className="doctor">
        <span style={{ marginRight: '10px' }}>👨‍⚕️</span>
        Clinical Portal
      </div>
    </div>
  );
}