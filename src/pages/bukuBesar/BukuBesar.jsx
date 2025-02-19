import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { getBukuBesar } from "../../redux/actions/transaksiAction";
import logo2 from "../../assets/logo2.png";
import { getCategoryCoa } from "../../redux/actions/ziswafAction";
import Swal from "sweetalert2";
import DocumentasiBukuBesar from "./DocumentasiBukuBesar";

export default function BukuBesar() {
  const [format, setFormat] = useState("");
  const { coaCategory } = useSelector((state) => state.ziswaf);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coaId, setCoaId] = useState("");
  const [coaName, setCoaName] = useState("");
  const [coaId2, setCoaId2] = useState("");
  const [coaName2, setCoaName2] = useState("");
  const { bukuBesar } = useSelector((state) => state.summary);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const reportTemplateRef = useRef(null);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    dispatch(getCategoryCoa());
  }, [dispatch]);

  useEffect(() => {
    if (coaId && startDate && endDate) {
      setLoading(true)
      dispatch(getBukuBesar(coaId, coaId2, startDate, endDate)).finally(()=>setLoading(false));
    }
  }, [dispatch, coaId, coaId2, startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentDateTime = new Date().toLocaleString();
    setDateTime(currentDateTime);
    if (!startDate) {
      Swal.fire({
        title: "Tanggal mulai harus diisi",
        icon: "error",
      });
      return;
    }
    if (!endDate) {
      Swal.fire({ title: "Tanggal selesai harus diisi.", icon: "error" });
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      Swal.fire({
        title: "Tanggal selesai harus setelah atau sama dengan tanggal mulai.",
        icon: "info",
      });
      return;
    }
    if (!coaId) {
      Swal.fire({ title: "Kategori COA harus dipilih." });
      return;
    }

    // Proses lebih lanjut jika validasi berhasil
    dispatch(getBukuBesar(coaId, startDate, endDate));

    if (format === "html") {
      setLoading(true);
      setTimeout(() => {
        openHtmlReport();
        setLoading(false);
      }, 1000);
    } else if (format === "pdf") {
      setLoading(true);
      setTimeout(() => {
        downloadPdfReport();
        setLoading(false);
      }, 1000);
    }
  };

  const openHtmlReport = () => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const formatNumber = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      };
      // Extract the month name from startDate
      const startMonth = new Date(startDate).getMonth();
      const namaBulan = monthNames[startMonth];

      newWindow.document.write(`
      <html>
        <head>
          <title>LAPORAN BUKU BESAR</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; display: flex; align-items: center; gap: 20px; }
            .logo2 { width: 120px; }
            .logo3 { width: 80px; }
            .header2 { text-align: center; flex: 1; width:100% }
            .header h1 { font-size: 20px; font-weight: bold; margin: 5px 0; }
            .header p { margin: 2px 0; font-size: 12px; }
            .report-title { text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold; }
            .period { font-size: 14px; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; font-size: 14px; }
            td { font-size: 12px; }
            .left-align { text-align: left; font-weight: bold; }
            .coa {
              color: red;
              display: flex;
              justify-content: space-between;
              width:100%
            }
            .page-break { page-break-before: always; margin-top:20vh }
          </style>
        </head>
        <body>
          <div class="header">
          <img  src=${logo2} alt="UNISSULA Logo" class="logo2"/>
            <div class="header2">
              <h1>LAZIS SULTAN AGUNG</h1>
              <p>Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah</p>
              <p>Info : Telp. +62 24 6583584</p>
              <p><a href="https://lazis-sa.org/" target="_blank">https://lazis-sa.org/</a></p>
            </div>
          </div>
          <hr />
          <div class="report-title">LAPORAN BUKU BESAR</div>
          <p class="period">Periode: ${startDate} sampai dengan ${endDate}</p>
          <p class="period">Unit: Lazis Sultan Agung</p>
          <p class="coa flex">COA: ${coaName} ${
        dateTime && `<p style={{ color: "black"}}>${dateTime}</p>`
      }</p>
          <table>
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>UNIT</th>
                <th>NOMOR BUKTI</th>
                <th>URAIAN</th>
                <th>DEBET</th>
                <th>KREDIT</th>
                <th>SALDO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
              <td class="left-align" colspan="4"></td>
                <td class="left-align" colspan="2">Saldo Bulan ${namaBulan} =</td>
                <td>${formatNumber(bukuBesar?.saldoAwal1 || 0)}</td>
              </tr>
              ${bukuBesar?.bukuBesarCoa1
                ?.map(
                  (item) => `
                    <tr>
                      <td >${item?.tanggal}</td>
                      <td >${item?.unit}</td>
                      <td >${item?.nomorBukti}</td>
                      <td >${item?.uraian}</td>
                      <td>${formatNumber(item?.debit || 0)}</td>
                      <td>${formatNumber(item?.kredit || 0)}</td>
                      <td>${formatNumber(item?.saldo || 0)}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
          ${
            bukuBesar?.bukuBesarCoa2 == null ||
            bukuBesar == null ||
            coaId == coaId2
              ? `<div></div>`
              : ` <div class="page-break header">
          <img  src=${logo2} alt="UNISSULA Logo" class="logo2"/>
            <div class="header2">
              <h1>LAZIS SULTAN AGUNG</h1>
              <p>Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah</p>
              <p>Info : Telp. +62 24 6583584</p>
              <p><a href="http://www.unissula.ac.id" target="_blank">http://www.unissula.ac.id</a></p>
            </div>
          </div>
          <hr />
          <div class="report-title">LAPORAN BUKU BESAR</div>
          <p class="period">Periode: ${startDate} - ${endDate}</p>
          <p class="period">Unit: Universitas Islam Sultan Agung</p>
          <p class="coa">COA: ${coaName2} ${
                  dateTime && `<p style={{ color: "black" }}>${dateTime}</p>`
                }</p>
          <table>
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>UNIT</th>
                <th>NOMOR BUKTI</th>
                <th>URAIAN</th>
                <th>DEBET</th>
                <th>KREDIT</th>
                <th>SALDO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
              <td class="left-align" colspan="4">Saldo Awal Tahun 2024 = </td>
                <td class="left-align" colspan="2">Saldo Bulan ${namaBulan} =</td>
                <td>${formatNumber(bukuBesar?.saldoAwal2 || 0)}</td>
              </tr>
              ${bukuBesar?.bukuBesarCoa2
                ?.map(
                  (item) => `
                    <tr>
                      <td >${item?.tanggal}</td>
                      <td >${item?.unit}</td>
                      <td >${item?.nomorBukti}</td>
                      <td >${item?.uraian}</td>
                      <td>${formatNumber(item?.debit || 0)}</td>
                      <td>${formatNumber(item?.kredit || 0)}</td>
                      <td>${formatNumber(item?.saldo || 0)}</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>`
          }
        </body>
      </html>
    `);
      newWindow.document.close();
    }
  };

  const downloadPdfReport = () => {
    const doc = new jsPDF({
      format: "a4",
      unit: "px", // Pixel-based dimensions for better scaling.
    });

    const content = reportTemplateRef.current; // Reference to the content you want to render.

    // Get the content's computed dimensions.
    const contentWidth = content.offsetWidth;
    const pdfWidth = doc.internal.pageSize.getWidth();
    const scaleFactor = pdfWidth / contentWidth; // Scale content to fit within PDF.

    // Add the HTML content with scaling.
    doc.html(content, {
      x: 4, // Add margin.
      y: 4, // Add margin.
      html2canvas: {
        scale: scaleFactor, // Scale content proportionally.
      },
      callback: (doc) => {
        doc.save("document.pdf");
      },
    });
  };

  return (
    <div className=" items-start justify-between">
      <div className="w-full bg-white p-6 shadow rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Filter Buku Besar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Tanggal Mulai */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Tanggal Selesai */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Kategori COA */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori COA Pertama
            </label>
            <select
              value={coaId}
              onChange={(e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                setCoaId(e.target.value); // Menyimpan ID dari value
                setCoaName(selectedOption.text); // Mendapatkan accountName dari data attribute
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="" disabled>
                Pilih Kategori
              </option>
              {coaCategory.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                  data-account-name={item.accountName}
                >
                  {item?.accountCode} {item?.accountName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori COA Kedua
            </label>
            <select
              value={coaId2}
              onChange={(e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];

                setCoaId2(e.target.value); // Menyimpan ID dari value
                setCoaName2(selectedOption.text); // Mendapatkan accountName dari data attribute
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="" disabled>
                Pilih Kategori
              </option>
              {coaCategory.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                  data-account-name={item.accountName} // Menyimpan accountName di data attribute
                >
                  {item?.accountCode} {item?.accountName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Pilih Format</option>
              <option value="html">HTML</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          {/* Tombol Submit */}
          <div className="flex items-end">
            <button
              onClick={handleSubmit}
              className={`w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Download Buku Besar"}
            </button>
          </div>
        </div>
      </div>

      <div ref={reportTemplateRef} className="report-template w-full">
        <DocumentasiBukuBesar
          startDate={startDate}
          endDate={endDate}
          coaCategory={coaCategory}
          coaId={coaId}
          coaId2={coaId2}
          coaName={coaName}
          coaName2={coaName2}
          dateTime={dateTime}
        />
      </div>
    </div>
  );
}
