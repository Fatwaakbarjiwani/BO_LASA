import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteZiswaf,
  getCategoryZiswaf,
  getDetailZiswaf,
} from "../../../redux/actions/ziswafAction";
import CreateZiswaf from "../../../components/modalZiswaf/CreateZiswaf";
import {
  setModalCreateFitrah,
  setModalCreateZiswaf,
  setModalEditZiswaf,
} from "../../../redux/reducers/ziswafReducer";
import EditZiswaf from "../../../components/modalZiswaf/EditZiswaf";
import { OrbitProgress } from "react-loading-indicators";
import NominalFitrah from "../../../components/modalZiswaf/NominalFitrah";

export default function Ziswaf() {
  const [selectedCategory, setSelectedCategory] = useState("zakat");
  const [selectedState, setSelectedState] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [id, setId] = useState("");

  const categories = useSelector((state) => state.ziswaf);
  const { modalCreateZiswaf } = useSelector((state) => state.ziswaf);
  const { modalEditZiswaf } = useSelector((state) => state.ziswaf);
  const dispatch = useDispatch();

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };
  useEffect(() => {
    dispatch(getCategoryZiswaf("zakat"));
    dispatch(getCategoryZiswaf("infak"));
    dispatch(getCategoryZiswaf("wakaf"));
    dispatch(getCategoryZiswaf("dskl"));
  }, []);
  useEffect(() => {
    setSelectedState(categories[selectedCategory] || []);
  }, [dispatch, selectedCategory, categories]);
  useEffect(() => {
    if (
      modalCreateZiswaf == false ||
      modalEditZiswaf == false ||
      isLoading == false
    ) {
      dispatch(getCategoryZiswaf(selectedCategory));
    }
  }, [modalCreateZiswaf, modalEditZiswaf, isLoading]);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  return (
    <div className="mb-4 w-full">
      <CreateZiswaf type={selectedCategory} />
      <EditZiswaf type={selectedCategory} />
      <NominalFitrah />
      <h1 className="text-3xl font-extrabold text-gray-800">Ziswaf</h1>
      <div className="w-full shadow-md rounded-lg mt-5 border border-gray-100 p-4 space-y-2">
        <select
          className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-gray-500 w-2/12 px-6 py-1 rounded-lg text-white font-semibold"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="zakat">Zakat</option>
          <option value="infak">Infak</option>
          {/* <option value="wakaf">Wakaf</option> */}
          <option value="dskl">DSKL</option>
        </select>
        <div className="flex justify-between">
          <button
            onClick={() => dispatch(setModalCreateZiswaf(true))}
            className="text-lg  shadow active:scale-105 duration-200 flex items-center justify-center bg-primary w-2/12 px-6 py-1 rounded-lg text-white font-semibold"
          >
            Buat {selectedCategory}
          </button>
          {selectedCategory == "zakat" && (
            <button
              onClick={() => dispatch(setModalCreateFitrah(true))}
              className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary px-6 py-1 rounded-lg text-white font-semibold"
            >
              Detail Zakat Fitrah
            </button>
          )}
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Terkumpul</th>
                <th className="px-6 py-3">Distribusi</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {selectedState.map((item) => (
                <tr
                  key={item?.id}
                  className="bg-white border-b hover:bg-slate-500 hover:text-white"
                >
                  <td className="px-6 py-4">{item?.id}</td>
                  <td className="px-6 py-4">{item?.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {formatNumber(item?.amount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {formatNumber(item?.distribution || 0)}
                  </td>
                  <td className="flex px-6 py-4 text-center justify-center">
                    <button
                      onClick={() => {
                        dispatch(setModalEditZiswaf(true));
                        dispatch(getDetailZiswaf(selectedCategory, item?.id));
                      }}
                      className="active:scale-110 duration-100 px-4 py-1 rounded-full bg-blue-500 text-white font-semibold shadow-md mr-2"
                    >
                      Edit
                    </button>
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
                          dispatch(
                            deleteZiswaf(selectedCategory, item?.id)
                          ).finally(() => setLoading(false));
                        }}
                        className="px-4 py-1 rounded-full bg-red-500 text-white font-semibold shadow-md"
                      >
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
