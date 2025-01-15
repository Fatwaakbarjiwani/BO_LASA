import { useState } from "react";
import Coa from "../coa/Coa";
import Jurnal from "../jurnal/admin/Jurnal";
import JurnalUmum from "../jurnal/admin/JurnalUmum";
import BukuBesar from "../bukuBesar/BukuBesar";
import SaldoAwal from "../saldoAwal/SaldoAwal";
import LaporanPosisiKeuangan from "../neraca/LaporanPosisiKeuangan";
import LaporanAktifitas from "../laporanAktifitas/LaporanAktifitas";
import NeracaSaldo from "../neracaSaldo/NeracaSaldo";

export default function Administrasi() {
  const [page, setPage] = useState("coa");

  const renderPage = () => {
    switch (page) {
      case "coa":
        return <Coa />;
      case "jurnal":
        return <Jurnal />;
      case "jurnalUmum":
        return <JurnalUmum />;
      case "bukuBesar":
        return <BukuBesar />;
      case "saldoAwal":
        return <SaldoAwal />;
      case "posisiKeuangan":
        return <LaporanPosisiKeuangan />;
      case "neracaSaldo":
        return <NeracaSaldo />;
      case "laporanAktifitas":
        return <LaporanAktifitas />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-3xl font-extrabold text-gray-800">Administrasi</div>
      <div className="flex space-x-4">
        <button
          onClick={() => setPage("coa")}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-nowrap transition ${
            page === "coa"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          COA
        </button>
        <button
          onClick={() => setPage("saldoAwal")}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-nowrap transition ${
            page === "saldoAwal"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Saldo Awal
        </button>
        <button
          onClick={() => setPage("jurnalUmum")}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-nowrap transition ${
            page === "jurnalUmum"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Jurnal Umum
        </button>
        <button
          onClick={() => setPage("jurnal")}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-nowrap transition ${
            page === "jurnal"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Jurnal
        </button>
        <button
          onClick={() => setPage("bukuBesar")}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-nowrap transition ${
            page === "bukuBesar"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Buku Besar
        </button>
        <button
          onClick={() => setPage("neracaSaldo")}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-nowrap transition ${
            page === "neracaSaldo"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Neraca Saldo
        </button>
        <button
          onClick={() => setPage("posisiKeuangan")}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-nowrap transition ${
            page === "posisiKeuangan"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Posisi Keuangan
        </button>
        <button
          onClick={() => setPage("laporanAktifitas")}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-nowrap transition ${
            page === "laporanAktifitas"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Laporan Aktivitas
        </button>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg shadow-lg">{renderPage()}</div>
    </div>
  );
}
