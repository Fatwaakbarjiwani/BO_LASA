import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryCoa, getSaldoCoa } from "../../redux/actions/ziswafAction";
import { createSaldoAwal } from "../../redux/actions/transaksiAction";
import { IoMdArrowBack } from "react-icons/io";

export default function   SaldoAwal() {
  const { coaCategory } = useSelector((state) => state.ziswaf);
  const { saldoCoa } = useSelector((state) => state.summary);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [button, setButton] = useState(false);
  const [rows, setRows] = useState([]);
  // Filter tampilan daftar saldo awal
  const [fCari, setFCari] = useState("");
  const [fPeriode, setFPeriode] = useState(""); // "" semua | "belum" | "yyyy-MM"
  const sekarang = new Date();
  const [bulan, setBulan] = useState(sekarang.getMonth() + 1);
  const [tahun, setTahun] = useState(sekarang.getFullYear());
  const tahunOpsi = Array.from({ length: 6 }, (_, i) => sekarang.getFullYear() - i);

  useEffect(() => {
    dispatch(getCategoryCoa());
    {
      !loading && dispatch(getSaldoCoa());
    }
  }, [dispatch, loading]);

  useEffect(() => {
    if (coaCategory.length > 0) {
      setRows(
        coaCategory.map((item) => ({
          id: item.id,
          code: item.accountCode,
          rekening: item.accountName,
          accountType: item.accountType,
          nilai: 0,
        }))
      );
    }
  }, [coaCategory]);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = parseFloat(value.replace(/[^\d]/g, "")) || 0;
    setRows(updatedRows);
  };

  const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const labelPeriode = (p) => (p ? `${NAMA_BULAN[Number(p.slice(5, 7)) - 1]} ${p.slice(0, 4)}` : "-");

  const formatCurrency = (value) => {
    const numberValue = value.replace(/[^\d]/g, ""); // Remove non-numeric characters
    return numberValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Format with periods
  };

  const periodeAda = [...new Set(saldoCoa.map((r) => r.periode).filter(Boolean))].sort().reverse();
  const saldoTampil = saldoCoa.filter((r) => {
    if (fCari && !`${r.accountCode} ${r.accountName}`.toLowerCase().includes(fCari.toLowerCase())) return false;
    if (fPeriode === "belum") return !r.periode;
    if (fPeriode) return r.periode === fPeriode;
    return true;
  });
  const totalTampil = saldoTampil.reduce((s, r) => s + (Number(r.saldoAwal) || 0), 0);

  const getTotal = (field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);

  const handleSubmit = () => {
      setLoading(true);
      dispatch(createSaldoAwal(rows, { bulan: Number(bulan), tahun: Number(tahun) })).finally(() => {
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
        <>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <input
            value={fCari}
            onChange={(e) => setFCari(e.target.value)}
            placeholder="Cari kode / nama rekening…"
            className="p-2 border border-gray-300 rounded-lg w-64"
          />
          <select value={fPeriode} onChange={(e) => setFPeriode(e.target.value)} className="p-2 border border-gray-300 rounded-lg">
            <option value="">Semua periode</option>
            <option value="belum">Belum ada saldo awal</option>
            {periodeAda.map((p) => (
              <option key={p} value={p}>{labelPeriode(p)}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{saldoTampil.length} dari {saldoCoa.length} rekening · total {formatCurrency(String(Math.round(totalTampil)))}</span>
        </div>
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
                Periode
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Nilai
              </th>
            </tr>
          </thead>
          <tbody>
            {saldoTampil.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-gray-700">{index + 1}</td>
                <td className="px-4 py-2 text-gray-700">{row.accountCode}</td>
                <td className="px-4 py-2 text-gray-700">{row.accountName}</td>
                <td className="px-4 py-2 text-gray-700">
                  {labelPeriode(row.periode)}
                </td>
                <td className="px-4 py-2">
                  {formatCurrency(row.saldoAwal.toString())}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-600">Saldo awal berlaku mulai</span>
            <select
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              {NAMA_BULAN.map((n, i) => (
                <option key={n} value={i + 1}>{n}</option>
              ))}
            </select>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              {tahunOpsi.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
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
                  Nilai
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
                      value={formatCurrency(row.nilai.toString())}
                      onChange={(e) =>
                        handleRowChange(index, "nilai", e.target.value)
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
                  {formatCurrency(getTotal("nilai").toString())}
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
