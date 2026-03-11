// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { clearToken } from "../utils/auth";

// import { FaBrain, FaHistory, FaSignOutAlt } from "react-icons/fa";
// import { motion } from "framer-motion";

// export default function Sidebar() {

//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogout = () => {
//     clearToken();
//     navigate("/", { replace: true });
//   };

//   const active = (path) =>
//     location.pathname === path ? "sidebar-link active" : "sidebar-link";

//   return (

//     <motion.div
//       className="sidebar"
//       initial={{ x: -100 }}
//       animate={{ x: 0 }}
//       transition={{ duration: 0.5 }}
//     >

//       <h2 className="logo">🧠 RetinaAI</h2>

//       <nav>

//         <Link className={active("/dashboard")} to="/dashboard">
//           <FaBrain className="icon" />
//           Dashboard
//         </Link>

//         <Link className={active("/history")} to="/history">
//           <FaHistory className="icon" />
//           History
//         </Link>

//       </nav>

//       <button
//         className="logout-btn"
//         onClick={handleLogout}
//       >
//         <FaSignOutAlt />
//         Logout
//       </button>

//     </motion.div>
//   );
// }

import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearToken } from "../utils/auth";
import { FaBrain, FaHistory, FaSignOutAlt, FaEye } from "react-icons/fa"; // Added FaEye
import { motion } from "framer-motion";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearToken();
    navigate("/", { replace: true });
  };

  const active = (path) =>
    location.pathname === path ? "sidebar-link active" : "sidebar-link";

  return (
    <motion.div
      className="sidebar"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Updated branding to match the new 5-stage diagnostic scope */}
      <h2 className="logo">👁️ RetinaVision</h2>

      <nav>
        <Link className={active("/dashboard")} to="/dashboard">
          <FaEye className="icon" /> {/* Switched icon to Eye for retinal theme */}
          Dashboard
        </Link>

        <Link className={active("/history")} to="/history">
          <FaHistory className="icon" />
          History
        </Link>
      </nav>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        <FaSignOutAlt />
        Logout
      </button>
    </motion.div>
  );
}