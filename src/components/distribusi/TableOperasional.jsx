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
    <div className="p-6 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b-2 pb-2 border-primary">
        Penyaluran Dana
      </h1>

      {/* Button to toggle edit mode */}
      <div className="mb-4">
        <button
          onClick={() => setEdit(!edit)}
          className="bg-primary p-2 rounded text-white font-semibold hover:bg-primary-dark focus:outline-none"
        >
          {edit ? "Keluar" : "Ubah Prosentase"}
        </button>
      </div>

      {/* Display persentase or edit input */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-white shadow-md rounded-lg">
          {!edit ? (
            <div className="text-gray-600 font-bold">
              <p>
                <span className="font-normal">Persentase : </span>
                <span className="text-lg">
                  {persentase?.persentase?.persen_operasional} %
                </span>
              </p>
            </div>
          ) : loading ? (
            <div className="w-full flex justify-center">
              <OrbitProgress
                variant="dotted"
                color="#69c53e"
                style={{ fontSize: "12px" }}
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-2">
                Masukkan Persentase:
              </label>
              <input
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
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
                className="mt-4 bg-primary text-white font-semibold p-2 rounded-md hover:bg-primary-dark focus:outline-none"
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
