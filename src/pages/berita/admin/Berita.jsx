import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteNews,
  getAllBerita,
  getDetailBerita,
} from "../../../redux/actions/beritaAction";
import {
  setModalCreateBerita,
  setModalEditBerita,
} from "../../../redux/reducers/beritaReducer";
import CreateBerita from "../../../components/modalBerita/CreateBerita";
import EditBerita from "../../../components/modalBerita/EditBerita";
import { OrbitProgress } from "react-loading-indicators";
import PageNumber from "../../../components/PageNumber";
import { setPNBerita } from "../../../redux/reducers/pageNumberReducer";

export default function Berita() {
  const dispatch = useDispatch();
  const { pNBerita } = useSelector((state) => state.pn);
  const { totalPNBerita } = useSelector((state) => state.pn);
  const { allBerita } = useSelector((state) => state.berita);
  const { modalCreateBerita } = useSelector((state) => state.berita);
  const { modalEditBerita } = useSelector((state) => state.berita);
  const [id, setId] = useState("");
  const [isLoading, setLoding] = useState(false);
  useEffect(() => {
    if (
      modalCreateBerita == false ||
      modalEditBerita == false ||
      isLoading == false
    ) {
      dispatch(getAllBerita(pNBerita - 1));
    }
  }, [dispatch, pNBerita, modalCreateBerita, modalEditBerita, isLoading]);
  return (
    <>
      <CreateBerita />
      <EditBerita />
      <div className={`my-5 w-full`}>
        <div className="flex gap-4 items-center">
          <h1 className="text-start text-3xl font-bold">Berita</h1>
          <button
            onClick={() => dispatch(setModalCreateBerita(true))}
            className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary px-6 py-1 rounded-full text-white font-semibold"
          >
            Buat Berita
          </button>
        </div>
        <div className="w-full space-y-2 shadow-md rounded-2xl mt-5 border border-gray-100 p-4">
          <PageNumber
            total={totalPNBerita}
            page={pNBerita}
            setPage={setPNBerita}
          />
          <div className="relative overflow-x-auto overflow-y-auto shadow-md rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 rounded-tl-lg rounded-bl-lg"
                  >
                    Pembuat
                  </th>
                  <th scope="col" className="px-6 py-3 w-60">
                    Judul
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tema
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tanggal
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
                {allBerita.map((item) => (
                  <tr
                    key={item?.id}
                    className="odd:bg-white even:bg-gray-50 border-b odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                  >
                    <td className="px-6 py-4 font-medium">
                      {item?.creator}
                    </td>
                    <td className="px-6 py-4">{item?.title}</td>
                    <td className="px-6 py-4">{item?.newsTopic}</td>
                    <td className="px-6 py-4">{item?.date}</td>
                    <td className="px-6 py-4 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => {
                            dispatch(getDetailBerita(item?.id));
                            dispatch(setModalEditBerita(true));
                          }}
                          className="w-16 h-7 rounded-full shadow-md bg-blue-500 text-white font-semibold active:scale-105"
                        >
                          Edit
                        </button>
                        {isLoading && id == item?.id ? (
                          <div className="w-full flex justify-center mt-2">
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
                              setLoding(true);
                              setId(item?.id);
                              dispatch(deleteNews(item?.id)).finally(() =>
                                setLoding(false)
                              );
                            }}
                            className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold mt-1 active:scale-105"
                          >
                            Tutup
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
    </>
  );
}
