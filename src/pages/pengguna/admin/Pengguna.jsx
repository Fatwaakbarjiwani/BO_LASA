import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  activeOperator,
  getAllDonatur,
  getAllOperator,
  getSearchDonatur,
  getSearchOperator,
  nonActiveOperator,
} from "../../../redux/actions/authAction";
import PageNumber from "../../../components/PageNumber";
import {
  setPNDonatur,
  setPNOperator,
} from "../../../redux/reducers/pageNumberReducer";
import {
  setModalCreateOperator,
  setSearchDonatur,
  setSearchOperator,
} from "../../../redux/reducers/authReducer";
import ModalOperator from "../../../components/modalPengguna/CreateOperator";
import { OrbitProgress } from "react-loading-indicators";

const data = [
  { id: 1, nama: "Operator", value: "operator" },
  { id: 2, nama: "Donatur", value: "donatur" },
  { id: 3, nama: "ADMIN Administrasi", value: "administrasi" },
];

export default function Pengguna() {
  const dispatch = useDispatch();
  const { pNDonatur } = useSelector((state) => state.pn);
  const { totalPNDonatur } = useSelector((state) => state.pn);
  const { pNOperator } = useSelector((state) => state.pn);
  const { totalPNOperator } = useSelector((state) => state.pn);
  const { searchDonatur } = useSelector((state) => state.auth);
  const { searchOperator } = useSelector((state) => state.auth);
  const { donatur } = useSelector((state) => state.auth);
  const { operator } = useSelector((state) => state.auth);
  const { modalCreateOperator } = useSelector((state) => state.auth);
  const [isLoading, setLoading] = useState(false);
  const [typeButton, setTypeButton] = useState("operator");
  const [id, setId] = useState("");

  useEffect(() => {
    if (searchOperator) {
      dispatch(getSearchOperator(searchOperator, pNOperator - 1));
    }

    if (
      !searchOperator &&
      (modalCreateOperator == false || isLoading == false)
    ) {
      dispatch(getAllOperator(pNOperator - 1));
    }
    if (searchDonatur) {
      dispatch(getSearchDonatur(searchDonatur, pNDonatur - 1));
    } else {
      dispatch(getAllDonatur(pNDonatur - 1));
    }
  }, [
    searchOperator,
    dispatch,
    pNDonatur,
    pNOperator,
    modalCreateOperator,
    isLoading,
    searchDonatur,
  ]);

  return (
    <>
      <ModalOperator />
      <div className={`mb-4 w-full`}>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Pengguna</h1>
        <div className="flex gap-4 items-center my-5">
          {data.map((item) => (
            <button
              key={item.id}
              className={`${
                typeButton == item?.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-100"
              } p-2 rounded-lg shadow text-sm`}
              onClick={() => setTypeButton(item?.value)}
            >
              {item?.nama}
            </button>
          ))}
        </div>
        {typeButton == "operator" && (
          <div>
            <h1 className="text-start text-3xl font-bold mb-5">
              Daftar Operator
            </h1>
            <div className="flex items-end justify-between">
              <button
                onClick={() => dispatch(setModalCreateOperator(true))}
                className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary bg-primary px-6 py-1 rounded-lg text-white font-semibold"
              >
                Buat Operator Baru
              </button>
              <div className="flex flex-wrap w-3/4 justify-end gap-2 items-center">
                <input
                  type="text"
                  className="outline-none border border-gray-200 bg-gray-100 rounded-lg w-1/2 p-2 text-sm shadow-sm"
                  placeholder="search donatur"
                  value={searchOperator}
                  onChange={(e) => {
                    dispatch(setSearchOperator(e.target.value));
                    dispatch(setPNOperator(1));
                  }}
                />

                <PageNumber
                  total={totalPNOperator}
                  page={pNOperator}
                  setPage={setPNOperator}
                />
              </div>
            </div>
            <div className="w-full shadow-md rounded-md mt-2 overflow-auto">
              <div className="relative overflow-x-auto overflow-y-auto sm:rounded-lg">
                <table className="w-full justify-between text-sm rtl:text-right text-gray-500 table-auto">
                  <thead className="justif text-left text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 rounded-tl-lg rounded-bl-lg"
                      >
                        No
                      </th>
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
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {operator?.map((item, isId) => (
                      <tr
                        key={isId}
                        className="odd:bg-white text-left even:bg-gray-50 border-b  odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium whitespace-nowrap"
                        >
                          {isId + 1}
                        </th>
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium whitespace-nowrap"
                        >
                          {item?.username}
                        </th>
                        <td className="px-6 py-4">{item?.phoneNumber}</td>
                        <td className="px-6 py-4">{item?.email}</td>
                        <td className="px-6 py-4">{item?.createdAt}</td>
                        <td className="px-6 py-4">{item?.address}</td>
                        {item?.status == true ? (
                          <td className="px-6 py-4 text-nowrap font-semibold text-green-400">
                            Aktif
                          </td>
                        ) : (
                          <td className="px-6 py-4 text-nowrap font-semibold">
                            Tidak Aktif
                          </td>
                        )}
                        <td className="px-6 py-4 flex items-center justify-center">
                          <div className="w-full flex items-center gap-2">
                            {isLoading && id == isId ? (
                              <div className="w-full flex justify-center">
                                <OrbitProgress
                                  variant="dotted"
                                  color="#69c53e"
                                  text=""
                                  style={{ fontSize: "6px" }}
                                  textColor=""
                                />
                              </div>
                            ) : item?.status == true ? (
                              <button
                                onClick={() => {
                                  setLoading(true);
                                  setId(isId);
                                  dispatch(nonActiveOperator(item?.id)).finally(
                                    () => setLoading(false)
                                  );
                                }}
                                className="p-1 px-2 rounded-full text-nowrap shadow-md bg-red-500 text-white font-semibold"
                              >
                                Non aktif
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setLoading(true);
                                  setId(isId);
                                  dispatch(activeOperator(item?.id)).finally(
                                    () => setLoading(false)
                                  );
                                }}
                                className="p-1 px-2 rounded-full text-nowrap shadow-md bg-green-500 w-full text-white font-semibold"
                              >
                                Aktif
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
        )}
      </div>
      {/* ======================================================= */}
      {typeButton == "donatur" && (
        <div className={`w-full`}>
          <div className="w-full rounded-md mt-5 overflow-auto">
            <div className="flex items-end justify-between mb-2">
              <h1 className="text-start text-3xl font-bold">Daftar Donatur</h1>
              <div className="flex w-2/3 flex-wrap justify-end gap-2 items-center">
                <input
                  type="text"
                  className="outline-none border border-gray-200 bg-gray-100 rounded-lg w-1/2 p-2 text-sm shadow-sm"
                  placeholder="search donatur"
                  value={searchDonatur}
                  onChange={(e) => {
                    dispatch(setSearchDonatur(e.target.value));
                    dispatch(setPNDonatur(1));
                  }}
                />
                <PageNumber
                  total={totalPNDonatur}
                  page={pNDonatur}
                  setPage={setPNDonatur}
                />
              </div>
            </div>
            <div className="relative overflow-x-auto overflow-y-auto">
              <table className="w-full justify-between text-sm rtl:text-right text-gray-500 table-auto">
                <thead className="justif text-left text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 rounded-tl-lg rounded-bl-lg"
                    >
                      No
                    </th>
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
                  {donatur.map((item, nomor) => (
                    <tr
                      key={item?.id}
                      className="odd:bg-white text-left even:bg-gray-50 border-b  odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                      >
                        {nomor + 1}
                      </th>
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
      )}
    </>
  );
}
