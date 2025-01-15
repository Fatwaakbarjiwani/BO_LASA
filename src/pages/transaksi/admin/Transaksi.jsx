import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSearchTransaksi,
  getTransaction,
} from "../../../redux/actions/transaksiAction";
import PageNumber from "../../../components/PageNumber";
import { setPNTransaksi } from "../../../redux/reducers/pageNumberReducer";
import { setSearchTransaksi } from "../../../redux/reducers/transaction&summaryReducer";

export default function Transaksi() {
  const dispatch = useDispatch();
  const { transaction } = useSelector((state) => state.summary);
  const { searchTransaksi } = useSelector((state) => state.summary);
  const { totalPNTransaksi } = useSelector((state) => state.pn);
  const { pNTransaksi } = useSelector((state) => state.pn);
  useEffect(() => {
    if (searchTransaksi) {
      dispatch(getSearchTransaksi(searchTransaksi, pNTransaksi - 1));
    } else dispatch(getTransaction(pNTransaksi - 1));
  }, [searchTransaksi, dispatch, pNTransaksi]);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  return (
    <>
      <div className={`mb-4 w-full`}>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
          Transaksi
        </h1>
        <div className="w-full rounded-md mt-4">
          <div className="flex justify-between w-full items-end ">
            <h1 className="text-start text-3xl font-bold">Transaksi Donatur</h1>
            <div className="flex w-2/4 flex-wrap justify-end gap-2">
              <input
                type="text"
                className="outline-none border border-gray-200 rounded-lg w-1/2 p-2 text-sm bg-gray-200"
                placeholder="search transaksi donatur"
                value={searchTransaksi}
                onChange={(e) => {
                  dispatch(setSearchTransaksi(e.target.value));
                  dispatch(setPNTransaksi(1));
                }}
              />
              <PageNumber
                total={totalPNTransaksi}
                page={pNTransaksi}
                setPage={setPNTransaksi}
              />
            </div>
          </div>
          <div className="relative overflow-y-auto my-2">
            <table className="w-full text-sm text-left text-gray-500 ">
              <thead className="text-xs text-gray-700 uppercase bg-slate-200  shadow-lg sticky top-0">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 rounded-tl-lg rounded-bl-lg"
                  >
                    No
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3">
                    No Bukti
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
                {transaction.map((item, nomor) => (
                  <tr
                    key={item.id}
                    className="odd:bg-white  even:bg-gray-50 border-b  odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {nomor + 1}
                    </th>
                    <td className="px-6 py-4">{item?.username}</td>
                    <td className="px-6 py-4">Demak</td>
                    <td className="px-6 py-4">{item?.phoneNumber}</td>
                    <td className="px-6 py-4">{item?.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rp {formatNumber(item?.transactionAmount || 0)}
                    </td>
                    <td className="px-6 py-4 ">{item?.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                      {item?.categoryData?.campaignName}
                    </td>

                    <td className="px-6 py-4">{item?.transactionDate}</td>
                    <td
                      className={`${
                        item?.channel === "ONLINE"
                          ? "text-[#69C53E]"
                          : "text-gray-600"
                      } px-6 py-4`}
                    >
                      {item?.channel}
                    </td>
                    {/* <td className={`${item?method == "ONLINE"?"text-blue-600":"text-orange-600"} font-semibold px-6 py-4`}>
                      {item?.method}
                    </td> */}
                    <td
                      className={`${
                        item?.method === "ONLINE"
                          ? "text-blue-600"
                          : "text-orange-600"
                      } `}
                    >
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
