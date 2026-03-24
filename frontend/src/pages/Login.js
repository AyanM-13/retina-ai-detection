// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../api/client";
// import { setToken } from "../utils/auth";
// import "./login.css";

// export default function Login() {

//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const login = async () => {

//     try {

//       setLoading(true);

//       const res = await api.post("/login", {
//         email,
//         password
//       });

//       const token = res.data.token;

//       setToken(token);

//       navigate("/dashboard");

//     } catch (err) {

//       alert("Invalid login credentials");

//     } finally {

//       setLoading(false);

//     }

//   };

//   return (

//     <div className="login-page">

//       <div className="login-card">

//         <h1>🧠 RetinaAI</h1>

//         <p>Doctor Clinical Portal</p>

//         <input
//           placeholder="Doctor Email"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//         />

//         <button onClick={login} disabled={loading}>
//           {loading ? "Logging in..." : "Login"}
//         </button>

//         <p style={{ marginTop: "15px" }}>

//           New doctor?

//           <span
//             style={{ color: "#4fa3ff", cursor: "pointer" }}
//             onClick={() => navigate("/register")}
//           >
//             Register here
//           </span>

//         </p>

//       </div>

//     </div>

//   );

// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { setToken } from "../utils/auth";
import { motion } from "framer-motion";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/login", { email, password });
      setToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') login();
  };

  return (
    <div className="auth-container">
      {/* Left Glowing Graphic Side */}
      <div className="auth-graphic">
        <motion.div 
          className="graphic-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="retina-glow-circle"></div>
          <h1>RetinaVision AI</h1>
          <p>State-of-the-Art Diabetic Retinopathy Detection</p>
          <ul className="feature-list">
            <li>✨ 98% Diagnostic Accuracy</li>
            <li>⚡ Real-time AI Confidence Heatmaps</li>
            <li>📊 Seamless Clinical History Tracking</li>
          </ul>
        </motion.div>
      </div>

      {/* Right Login Form Side */}
      <div className="auth-form-section">
        <motion.div 
          className="auth-card glass-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="auth-title">Doctor Portal</h2>
          <p className="auth-subtitle">Welcome back. Enter your credentials to continue.</p>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-error">
              {error}
            </motion.div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="dr.smith@clinic.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button className="auth-btn" onClick={login} disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>

          <p className="auth-footer">
            New to RetinaVision?{" "}
            <span onClick={() => navigate("/register")}>
              Create an account
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}