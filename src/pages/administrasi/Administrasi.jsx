import { useState } from "react";
import Coa from "../coa/Coa";
import Jurnal from "../jurnal/admin/Jurnal";
import JurnalUmum from "../jurnal/admin/JurnalUmum";
import BukuBesar from "../bukuBesar/BukuBesar";
import SaldoAwal from "../saldoAwal/SaldoAwal";

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
          className={`px-6 py-2 text-sm font-medium rounded-lg transition ${
            page === "coa"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          COA
        </button>
        <button
          onClick={() => setPage("saldoAwal")}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition ${
            page === "saldoAwal"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Saldo Awal
        </button>
        <button
          onClick={() => setPage("jurnalUmum")}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition ${
            page === "jurnalUmum"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Jurnal Umum
        </button>
        <button
          onClick={() => setPage("jurnal")}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition ${
            page === "jurnal"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Jurnal
        </button>
        <button
          onClick={() => setPage("bukuBesar")}
          className={`px-6 py-2 text-sm font-medium rounded-lg transition ${
            page === "bukuBesar"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-blue-100"
          }`}
        >
          Buku Besar
        </button>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg shadow-lg">{renderPage()}</div>
    </div>
  );
}
