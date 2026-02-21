import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { downloadTemplatePos, importExcelDonatur } from "../../redux/actions/posAction";
import { getAllEvents } from "../../redux/actions/eventAction";
import {
  getCategoryZiswaf,
} from "../../redux/actions/ziswafAction";
import { getAllCampaignCategory } from "../../redux/actions/campaignAction";
import { OrbitProgress } from "react-loading-indicators";

const KOLOM_WAJIB = [
  { kolom: "Nama", keterangan: "Nama donatur" },
  { kolom: "Nominal", keterangan: "Nominal donasi, tanpa Rp dan titik (contoh: 100000)" },
  { kolom: "Tanggal", keterangan: "Format YYYY-MM-DD (contoh: 2026-02-11)" },
  { kolom: "Kategori", keterangan: "Harus sama persis: zakat, infak, dskl, campaign" },
  { kolom: "Id Sub kategori", keterangan: "ID sub kategori (lihat tabel referensi di bawah)" },
  { kolom: "Metode Pembayaran", keterangan: "Harus sama persis: tunai, transfer, qris" },
];

const KOLOM_OPSIONAL = [
  { kolom: "No Hp", keterangan: "Nomor HP/WA donatur" },
  { kolom: "Email", keterangan: "Email donatur" },
  { kolom: "Alamat", keterangan: "Alamat donatur" },
  { kolom: "ID Event", keterangan: "ID event lokasi donasi (lihat tabel referensi)" },
  { kolom: "Keterangan", keterangan: "Pesan/doa donatur atau keterangan donasi" },
];

export default function ImportDonatur() {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [isDownloading, setDownloading] = useState(false);
  const [isImporting, setImporting] = useState(false);

  const { listEvents } = useSelector((state) => state.event);
  const { zakat, infak, dskl } = useSelector((state) => state.ziswaf);
  const { allCampaignCategory } = useSelector((state) => state.campaign);

  useEffect(() => {
    dispatch(getAllEvents());
    dispatch(getCategoryZiswaf("zakat"));
    dispatch(getCategoryZiswaf("infak"));
    dispatch(getCategoryZiswaf("dskl"));
    dispatch(getAllCampaignCategory());
  }, [dispatch]);

  const handleDownloadTemplate = () => {
    setDownloading(true);
    dispatch(downloadTemplatePos()).finally(() => setDownloading(false));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const ext = selected.name?.split(".").pop()?.toLowerCase();
      if (ext !== "xlsx" && ext !== "xls") {
        setFile(null);
        e.target.value = "";
        return;
      }
      setFile(selected);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    setImporting(true);
    dispatch(importExcelDonatur(file))
      .then(() => {
        setFile(null);
        const input = document.getElementById("file-import-donatur");
        if (input) input.value = "";
      })
      .finally(() => setImporting(false));
  };

  const renderSubKategori = (title, data, idKey = "id", nameKey = "categoryName") => {
    const list = Array.isArray(data) ? data : [];
    if (list.length === 0) return null;
    return (
      <div className="overflow-x-auto">
        <h4 className="font-semibold text-gray-700 mb-1">{title}</h4>
        <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Nama</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item[idKey]} className="border-t border-gray-200">
                <td className="px-3 py-1">{item[idKey]}</td>
                <td className="px-3 py-1">{item[nameKey] ?? item.campaignCategory ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Tata Cara */}
      <div className="w-full shadow-md rounded-lg border border-gray-100 p-4 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-primary">📋</span> Tata Cara Import Donatur
        </h2>
        <p className="text-gray-600 mb-4">
          Isi file Excel sesuai kolom di bawah. Kolom bertanda <span className="font-semibold text-red-600">*</span> wajib diisi; kolom lain opsional.
        </p>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Kolom wajib diisi</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Kolom</th>
                  <th className="px-3 py-2 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {KOLOM_WAJIB.map((row, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="px-3 py-2 font-medium">*{row.kolom}</td>
                    <td className="px-3 py-2 text-gray-600">{row.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Kolom opsional</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">Kolom</th>
                  <th className="px-3 py-2 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {KOLOM_OPSIONAL.map((row, i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="px-3 py-2">{row.kolom}</td>
                    <td className="px-3 py-2 text-gray-600">{row.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Data Referensi */}
      <div className="w-full shadow-md rounded-lg border border-gray-100 p-4 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-primary">📊</span> Data Referensi (ID Sub Kategori & Event)
        </h2>
        <p className="text-gray-600 mb-4 text-sm">
          Gunakan ID di bawah saat mengisi kolom <strong>Id Sub kategori</strong> dan <strong>ID Event</strong> di Excel.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {renderSubKategori("Zakat", zakat)}
          {renderSubKategori("Infak", infak)}
          {renderSubKategori("DSKL", dskl)}
          {renderSubKategori("Campaign", allCampaignCategory, "id", "campaignCategory")}
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Event (ID Event)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">Nama Event</th>
                  <th className="px-3 py-2 text-left">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {listEvents?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-gray-500 text-center">
                      Belum ada data event
                    </td>
                  </tr>
                ) : (
                  listEvents?.map((item) => (
                    <tr key={item?.id} className="border-t border-gray-200">
                      <td className="px-3 py-1">{item?.id}</td>
                      <td className="px-3 py-1">{item?.name}</td>
                      <td className="px-3 py-1">{item?.location ?? "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Download Template & Form Import */}
      <div className="w-full shadow-md rounded-lg border border-gray-100 p-4 bg-white">
        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-primary">📥</span> Download Template & Import
        </h2>

        <div className="flex flex-wrap gap-4 items-center mb-4">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-primary text-white shadow hover:opacity-90 disabled:opacity-70 transition"
          >
            {isDownloading ? (
              <>
                <OrbitProgress variant="dotted" color="#fff" style={{ fontSize: "8px" }} />
                Mengunduh...
              </>
            ) : (
              <>
                <span>⬇</span> Download Template Excel
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih file Excel (.xlsx) yang sudah diisi
            </label>
            <input
              id="file-import-donatur"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full max-w-md text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-semibold file:cursor-pointer hover:file:opacity-90 cursor-pointer"
            />
            {file && (
              <p className="mt-1 text-sm text-gray-600">
                File dipilih: <strong>{file.name}</strong>
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={!file || isImporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-green-600 text-white shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isImporting ? (
              <>
                <OrbitProgress variant="dotted" color="#fff" style={{ fontSize: "8px" }} />
                Memproses import...
              </>
            ) : (
              "Import Excel"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
