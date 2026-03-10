import { Link, useNavigate, useLocation } from "react-router-dom";
import { clearToken } from "../utils/auth";

import { FaBrain, FaHistory, FaSignOutAlt } from "react-icons/fa";
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

      <h2 className="logo">🧠 RetinaAI</h2>

      <nav>

        <Link className={active("/dashboard")} to="/dashboard">
          <FaBrain className="icon" />
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