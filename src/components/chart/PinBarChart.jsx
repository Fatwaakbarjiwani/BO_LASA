import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector } from "react-redux";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PinBarChart() {
  const { chart1 } = useSelector((state) => state.campaign);

  const data = chart1
    ? {
        labels: ["Infak", "Zakat", "Campaign", "Wakaf", "DSKL"],
        datasets: [
          {
            label: "Dana yang terkumpul dalam Rupiah",
            data: [
              chart1.infak || 0,
              chart1.zakat || 0,
              chart1.campaign || 0,
              chart1.wakaf || 0,
              chart1.dskl || 0,
            ],
            backgroundColor: [
              "#1f77b4",
              "#ff7f0e",
              "#2ca02c",
              "#d62728",
              "#9467bd",
            ],
          },
        ],
      }
    : {
        labels: ["Infak", "Zakat", "Campaign", "Wakaf", "DSKL"],
        datasets: [
          {
            label: "Dana yang terkumpul dalam Rupiah",
            data: [0, 0, 0, 0, 0],
            backgroundColor: [
              "#1f77b4",
              "#ff7f0e",
              "#2ca02c",
              "#d62728",
              "#9467bd",
            ],
          },
        ],
      };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "DIAGRAM PENDAPATAN CAMPAIGN DAN ZISWAF",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString(), // Format numbers with commas
        },
      },
    },
  };

  return (
    <div className="w-full m-auto">
      <Bar data={data} options={options} />
    </div>
  );
}

export default PinBarChart;
