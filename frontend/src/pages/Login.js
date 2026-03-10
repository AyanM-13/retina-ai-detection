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

  const login = async () => {

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

      alert("Invalid login credentials");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>🧠 RetinaAI</h1>

        <p>Doctor Clinical Portal</p>

        <input
          placeholder="Doctor Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button onClick={login} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ marginTop: "15px" }}>

          New doctor?

          <span
            style={{ color: "#4fa3ff", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>

        </p>

      </div>

    </div>

  );

}