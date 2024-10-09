import ArrowDown from "../../../assets/arrow-down.svg";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSummaryDashboard } from "../../../redux/actions/transaksiAction";
import SummaryDashboard from "../../../components/SummaryDashboard";
import { getAllCampaignCategory } from "../../../redux/actions/campaignAction";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { allCampaignCategory } = useSelector((state) => state.campaign);
  useEffect(() => {
    dispatch(getSummaryDashboard());
    dispatch(getAllCampaignCategory());
  }, [dispatch]);

  return (
    <>
      <div className={`w-full`}>
        <h1 className="text-start text-3xl font-bold my-5">Dashboard</h1>
        <SummaryDashboard />
        <div className="w-full shadow-md rounded-md mt-10 border border-gray-100 ">
          <select className="text-white px-4 flex items-center justify-center w-52 h-10 bg-primary rounded-full mb-5 mx-4 mt-4">
            {allCampaignCategory.map((item) => (
              <option key={item?.id} value="">
                <p className="font-bold text-white text-lg mr-2">
                  {item?.campaignCategory}
                </p>
                <img src={ArrowDown} alt="" />
              </option>
            ))}
          </select>
          <div className="relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg mx-4 my-2">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-slate-200 dark:bg-gray-700 dark:text-gray-400 shadow-lg sticky top-0">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 rounded-tl-lg rounded-bl-lg"
                  >
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Campaign
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Pembuat
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Lokasi
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tanggal & Waktu
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Target
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Terkumpul
                  </th>
                  <th scope="col" className="px-6 py-3">
                    status
                  </th>
                  <th
                    scope="col"
                    className="text-center px-6 py-3 rounded-tr-lg rounded-br-lg"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white ">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                  >
                    1
                  </th>
                  <td className="px-6 py-4">
                    Berdonasi untuk lansia & kaum dhuafa
                  </td>
                  <td className="px-6 py-4">Semarang</td>
                  <td className="px-6 py-4">Semarang, Jawa Tengah</td>
                  <td className="px-6 py-4">12.09.2024 - 12.53 PM</td>
                  <td className="px-6 py-4">Rp 2.000.000</td>
                  <td className="px-6 py-4">Rp 1.000.000</td>
                  <td className="text-primary font-semibold px-6 py-4">
                    Aktif
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <button className="w-16 h-7 rounded-full shadow-md bg-blue-500 text-white font-semibold">
                        Edit
                      </button>
                      <button className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold mt-1">
                        Tutup
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    1
                  </th>
                  <td className="px-6 py-4">
                    Berdonasi untuk lansia & kaum dhuafa
                  </td>
                  <td className="px-6 py-4">Semarang</td>
                  <td className="px-6 py-4">Semarang, Jawa Tengah</td>
                  <td className="px-6 py-4">12.09.2024 - 12.53 PM</td>
                  <td className="px-6 py-4">Rp 2.000.000</td>
                  <td className="px-6 py-4">Rp 1.000.000</td>
                  <td className="text-primary font-semibold px-6 py-4">
                    Aktif
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <button className="w-16 h-7 rounded-full shadow-md bg-blue-500 text-white font-semibold">
                        Edit
                      </button>
                      <button className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold mt-1">
                        Tutup
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    1
                  </th>
                  <td className="px-6 py-4">
                    Berdonasi untuk lansia & kaum dhuafa
                  </td>
                  <td className="px-6 py-4">Semarang</td>
                  <td className="px-6 py-4">Semarang, Jawa Tengah</td>
                  <td className="px-6 py-4">12.09.2024 - 12.53 PM</td>
                  <td className="px-6 py-4">Rp 2.000.000</td>
                  <td className="px-6 py-4">Rp 1.000.000</td>
                  <td className="text-primary font-semibold px-6 py-4">
                    Aktif
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <button className="w-16 h-7 rounded-full shadow-md bg-blue-500 text-white font-semibold">
                        Edit
                      </button>
                      <button className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold mt-1">
                        Tutup
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    1
                  </th>
                  <td className="px-6 py-4">
                    Berdonasi untuk lansia & kaum dhuafa
                  </td>
                  <td className="px-6 py-4">Semarang</td>
                  <td className="px-6 py-4">Semarang, Jawa Tengah</td>
                  <td className="px-6 py-4">12.09.2024 - 12.53 PM</td>
                  <td className="px-6 py-4">Rp 2.000.000</td>
                  <td className="px-6 py-4">Rp 1.000.000</td>
                  <td className="text-primary font-semibold px-6 py-4">
                    Aktif
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <button className="w-16 h-7 rounded-full shadow-md bg-blue-500 text-white font-semibold">
                        Edit
                      </button>
                      <button className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold mt-1">
                        Tutup
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    1
                  </th>
                  <td className="px-6 py-4">
                    Berdonasi untuk lansia & kaum dhuafa
                  </td>
                  <td className="px-6 py-4">Semarang</td>
                  <td className="px-6 py-4">Semarang, Jawa Tengah</td>
                  <td className="px-6 py-4">12.09.2024 - 12.53 PM</td>
                  <td className="px-6 py-4">Rp 2.000.000</td>
                  <td className="px-6 py-4">Rp 1.000.000</td>
                  <td className="text-primary font-semibold px-6 py-4">
                    Aktif
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <button className="w-16 h-7 rounded-full shadow-md bg-blue-500 text-white font-semibold">
                        Edit
                      </button>
                      <button className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold mt-1">
                        Tutup
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    1
                  </th>
                  <td className="px-6 py-4">
                    Berdonasi untuk lansia & kaum dhuafa
                  </td>
                  <td className="px-6 py-4">Semarang</td>
                  <td className="px-6 py-4">Semarang, Jawa Tengah</td>
                  <td className="px-6 py-4">12.09.2024 - 12.53 PM</td>
                  <td className="px-6 py-4">Rp 2.000.000</td>
                  <td className="px-6 py-4">Rp 1.000.000</td>
                  <td className="text-primary font-semibold px-6 py-4">
                    Aktif
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <button className="w-16 h-7 rounded-full shadow-md bg-blue-500 text-white font-semibold">
                        Edit
                      </button>
                      <button className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold mt-1">
                        Tutup
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    1
                  </th>
                  <td className="px-6 py-4">
                    Berdonasi untuk lansia & kaum dhuafa
                  </td>
                  <td className="px-6 py-4">Semarang</td>
                  <td className="px-6 py-4">Semarang, Jawa Tengah</td>
                  <td className="px-6 py-4">12.09.2024 - 12.53 PM</td>
                  <td className="px-6 py-4">Rp 2.000.000</td>
                  <td className="px-6 py-4">Rp 1.000.000</td>
                  <td className="text-primary font-semibold px-6 py-4">
                    Aktif
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <button className="w-16 h-7 rounded-full shadow-md bg-blue-500 text-white font-semibold">
                        Edit
                      </button>
                      <button className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold mt-1">
                        Tutup
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    1
                  </th>
                  <td className="px-6 py-4">
                    Berdonasi untuk lansia & kaum dhuafa
                  </td>
                  <td className="px-6 py-4">Semarang</td>
                  <td className="px-6 py-4">Semarang, Jawa Tengah</td>
                  <td className="px-6 py-4">12.09.2024 - 12.53 PM</td>
                  <td className="px-6 py-4">Rp 2.000.000</td>
                  <td className="px-6 py-4">Rp 1.000.000</td>
                  <td className="text-primary font-semibold px-6 py-4">
                    Aktif
                  </td>
                  <td className="px-6 py-4 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <button className="w-16 h-7 rounded-full shadow-md bg-blue-500 text-white font-semibold">
                        Edit
                      </button>
                      <button className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold mt-1">
                        Tutup
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
