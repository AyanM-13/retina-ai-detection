import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export default function Analytics({ history }) {
  // 1. BAR CHART: Severity Distribution
  const categories = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"];
  const counts = categories.map(cat => history.filter(h => h.disease === cat).length);

  const barData = {
    labels: categories,
    datasets: [{
      label: "Number of Patients",
      data: counts,
      backgroundColor: ["#10b981", "#fbbf24", "#f97316", "#ef4444", "#a78bfa"],
      borderRadius: 6,
    }]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', stepSize: 1 } }
    }
  };

  const barOptions = { ...commonOptions, plugins: { ...commonOptions.plugins, legend: { display: false } } };

  // 2. DOUGHNUT CHART: AI Confidence Levels
  let highConf = 0, medConf = 0, lowConf = 0;
  history.forEach(h => {
    let conf = typeof h.confidence === 'string' ? parseFloat(h.confidence) : h.confidence * 100;
    if (isNaN(conf)) return;
    if (conf >= 90) highConf++;
    else if (conf >= 70) medConf++;
    else lowConf++;
  });

  const doughnutData = {
    labels: ["High (>90%)", "Medium (70-90%)", "Low (<70%)"],
    datasets: [{
      data: [highConf, medConf, lowConf],
      backgroundColor: ["#3b82f6", "#8b5cf6", "#ec4899"],
      borderColor: "rgba(15, 23, 42, 0.8)",
      borderWidth: 2,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter' }, padding: 20 } } }
  };

  // 3. LINE CHART: Scans over last 7 days
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }).reverse();

  const scansPerDay = Array(7).fill(0);
  history.forEach(h => {
    const d = new Date(h.date || h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const idx = last7Days.indexOf(d);
    if (idx !== -1) scansPerDay[idx]++;
  });

  const lineData = {
    labels: last7Days,
    datasets: [{
      label: "Scans Conducted",
      data: scansPerDay,
      borderColor: "#00c6ff",
      backgroundColor: "rgba(0, 198, 255, 0.1)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#0072ff",
      pointBorderColor: "#fff",
      pointHoverRadius: 6,
    }]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px' }}>
      
      {/* Top Row: Activity Trend Line Chart */}
      <div className="card glass-panel" style={{ padding: '25px', height: '350px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-primary)' }}>Clinical Activity Trend (Last 7 Days)</h3>
        <div style={{ height: 'calc(100% - 45px)' }}>
          <Line data={lineData} options={commonOptions} />
        </div>
      </div>

      {/* Bottom Row: Bar and Doughnut */}
      <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
        
        {/* Severity Bar Chart */}
        <div className="card glass-panel" style={{ padding: '25px', flex: '1 1 500px', height: '350px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-primary)' }}>Diagnosis Severity Distribution</h3>
          <div style={{ height: 'calc(100% - 45px)' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Confidence Doughnut Chart */}
        <div className="card glass-panel" style={{ padding: '25px', flex: '1 1 300px', height: '350px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-primary)' }}>AI Confidence Distribution</h3>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ height: '100%', width: '100%', maxWidth: '300px' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}