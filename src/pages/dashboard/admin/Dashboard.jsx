import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSummaryDashboard } from "../../../redux/actions/transaksiAction";
import SummaryDashboard from "../../../components/SummaryDashboard";
import { getChart1, getChart2 } from "../../../redux/actions/campaignAction";
import PinBarChart from "../../../components/chart/PinBarChart";
import PieChart from "../../../components/chart/PieChart";

export default function Dashboard() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSummaryDashboard());
    dispatch(getChart1());
    dispatch(getChart2());
  }, [dispatch]);

  return (
    <>
      <div className={`w-full`}>
        <h1 className="text-start text-3xl font-bold my-5">Dashboard</h1>
        <SummaryDashboard />
        <div className="grid grid-cols-2 items-start mt-10">
          <PinBarChart />
          <PieChart />
        </div>
      </div>
    </>
  );
}
