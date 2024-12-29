import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getEditPresentage,
  getPresentage,
} from "../../redux/actions/transaksiAction";
import { OrbitProgress } from "react-loading-indicators";

export default function TableOperasional() {
  const [edit, setEdit] = useState(false);
  const { persentase } = useSelector((state) => state.summary);
  const dispatch = useDispatch();
  const [nominal, setNominal] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      dispatch(getPresentage());
    }
  }, [dispatch, loading]);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md bg-white shadow-lg border border-gray-100 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Penyaluran Dana
        </h1>

        {/* Tombol Ubah Persentase */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setEdit(!edit)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 focus:outline-none"
          >
            {edit ? "Batal" : "Ubah Persentase"}
          </button>
        </div>

        {/* Konten */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          {!edit ? (
            <div className="text-center">
              <p className="text-gray-700 text-sm">Persentase Operasional:</p>
              <p className="text-3xl font-semibold text-green-600 mt-2">
                {persentase?.persentase?.persen_operasional ?? "0"}%
              </p>
            </div>
          ) : loading ? (
            <div className="flex justify-center">
              <OrbitProgress
                variant="dotted"
                color="#4CAF50"
                style={{ fontSize: "12px" }}
              />
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Masukkan Persentase Baru:
              </label>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Masukkan persentase"
              />
              <button
                onClick={() => {
                  setLoading(true);
                  dispatch(getEditPresentage(nominal)).finally(() => {
                    setLoading(false);
                    setEdit(false);
                  });
                }}
                className="bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 focus:outline-none"
              >
                Submit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
