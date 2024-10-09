import { useEffect } from "react";
import ImportPengguna from "../../../assets/Icon.svg";
import Donatur from "../../../assets/donatur.svg";
import { useDispatch, useSelector } from "react-redux";
import { getTransaction } from "../../../redux/actions/transaksiAction";
import PageNumber from "../../../components/PageNumber";
import { setPNTransaksi } from "../../../redux/reducers/pageNumberReducer";

export default function Transaksi() {
  const dispatch = useDispatch();
  const { transaction } = useSelector((state) => state.summary);
  const { totalPNTransaksi } = useSelector((state) => state.pn);
  const { pNTransaksi } = useSelector((state) => state.pn);
  useEffect(() => {
    dispatch(getTransaction(pNTransaksi - 1));
  }, [dispatch, pNTransaksi]);

    const formatNumber = (value) => {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
  return (
    <>
      <div className={`my-5 w-full`}>
        <h1 className="text-start text-3xl font-bold mb-5">Transaksi</h1>
        <div className="grid grid-cols-4 gap-4">
          <div className="shadow-md rounded-md border border-gray-100">
            <div className="flex justify-between items-center p-2 gap-5">
              <div>
                <h1 className="text-slate-500 text-start font-semibold ">
                  Total Pengguna
                </h1>
                <p className="font-bold text-3xl text-start">40, 689</p>
              </div>
              <img src={ImportPengguna} alt="" />
            </div>
          </div>
          <div className="shadow-md rounded-md border border-gray-100">
            <div className="flex justify-between items-center p-2 gap-5">
              <div>
                <h1 className="text-slate-500 text-start font-semibold ">
                  Jumlah Transaksi
                </h1>
                <p className="font-bold text-3xl text-start">10293</p>
              </div>
              <img src={Donatur} alt="" />
            </div>
          </div>
        </div>
        <div className="w-full shadow-md rounded-md mt-10 border border-gray-100">
          <div className="flex justify-between w-full items-center p-4">
            <h1 className="text-start text-3xl font-bold">
              Transaksi Donatur
            </h1>
            <div className="flex justify-center">
              <PageNumber
                total={totalPNTransaksi}
                page={pNTransaksi}
                setPage={setPNTransaksi}
              />
            </div>
          </div>
          <div className="relative  overflow-y-auto shadow-md sm:rounded-lg mx-4 my-2">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-slate-200 dark:bg-gray-700 dark:text-gray-400 shadow-lg sticky top-0">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 rounded-tl-lg rounded-bl-lg"
                  >
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3">
                    PIC
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Handphone
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Pesan
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Donasi
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Nama Campaign
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tanggal
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Channel
                  </th>
                  <th
                    scope="col"
                    className="text-center px-6 py-3 rounded-tr-lg rounded-br-lg"
                  >
                    Metode
                  </th>
                </tr>
              </thead>
              <tbody>
                {transaction.map((item) => (
                  <tr
                    key={item.id}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {item?.id}
                    </th>
                    <td className="px-6 py-4">{item?.username}</td>
                    <td className="px-6 py-4">Demak</td>
                    <td className="px-6 py-4">{item?.phoneNumber}</td>
                    <td className="px-6 py-4">{item?.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap">Rp {formatNumber(item?.transactionAmount)}</td>
                    <td className="px-6 py-4 ">{item?.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                      {item?.categoryData?.campaignName}
                    </td>

                    <td className="px-6 py-4">{item?.transactionDate}</td>
                    <td className="text-[#69C53E] font-semibold px-6 py-4">
                      {item?.channel}
                    </td>
                    <td className="text-[#69C53E] font-semibold px-6 py-4">
                      {item?.method}
                    </td>
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
