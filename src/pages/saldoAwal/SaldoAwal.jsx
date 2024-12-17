import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryCoa } from "../../redux/actions/ziswafAction";
import { createSaldoAwal } from "../../redux/actions/transaksiAction";
import Swal from "sweetalert2"; // Import SweetAlert2

export default function SaldoAwal() {
  const [coaId, setCoaId] = useState("");
  const [nominal, setNominal] = useState(""); // State for the nominal input
  const { coaCategory } = useSelector((state) => state.ziswaf);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    dispatch(getCategoryCoa());
  }, [dispatch]);

  // Format number as currency (Rupiah)
  const formatCurrency = (value) => {
    const numberValue = value.replace(/[^\d]/g, ""); // Remove non-numeric characters
    return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Format with commas
  };

  const handleNominalChange = (e) => {
    const formattedValue = formatCurrency(e.target.value);
    setNominal(formattedValue);
  };

  const handleSubmit = () => {
    if (!coaId || !nominal) {
      // Show SweetAlert2 if any field is empty
      Swal.fire({
        icon: "warning",
        text: "Kategori COA dan Nominal Saldo Awal harus diisi!",
      });
    } else {
      // Proceed with submitting the form if both fields are filled
      setLoading(true);
      dispatch(
        createSaldoAwal(coaId, parseInt(nominal.replace(/\./g, ""), 10))
      ).finally(() => setLoading(false));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Buat Saldo Awal
      </h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategori COA
        </label>
        <select
          value={coaId}
          onChange={(e) => setCoaId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="" disabled>
            Pilih Kategori
          </option>
          {coaCategory.map((item) => (
            <option key={item.id} value={item.id}>
              {item?.accountCode} {item?.accountName}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nominal Saldo Awal
        </label>
        <input
          type="text"
          value={nominal}
          onChange={handleNominalChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Masukkan Nominal"
        />
      </div>

      {loading ? (
        <button className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          Memproses...
        </button>
      ) : (
        <button
          onClick={handleSubmit} // Use the handleSubmit function for validation
          className="w-full p-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Submit
        </button>
      )}
    </div>
  );
}
