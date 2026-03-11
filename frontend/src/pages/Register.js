import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { setToken } from "../utils/auth";
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
      const res = await api.post("/register", {
        email: email,
        password: password
      });

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

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Synced with RetinaVision Branding */}
        <h1>👁️ RetinaVision</h1>
        <p>Create Clinical Account</p>

        {error && <p style={{ color: "#ff4b4b", fontSize: "0.9rem" }}>{error}</p>}

        <input
          type="email"
          placeholder="Doctor Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="button" onClick={register} disabled={loading}>
          {loading ? "Creating Account..." : "Register Now"}
        </button>

        <p style={{ marginTop: "15px", fontSize: "0.85rem" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#4fa3ff", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}