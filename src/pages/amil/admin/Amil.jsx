import ImportPengguna from "../../../assets/Icon.svg";
import Donatur from "../../../assets/donatur.svg";
import Distribusi from "../../../assets/distribusi.svg";
import ArrowDown from "../../../assets/arrow-down.svg";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAmilCampaign } from "../../../redux/actions/campaignAction";
import PageNumber from "../../../components/PageNumber";
import { setPNAmilCampaign } from "../../../redux/reducers/pageNumberReducer";

export default function Amil() {
  const dispatch = useDispatch();
  const { amilCampaign } = useSelector((state) => state.campaign);
  const { pNAmilCampaign } = useSelector((state) => state.pn);
  const { totalPNAmilCampaign } = useSelector((state) => state.pn);
  useEffect(() => {
    dispatch(getAmilCampaign(pNAmilCampaign - 1));
  }, [dispatch, pNAmilCampaign]);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  return (
    <>
      <div className={`my-5 w-full`}>
        <h1 className="text-start text-3xl font-bold mb-5">Amil</h1>
        <div className="grid grid-cols-4 gap-3">
          <div className="shadow-md rounded-md border border-gray-100 p-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-slate-500 text-start font-semibold">
                  Total Pengguna
                </h1>
                <p className="font-bold text-3xl text-start">40, 689</p>
              </div>
              <img src={ImportPengguna} alt="" />
            </div>
          </div>
          <div className="shadow-md rounded-md border border-gray-100 p-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-slate-500 text-start font-semibold">
                  Total Donatur
                </h1>
                <p className="font-bold text-3xl text-start">10293</p>
              </div>
              <img src={Donatur} alt="" />
            </div>
          </div>
          <div className="shadow-md rounded-md border border-gray-100 p-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-slate-500 text-start font-semibold">
                  Total Distribusi
                </h1>
                <p className="font-bold text-3xl text-start">1.000.000</p>
              </div>
              <img src={Distribusi} alt="" />
            </div>
          </div>
        </div>
        <div className="w-full shadow-md rounded-2xl mt-8 p-4 space-y-4 border border-gray-100 ">
          <div className="flex justify-between items-center items-center">
            <button className="flex items-center justify-center bg-primary rounded-full px-8 py-1">
              <p className="font-bold text-white text-lg mr-2">Amil Campaign</p>
              <img src={ArrowDown} alt="" />
            </button>
            <PageNumber
              total={totalPNAmilCampaign}
              page={pNAmilCampaign}
              setPage={setPNAmilCampaign}
            />
          </div>
          <div className="relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-slate-200 dark:bg-gray-700 dark:text-gray-400 shadow-lg sticky top-0">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 w-80 rounded-tl-lg rounded-bl-lg"
                  >
                    Campaign
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Lokasi
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Target
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Terkumpul
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Amil
                  </th>
                  <th
                    scope="col"
                    className="text-center px-6 py-3 rounded-tr-lg rounded-br-lg"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {amilCampaign.map((item) => (
                  <tr
                    key={item?.id}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                  >
                    <td className="px-6 py-4 text-wrap">
                      {item?.campaignName}
                    </td>
                    <td className="px-6 py-4">{item?.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rp {formatNumber(item?.targetAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rp {formatNumber(item?.currentAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rp {formatNumber(item?.amil)}
                    </td>
                    {item?.active ? (
                      <td className="text-primary text-center font-semibold px-6 py-4">
                        AKTIF
                      </td>
                    ) : (
                      <td className="text-gray-600 text-center font-semibold px-6 py-4">
                        TIDAK AKTIF
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
