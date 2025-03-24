import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import {
  createFitrah,
  getDetailFitrah,
  getNominalFitrah,
} from "../../redux/actions/ziswafAction";
import { setModalCreateFitrah } from "../../redux/reducers/ziswafReducer";
import { IoClose } from "react-icons/io5";

function NominalFitrah() {
  const dispatch = useDispatch();
  const { modalCreateFitrah, nominalFitrah, detailFitrah } = useSelector(
    (state) => state.ziswaf
  );
  const [isLoading, setLoading] = useState(false);
  const [nominal, setNominal] = useState("");

  useEffect(() => {
    if (!isLoading) {
      dispatch(getNominalFitrah());
      dispatch(getDetailFitrah(2));
    }
  }, [dispatch, isLoading]);

  if (!modalCreateFitrah) {
    return null;
  }

  const handleCreateFitrah = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(createFitrah(parseInt(nominal.replace(/\./g, ""), 10))).finally(
      () => setLoading(false)
    );
  };
  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative m-4 max-h-[90vh] overflow-y-auto">
        {/* Tombol Close */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setModalCreateFitrah(false))}
        >
          <IoClose />
        </button>

        {/* Judul */}
        <h2 className="text-3xl font-bold text-center text-gray-700 capitalize">
          Zakat Fitrah
        </h2>

        {/* Detail Zakat dengan Desain Baru */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
            Informasi Zakat Fitrah
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <span className="text-orange-500 text-3xl font-bold">
                {detailFitrah.total_zakat_fitrah}
              </span>
              <span className="text-gray-500 text-sm">Dana Terkumpul</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-blue-500 text-3xl font-bold">
                {formatNumber(detailFitrah.jumlah_donatur || 0)}
              </span>
              <span className="text-gray-500 text-sm">Jumlah Donatur</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-green-500 text-3xl font-bold">
                {formatNumber(nominalFitrah.nomZakat || 0)}
              </span>
              <span className="text-gray-500 text-sm">Nominal Zakat</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-6 mt-4" onSubmit={handleCreateFitrah}>
          {/* Input Nominal */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
              Nominal Zakat Fitrah Baru
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
              placeholder="Masukkan nominal"
              value={nominal}
              onChange={(e) => {
                let inputValue = e.target.value.replace(/[^\d]/g, "");
                inputValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                setNominal(inputValue);
              }}
            />
          </div>

          {/* Tombol Aksi */}
          <div className="space-y-3">
            <button
              type="button"
              className="px-6 py-3 w-full bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 active:scale-105 transition duration-200"
              onClick={() => dispatch(setModalCreateFitrah(false))}
            >
              Batal
            </button>
            {isLoading ? (
              <div className="w-full flex justify-center">
                <OrbitProgress
                  variant="dotted"
                  color="#69c53e"
                  text=""
                  style={{ fontSize: "8px" }}
                  textColor=""
                />
              </div>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 w-full bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-105 transition duration-200 capitalize"
              >
                Buat Nominal
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default NominalFitrah;
