import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { useSelector } from "react-redux";

// Register the required components
Chart.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const { chart2 } = useSelector((state) => state.campaign);

  const totalCurrentAmount = chart2?.totalCurrentAmount || 0;
  const totalTargetAmount = chart2?.totalTargetAmount || 0;
  const remainingAmount = totalTargetAmount - totalCurrentAmount;

  const data = {
    labels: ["Total Saat Ini", "Sisa Target"],
    datasets: [
      {
        label: "Jumlah (IDR)",
        data: [totalCurrentAmount, remainingAmount > 0 ? remainingAmount : 0],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
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
        text: "DIAGRAM PENDAPATAN DAN TARGET CAMPAIGN",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${
              tooltipItem.label
            }: Rp ${tooltipItem.raw.toLocaleString()}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-[60%] m-auto">
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;
