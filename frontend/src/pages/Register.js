import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { setToken } from "../utils/auth";
import "./login.css";

export default function Register() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {

      const res = await api.post("/register", {
        email: email,
        password: password
      });

      setToken(res.data.token);

      navigate("/dashboard");

    } catch (err) {

      if (err.response) {
        alert(err.response.data.error);
      } else {
        alert("Registration failed");
      }

    }

  };

  return (

    <div className="login-page">

      <div className="login-card">

        <h1>🧠 RetinaAI</h1>

        <p>Create Doctor Account</p>

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

        <button type="button" onClick={register}>
          Register
        </button>

      </div>

    </div>

  );
}