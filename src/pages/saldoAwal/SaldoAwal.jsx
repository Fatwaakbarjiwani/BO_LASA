import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryCoa, getSaldoCoa } from "../../redux/actions/ziswafAction";
import { createSaldoAwal } from "../../redux/actions/transaksiAction";
// import Swal from "sweetalert2"; // Import SweetAlert2
import { IoMdArrowBack } from "react-icons/io";

export default function SaldoAwal() {
  const { coaCategory } = useSelector((state) => state.ziswaf);
  const { saldoCoa } = useSelector((state) => state.summary);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [button, setButton] = useState(false);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    dispatch(getCategoryCoa());
    {
      !loading && dispatch(getSaldoCoa());
    }
  }, [dispatch, loading]);

  useEffect(() => {
    // Initialize rows with data from coaCategory
    if (coaCategory.length > 0) {
      setRows(
        coaCategory.map((item) => ({
          id: item.id,
          code: item.accountCode,
          rekening: item.accountName,
          debet: 0,
          kredit: 0,
        }))
      );
    }
  }, [coaCategory]);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = parseFloat(value.replace(/[^\d]/g, "")) || 0;
    setRows(updatedRows);
  };

  // Format number as currency (Rupiah)
  const formatCurrency = (value) => {
    const numberValue = value.replace(/[^\d]/g, ""); // Remove non-numeric characters
    return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Format with periods
  };

  const getTotal = (field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);

  const handleSubmit = () => {
      setLoading(true);
      dispatch(createSaldoAwal(rows)).finally(() => {
        setLoading(false);
        setButton(false);
      });
  };

  return (
    <div>
      <div className="flex gap-4 items-center my-5">
        {!button ? (
          <button
            className="
                       bg-blue-600 text-white hover:scale-105 duration-200
                   p-2 rounded-lg shadow text-sm"
            onClick={() => setButton(true)}
          >
            Create Saldo Awal
          </button>
        ) : (
          <button
            className="
                       bg-blue-600 text-white hover:scale-105 duration-200
                   p-2 rounded-lg shadow text-sm flex items-center gap-2"
            onClick={() => setButton(false)}
          >
            <IoMdArrowBack /> Kembali
          </button>
        )}
      </div>
      {!button ? (
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                No
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Code
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Rekening
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Debet
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Kredit
              </th>
            </tr>
          </thead>
          <tbody>
            {saldoCoa.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-gray-700">{index + 1}</td>
                <td className="px-4 py-2 text-gray-700">{row.accountCode}</td>
                <td className="px-4 py-2 text-gray-700">{row.accountName}</td>
                <td className="px-4 py-2">
                  {formatCurrency(row.debit.toString())}
                </td>
                <td className="px-4 py-2">
                  {formatCurrency(row.kredit.toString())}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  No
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Code
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Rekening
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Debet
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Kredit
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td className="px-4 py-2 text-gray-700">{index + 1}</td>
                  <td className="px-4 py-2 text-gray-700">{row.code}</td>
                  <td className="px-4 py-2 text-gray-700">{row.rekening}</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={formatCurrency(row.debet.toString())}
                      onChange={(e) =>
                        handleRowChange(index, "debet", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={formatCurrency(row.kredit.toString())}
                      onChange={(e) =>
                        handleRowChange(index, "kredit", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" className="px-4 py-2 text-gray-700 font-bold">
                  Total
                </td>
                <td className="px-4 py-2 text-gray-700 font-bold">
                  {formatCurrency(getTotal("debet").toString())}
                </td>
                <td className="px-4 py-2 text-gray-700 font-bold">
                  {formatCurrency(getTotal("kredit").toString())}
                </td>
              </tr>
            </tbody>
          </table>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            {loading ? "Menyimpan..." : "Simpan Saldo Awal"}
          </button>
        </>
      )}
    </div>
  );
}
