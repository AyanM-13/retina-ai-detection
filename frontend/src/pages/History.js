import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { api, AI_BASE_URL } from "../api/client";
import { motion } from "framer-motion";

export default function History() {

  const [data, setData] = useState([]);

  useEffect(() => {

    api
      .get("/history")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));

  }, []);

  return (

    <div className="layout">

      <Sidebar />

      <div className="main history-bg">

        <h1 className="header">📊 Prediction History</h1>

        <div className="history-grid">

          {data.map((d, i) => (

            <motion.div
              key={d._id}
              className="card history-card"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >

              <h3>{d.patient?.name || "Unknown Patient"}</h3>

              <p>Age: {d.patient?.age}</p>

              <p>Gender: {d.patient?.gender}</p>

              <p>
                Result:
                <span
                  className={
                    d.disease ? "positive" : "negative"
                  }
                >
                  {d.disease ? " Positive" : " Negative"}
                </span>
              </p>

              <p>
                Confidence: {(d.confidence * 100).toFixed(2)}%
              </p>

              {d.heatmap && (
                <img
                  src={`${AI_BASE_URL}${d.heatmap}`}
                  alt="retina heatmap"
                  className="img-small"
                />
              )}

              <p className="date">
                {new Date(d.createdAt).toLocaleString()}
              </p>

            </motion.div>

          ))}

        </div>

      </div>

    </div>

  );
}