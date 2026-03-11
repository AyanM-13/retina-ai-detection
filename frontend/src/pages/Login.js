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
      const res = await api.post("/login", {
        email,
        password
      });

      const token = res.data.token;
      setToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  // Allow login on Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') login();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Updated branding to match the Retinal theme */}
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          👁️ RetinaVision
        </h1>
        <p>Advanced DR Diagnostic Portal</p>

        {error && <p style={{ color: "#ff4b4b", fontSize: "0.9rem" }}>{error}</p>}

        <input
          placeholder="Doctor Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button onClick={login} disabled={loading}>
          {loading ? "Authenticating..." : "Login"}
        </button>

        <p style={{ marginTop: "15px", fontSize: "0.85rem" }}>
          New doctor?{" "}
          <span
            style={{ color: "#4fa3ff", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}