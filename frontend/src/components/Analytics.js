import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics({history}) {

  const positives = history.filter(h => h.disease).length;
  const negatives = history.length - positives;

  const data = {
    labels: ["Positive", "Negative"],
    datasets: [
      {
        label: "Predictions",
        data: [positives, negatives],
        backgroundColor: ["red", "green"]
      }
    ]
  };

  return (
    <div className="card">

      <h3>AI Prediction Analytics</h3>

      <Bar data={data} />

    </div>
  );
}