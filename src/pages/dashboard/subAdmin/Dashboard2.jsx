import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSummaryDashboardOperator } from "../../../redux/actions/transaksiAction";
import { getChart1, getChart2 } from "../../../redux/actions/campaignAction";
import PinBarChart from "../../../components/chart/PinBarChart";
import PieChart from "../../../components/chart/PieChart";
import SummaryDashboardOperator from "../../../components/SummaryDashboardOperator";

export default function Dashboard2() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getSummaryDashboardOperator());
    dispatch(getChart1());
    dispatch(getChart2());
  }, [dispatch]);

  return (
    <>
      <div className={`w-full`}>
        <h1 className="text-start text-3xl font-bold my-5">
          Dashboard Operator
        </h1>
        <SummaryDashboardOperator />
        <div className="grid grid-cols-2 items-start mt-10">
          <PinBarChart />
          <PieChart />
        </div>
      </div>
    </>
  );
}
