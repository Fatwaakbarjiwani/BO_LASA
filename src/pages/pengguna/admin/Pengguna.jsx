import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllDonatur } from "../../../redux/actions/authAction";
import PageNumber from "../../../components/PageNumber";
import { setPNDonatur } from "../../../redux/reducers/pageNumberReducer";

export default function Pengguna() {
  const dispatch = useDispatch();
  const { pNDonatur } = useSelector((state) => state.pn);
  const { totalPNDonatur } = useSelector((state) => state.pn);
  const { donatur } = useSelector((state) => state.auth);
  useEffect(() => {
    dispatch(getAllDonatur(pNDonatur - 1));
  }, [dispatch, pNDonatur]);
  
  return (
    <>
      <div className={`mt-5 w-full`}>
        <h1 className="text-start text-3xl font-bold mb-5">Daftar Donatur</h1>
        <div className="w-full shadow-md rounded-md mt-5 border border-gray-100 overflow-auto">
          <PageNumber
            total={totalPNDonatur}
            page={pNDonatur}
            setPage={setPNDonatur}
          />
          <div className="relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg m-4">
            <table className="w-full justify-between text-sm rtl:text-right text-gray-500 table-auto">
              <thead className="justif text-left text-xs text-gray-700 uppercase bg-slate-200 dark:bg-gray-700 dark:text-gray-400 shadow-lg sticky top-0">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 rounded-tl-lg rounded-bl-lg"
                  >
                    Nama
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Handphone
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tanggal Pembuatan
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Alamat
                  </th>
                </tr>
              </thead>
              <tbody>
                {donatur.map((item) => (
                  <tr key={item?.id} className="odd:bg-white text-left even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white ">
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {item?.username}
                    </th>
                    <td className="px-6 py-4">{item?.phoneNumber}</td>
                    <td className="px-6 py-4">{item?.email}</td>
                    <td className="px-6 py-4">{item?.createdAt}</td>
                    <td className="px-6 py-4">{item?.address}</td>
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
