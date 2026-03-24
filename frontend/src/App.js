import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Register from "./pages/Register";
import ScanDetails from "./pages/ScanDetails";
import CompareScans from "./pages/CompareScans";

export default function App() {

  return (

    <Router>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/history" element={<History />} />
        
        <Route path="/patient/:id" element={<ScanDetails />} />

        <Route path="/compare" element={<CompareScans />} />

      </Routes>

    </Router>

  );

}