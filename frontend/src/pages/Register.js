import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { setToken } from "../utils/auth";
import { motion } from "framer-motion";
import "./login.css";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/register", { email, password });
      setToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || "Registration failed");
      } else {
        setError("Connection error with server");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') register();
  };

  return (
    <div className="auth-container">
      {/* Left Glowing Graphic Side */}
      <div className="auth-graphic" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(59, 130, 246, 0.2))' }}>
        <motion.div 
          className="graphic-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="retina-glow-circle"></div>
          <h1>Join RetinaVision</h1>
          <p>Access the most advanced Clinical AI Diagnosis Platform</p>
          <ul className="feature-list">
            <li>🔒 Enterprise-grade HIPAA Compliant Security</li>
            <li>📈 Comprehensive Patient Progression Tracking</li>
            <li>📄 Automated Detailed PDF Clinical Reports</li>
          </ul>
        </motion.div>
      </div>

      {/* Right Register Form Side */}
      <div className="auth-form-section">
        <motion.div 
          className="auth-card glass-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Register your clinic to access the RetinaVision platform.</p>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error">
              {error}
            </motion.div>
          )}

          <div className="input-group">
            <label>Doctor Email</label>
            <input
              type="email"
              placeholder="dr.smith@clinic.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="input-group">
            <label>Secure Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button className="auth-btn" onClick={register} disabled={loading}>
            {loading ? "Creating Account..." : "Register Now"}
          </button>

          <p className="auth-footer">
            Already have an account?{" "}
            <span onClick={() => navigate("/")}>
              Sign In here
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}