import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteNews,
  getAllBerita,
  getDetailBerita,
  getSearchNews,
} from "../../redux/actions/beritaAction";
import { setModalEditBerita } from "../../redux/reducers/beritaReducer";
import { OrbitProgress } from "react-loading-indicators";

export default function TableBerita() {
  const { allBerita } = useSelector((state) => state.berita);
  const { searchBerita } = useSelector((state) => state.berita);
  const { modalCreateBerita } = useSelector((state) => state.berita);
  const { modalEditBerita } = useSelector((state) => state.berita);
  const { pNBerita } = useSelector((state) => state.pn);
  const [id, setId] = useState("");
  const [isLoading, setLoding] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (searchBerita) {
      dispatch(getSearchNews(searchBerita, pNBerita - 1));
    }
    if (
      !searchBerita &&
      (modalCreateBerita == false ||
        modalEditBerita == false ||
        isLoading == false)
    ) {
      dispatch(getAllBerita(pNBerita - 1));
    }
  }, [
    dispatch,
    searchBerita,
    pNBerita,
    modalCreateBerita,
    modalEditBerita,
    isLoading,
  ]);
  return (
    <div className="relative overflow-x-auto overflow-y-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3">
              No
            </th>
            <th scope="col" className="px-6 py-3">
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
            <th scope="col" className="text-center px-6 py-3">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {allBerita.map((item, num) => (
            <tr
              key={item?.id}
              className="odd:bg-white even:bg-gray-50 border-b odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
            >
              <td className="px-6 py-4 font-medium">{num + 1}</td>
              <td className="px-6 py-4 font-medium">{item?.creator}</td>
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
  );
}
