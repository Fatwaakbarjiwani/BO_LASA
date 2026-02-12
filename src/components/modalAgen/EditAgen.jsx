import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import { editAgen } from "../../redux/actions/agenAction";
import {
  setDetailAgen,
  setModalEditAgen,
} from "../../redux/reducers/agenReducer";

export default function EditAgen() {
  const dispatch = useDispatch();
  const { modalEditAgen, detailAgen } = useSelector((state) => state.agen);
  const [isLoading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [targetAmount, setTargetAmount] = useState(0);

  useEffect(() => {
    if (detailAgen?.id) {
      setUsername(detailAgen?.username || "");
      setPhoneNumber(detailAgen?.phoneNumber || "");
      setEmail(detailAgen?.email || "");
      setPassword("");
      setAddress(detailAgen?.address || "");
      setTargetAmount(detailAgen?.targetAmount ?? 0);
    }
  }, [detailAgen]);

  useEffect(() => {
    if (modalEditAgen === false) {
      dispatch(setDetailAgen(null));
    }
  }, [dispatch, modalEditAgen]);

  if (!modalEditAgen) {
    return null;
  }

  const handleEditAgen = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(
      editAgen(detailAgen?.id, {
        username,
        phoneNumber,
        email,
        password: password || undefined,
        address,
        targetAmount: Number(targetAmount) || 0,
      })
    ).finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setModalEditAgen(false))}
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600">
          Edit Agen POS
        </h2>
        <form className="space-y-4" onSubmit={handleEditAgen}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nomor Telepon
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan nomor telepon"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password (kosongkan jika tidak diubah)
            </label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan password baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Alamat
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan alamat"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Target Amount
            </label>
            <input
              type="number"
              min={0}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value || 0)}
            />
          </div>
          <div className="space-y-2 pt-2">
            <button
              type="button"
              className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
              onClick={() => dispatch(setModalEditAgen(false))}
            >
              Batal
            </button>
            {isLoading ? (
              <div className="w-full flex justify-center mt-8">
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
                className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200"
              >
                Simpan Perubahan
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
