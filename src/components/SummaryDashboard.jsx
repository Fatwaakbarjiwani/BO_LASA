import ImportPengguna from "../assets/Icon.svg";
import Donatur from "../assets/donatur.svg";
import Distribusi from "../assets/distribusi.svg";
import Transaksi from "../assets/transaksi.svg";
import { useSelector } from "react-redux";

export default function SummaryDashboard() {
  const { summaryDashboard } = useSelector((state) => state.summary);
   const formatNumber = (value) => {
     return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
   };
  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="bg-white shadow-md rounded-md border border-gray-100">
        <div className="flex justify-between items-center p-2 w-full gap-4">
          <div>
            <h1 className="text-slate-500 text-start font-semibold">
              Total Penerima
            </h1>
            <p className="font-bold text-xl text-primary text-start">
              {summaryDashboard?.totalDistributionReceiver||0}
            </p>
          </div>
          <img className="" src={ImportPengguna} alt="" />
        </div>
      </div>
      <div className="bg-white shadow-md rounded-md border border-gray-100">
        <div className="flex justify-between items-center p-2 w-full gap-4">
          <div>
            <h1 className="text-slate-500 text-start font-semibold">
              Total Donatur
            </h1>
            <p className="font-bold text-xl text-primary text-start">
              {summaryDashboard?.totalDonatur||0}
            </p>
          </div>
          <img className="" src={Donatur} alt="" />
        </div>
      </div>
      <div className="bg-white shadow-md rounded-md border border-gray-100">
        <div className="flex justify-between items-center p-2 w-full gap-4">
          <div>
            <h1 className="text-slate-500 text-start font-semibold">
              Total Distribusi
            </h1>
            <p className="font-bold text-xl text-primary text-start">
              {formatNumber(summaryDashboard?.totalDistributionAmount||0)}
            </p>
          </div>
          <img className="" src={Distribusi} alt="" />
        </div>
      </div>
      <div className="bg-white shadow-md rounded-md border border-gray-100">
        <div className="flex justify-between items-center p-2 w-full gap-4">
          <div>
            <h1 className="text-slate-500 text-start font-semibold">
              Total Transaksi
            </h1>
            <p className="font-bold text-xl text-primary text-start">
              {formatNumber(summaryDashboard?.totalTransactionAmount||0)}
            </p>
          </div>
          <img className="" src={Transaksi} alt="" />
        </div>
      </div>
    </div>
  );
}
