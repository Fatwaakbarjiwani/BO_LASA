import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllDonatur,
  getAllOperator,
} from "../../../redux/actions/authAction";
import PageNumber from "../../../components/PageNumber";
import {
  setPNDonatur,
  setPNOperator,
} from "../../../redux/reducers/pageNumberReducer";
import { setModalCreateOperator } from "../../../redux/reducers/authReducer";
import ModalOperator from "../../../components/modalPengguna/CreateOperator";
import { OrbitProgress } from "react-loading-indicators";

export default function Pengguna() {
  const dispatch = useDispatch();
  const { pNDonatur } = useSelector((state) => state.pn);
  const { totalPNDonatur } = useSelector((state) => state.pn);
  const { pNOperator } = useSelector((state) => state.pn);
  const { totalPNOperator } = useSelector((state) => state.pn);
  const { donatur } = useSelector((state) => state.auth);
  const { operator } = useSelector((state) => state.auth);
  const { modalCreateOperator } = useSelector((state) => state.auth);
  const [isLoading, setLoading] = useState(false);
  const [id, setId] = useState("");
  useEffect(() => {
    if (modalCreateOperator == false) {
      dispatch(getAllOperator(pNOperator - 1));
    }
    dispatch(getAllDonatur(pNDonatur - 1));
  }, [dispatch, pNDonatur, pNOperator, modalCreateOperator]);

  return (
    <>
      <ModalOperator />
      <div className={`mt-5 w-full`}>
        <h1 className="text-start text-3xl font-bold mb-5 flex gap-4">
          Daftar Operator
          <button
            onClick={() => dispatch(setModalCreateOperator(true))}
            className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary bg-primary px-6 py-1 rounded-full text-white font-semibold"
          >
            Buat Operator Baru
          </button>
        </h1>
        <div className="w-full shadow-md rounded-md mt-5 border border-gray-100 overflow-auto">
          <PageNumber
            total={totalPNOperator}
            page={pNOperator}
            setPage={setPNOperator}
          />
          <div className="relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg m-4">
            <table className="w-full justify-between text-sm rtl:text-right text-gray-500 table-auto">
              <thead className="justif text-left text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
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
                  <th scope="col" className="px-6 py-3">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {operator?.map((item) => (
                  <tr
                    key={item?.id}
                    className="odd:bg-white text-left even:bg-gray-50 border-b  odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                  >
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
                    <td className="px-6 py-4 flex items-center justify-center">
                      <div className="w-full flex items-center gap-2">
                        {isLoading && id == item?.id ? (
                          <div className="w-full flex justify-center">
                            <OrbitProgress
                              variant="dotted"
                              color="#69c53e"
                              text=""
                              style={{ fontSize: "6px" }}
                              textColor=""
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setLoading(true);
                              setId(item?.id);
                            }}
                            className="p-1 px-2 rounded-full shadow-md bg-red-500 text-white font-semibold"
                          >
                            Non aktif
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ======================================================= */}
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
              <thead className="justif text-left text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
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
                  <tr
                    key={item?.id}
                    className="odd:bg-white text-left even:bg-gray-50 border-b  odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                  >
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
