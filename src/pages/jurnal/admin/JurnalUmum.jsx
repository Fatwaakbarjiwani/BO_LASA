import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCategoryCoa,
  getCategoryZiswaf,
} from "../../../redux/actions/ziswafAction";
import { createJurnalUmum } from "../../../redux/actions/transaksiAction";
import { OrbitProgress } from "react-loading-indicators";
import Swal from "sweetalert2";

export default function JurnalUmum() {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const { zakat, infak, wakaf, dskl, coaCategory } = useSelector(
    (state) => state.ziswaf
  );

  const [date, setDate] = useState("");
  const [jenis, setJenis] = useState("");
  const [kategori, setKategori] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [rows, setRows] = useState([
    { id: 1, rekening: "", debet: 0, kredit: 0 },
  ]);
  // console.log(rows);

  useEffect(() => {
    dispatch(getCategoryZiswaf("zakat"));
    dispatch(getCategoryZiswaf("infak"));
    dispatch(getCategoryZiswaf("wakaf"));
    dispatch(getCategoryZiswaf("dskl"));
    dispatch(getCategoryCoa());
  }, [dispatch]);

  const data = [
    { id: 1, name: "Zakat", category: "zakat" },
    { id: 2, name: "Infak", category: "infak" },
    { id: 3, name: "Wakaf", category: "wakaf" },
    { id: 4, name: "DSKL", category: "dskl" },
    { id: 5, name: "Campaign", category: "campaign" },
  ];

  const addRow = () => {
    setRows([
      ...rows,
      { id: rows.length + 1, rekening: "", debet: 0, kredit: 0 },
    ]);
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] =
      field === "rekening"
        ? value
        : parseFloat(value.replace(/[^\d]/g, "")) || 0;
    setRows(updatedRows);
  };

  const getTotal = (field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);

  const resetForm = () => {
    setDate("");
    setJenis("");
    setKategori("");
    setKeterangan("");
    setRows([{ id: 1, rekening: "", debet: 0, kredit: 0 }]);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-700 mb-6">Jurnal Umum</h1>

      <div className="grid grid-cols-3 gap-6 items-center mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Tanggal
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Pilih Jenis
          </label>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Pilih Jenis</option>
            {data.map((item) => (
              <option key={item.id} value={item.category}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Kategori
          </label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Pilih Kategori</option>
            {(jenis === "zakat"
              ? zakat
              : jenis === "infak"
              ? infak
              : jenis === "wakaf"
              ? wakaf
              : dskl
            ).map((item) => (
              <option key={item.id} value={item.id}>
                {item.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600">
          Keterangan
        </label>
        <textarea
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows="3"
        ></textarea>
      </div>

      <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
              No
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
              <td className="px-4 py-2">
                <select
                  value={row.rekening}
                  onChange={(e) =>
                    handleRowChange(index, "rekening", e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Pilih Rekening</option>
                  {coaCategory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {`${item.accountCode} ${item.accountName}`}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={row.debet.toLocaleString("id-ID")}
                  onChange={(e) =>
                    handleRowChange(index, "debet", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={row.kredit.toLocaleString("id-ID")}
                  onChange={(e) =>
                    handleRowChange(index, "kredit", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan="2" className="px-4 py-2 text-gray-700 font-bold">
              Total
            </td>
            <td className="px-4 py-2 text-gray-700 font-bold">
              {formatCurrency(getTotal("debet"))}
            </td>
            <td className="px-4 py-2 text-gray-700 font-bold">
              {formatCurrency(getTotal("kredit"))}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex gap-4 mt-6">
        <button
          onClick={resetForm}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600"
        >
          Reset
        </button>
        <button
          onClick={addRow}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
        >
          Tambah
        </button>
        {isLoading ? (
          <div className="flex justify-center">
            <OrbitProgress
              variant="spokes"
              color="#69c53e"
              style={{ fontSize: "8px" }}
            />
          </div>
        ) : (
          <button
            onClick={() => {
              if (
                formatCurrency(getTotal("debet")) ==
                formatCurrency(getTotal("kredit"))
              ) {
                setLoading(true);
                dispatch(
                  createJurnalUmum(date, keterangan, jenis, kategori, rows)
                ).finally(() => setLoading(false));
              } else {
                Swal.fire({
                  title: "Peringatan",
                  text: "Pastikan jumlah debet dan kredit sama",
                  icon: "info",
                });
              }
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600"
          >
            Simpan
          </button>
        )}
      </div>
    </div>
  );
}