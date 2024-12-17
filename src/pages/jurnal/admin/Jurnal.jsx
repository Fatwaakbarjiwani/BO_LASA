import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { getJurnal } from "../../../redux/actions/transaksiAction";
import logo from "../../../assets/logo2.png";
import Swal from "sweetalert2";
import DokumentasiJurnal from "./DokumentasiJurnal";
import { OrbitProgress } from "react-loading-indicators";

export default function Jurnal() {
  const [format, setFormat] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { jurnal } = useSelector((state) => state.summary);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const reportTemplateRef = useRef(null);

  useEffect(() => {
    if (startDate && endDate) {
      dispatch(getJurnal(startDate, endDate));
    }
  }, [dispatch, startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!startDate || !endDate || !format) {
      Swal.fire({
        icon: "warning",
        title: "Input Tidak Lengkap",
        text: "Silakan isi semua input sebelum melanjutkan!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (format === "html") {
        openHtmlReport();
      } else if (format === "pdf") {
        downloadPdfReport();
      }
      setLoading(false);
    }, 1000);
  };

  const openHtmlReport = () => {
    const formatNumber = (value) => {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const newWindow = window.open("", "_blank");
    if (newWindow) {
         newWindow.document.write(`
<html>
  <head>
    <title>Laporan Jurnal</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      .header { display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
      .header img { width: 150px; position: absolute; left: 20px; }
      .header div { text-align: center; }
      .header h1 { font-size: 24px; font-weight: bold; margin: 5px 0; }
      .header p { margin: 2px 0; font-size: 14px; }
      .header a { color: blue; text-decoration: none; }
      .header a:hover { text-decoration: underline; }
      hr { border: 1px solid black; }
      .report-title { text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold; }
      .period { font-size: 14px; margin: 10px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid black; padding: 8px; text-align: center; }
      th { background-color: #f2f2f2; font-size: 14px; }
      td { font-size: 12px; }
      .bg-gray { background-color: #f2f2f2; font-weight: bold; }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="${logo}" alt="LAZIS Logo" />
      <div>
        <h1>LAZIS SULTAN AGUNG</h1>
        <p>Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah</p>
        <p>Info: Telp. +62 24 6583584</p>
        <p>
          <a href="https://lazis-sa.org/" target="_blank" rel="noopener noreferrer">
            https://lazis-sa.org/
          </a>
        </p>
      </div>
    </div>
    <hr />
    <div class="report-title">LAPORAN JURNAL</div>
    <p class="period">Periode: ${startDate} sampai dengan ${endDate}</p>
    <p class="period">Unit: Lazis Sultan Agung</p>
    <table>
      <thead>
        <tr>
          <th>TANGGAL</th>
          <th>UNIT</th>
          <th>NOMOR BUKTI</th>
          <th>URAIAN</th>
          <th>COA</th>
          <th>DEBET</th>
          <th>KREDIT</th>
        </tr>
      </thead>
      <tbody>
        ${jurnal?.jurnalResponses
          ?.map((item) => {
            const jumlahBaris = item.coa.length || 1;
            return `
            <tr>
              <td rowspan="${jumlahBaris + 1}">${item.tanggal}</td>
              <td rowspan="${jumlahBaris + 1}">${item.unit}</td>
              <td rowspan="${jumlahBaris + 1}">${item.nomorBukti}</td>
              <td rowspan="${jumlahBaris + 1}">${item.uraian}</td>
              <td>${item.coa[0]?.akun || "-"}</td>
              <td>${formatNumber(item.coa[0]?.debit || 0)}</td>
              <td>${formatNumber(item.coa[0]?.kredit || 0)}</td>
            </tr>
            ${item.coa
              .slice(1)
              .map(
                (coaItem) => `
              <tr>
                <td>${coaItem.akun || "-"}</td>
                <td>${formatNumber(coaItem.debit || 0)}</td>
                <td>${formatNumber(coaItem.kredit || 0)}</td>
              </tr>
            `
              )
              .join("")}
            <tr class="bg-gray">
              <td>Jumlah</td>
              <td>${formatNumber(item.totalDebit || 0)}</td>
              <td>${formatNumber(item.totalKredit || 0)}</td>
            </tr>
            `;
          })
          .join("")}
            <tr class="bg-gray">
              <td colspan="5">Jumlah Total</td>
              <td>${formatNumber(jurnal?.totalDebitKeseluruhan || 0)}</td>
              <td>${formatNumber(jurnal.totalKreditKeseluruhan || 0)}</td>
            </tr>
      </tbody>
    </table>
  </body>
</html>
`);
      newWindow.document.close();
    }
  };

  const downloadPdfReport = () => {
    const doc = new jsPDF({
      format: "a4",
      unit: "px",
    });

    const content = reportTemplateRef.current;
    const contentWidth = content.offsetWidth;
    const pdfWidth = doc.internal.pageSize.getWidth();
    const scaleFactor = pdfWidth / contentWidth;

    doc.html(content, {
      x: 4,
      y: 4,
      html2canvas: { scale: scaleFactor },
      callback: (doc) => {
        doc.save("document.pdf");
      },
    });
  };

  return (
    <>
      <div className="mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Filter Jurnal
        </h2>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Format</option>
              <option value="html">HTML</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          {isLoading ? (
            <div className="w-full flex justify-center">
              <OrbitProgress
                variant="spokes"
                color="#69c53e"
                style={{ fontSize: "8px" }}
              />
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 text-white p-3 rounded-lg"
            >
              Download Jurnal
            </button>
          )}
        </div>
      </div>
      <div ref={reportTemplateRef}>
        <DokumentasiJurnal startDate={startDate} endDate={endDate} />
      </div>
    </>
  );
}
