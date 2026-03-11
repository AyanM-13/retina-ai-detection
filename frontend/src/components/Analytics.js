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

export default function Analytics({ history }) {
  // Define the 5 stages exactly as they come from the AI
  const categories = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"];

  // Count how many times each stage appears in the history
  const counts = categories.map(cat => 
    history.filter(h => h.disease === cat).length
  );

  const data = {
    labels: categories,
    datasets: [
      {
        label: "Number of Patients",
        data: counts,
        backgroundColor: [
          "#2ecc71", // Green for No DR
          "#f1c40f", // Yellow for Mild
          "#e67e22", // Orange for Moderate
          "#e74c3c", // Light Red for Severe
          "#8e44ad"  // Purple for Proliferative
        ],
        borderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Patient Severity Distribution'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h3>DR Severity Analytics</h3>
      <div style={{ height: '300px' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}