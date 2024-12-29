import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { getPosisiKeuangan } from "../../redux/actions/transaksiAction";
import logo from "../../assets/logo2.png";
import Swal from "sweetalert2";
import { OrbitProgress } from "react-loading-indicators";
import DokumentasiNeraca from "./DokumentasiNeraca";

export default function LaporanPosisiKeuangan() {
  const [format, setFormat] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [year1, setYear1] = useState("");
  const [year2, setYear2] = useState("");
  const { posisiKeuangan } = useSelector((state) => state.summary);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const reportTemplateRef = useRef(null);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    if (startMonth && endMonth && year1 && year2) {
      dispatch(getPosisiKeuangan(startMonth, endMonth, year1, year2));
    }
  }, [dispatch, startMonth, endMonth, year1, year2]);

  const months = [
    { id: 1, name: "Januari", name2: "JANUARY" },
    { id: 2, name: "Februari", name2: "FEBRUARY" },
    { id: 3, name: "Maret", name2: "MARCH" },
    { id: 4, name: "April", name2: "APRIL" },
    { id: 5, name: "Mei", name2: "MAY" },
    { id: 6, name: "Juni", name2: "JUNE" },
    { id: 7, name: "Juli", name2: "JULY" },
    { id: 8, name: "Agustus", name2: "AUGUST" },
    { id: 9, name: "September", name2: "SEPTEMBER" },
    { id: 10, name: "Oktober", name2: "OCTOBER" },
    { id: 11, name: "November", name2: "NOVEMBER" },
    { id: 12, name: "Desember", name2: "DECEMBER" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentDateTime = new Date().toLocaleString();
    setDateTime(currentDateTime);

    if (!startMonth || !endMonth || !format) {
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
        <div class="relative" style="font-family: Arial, sans-serif; margin: 20px;">
          <!-- Header -->
          <div class="header" style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <img src="${logo}" alt="LAZIS SULTAN AGUNG Logo" style="width: 150px; position: absolute; left: 20px;">
            <div style="text-align: center;">
              <h1 style="font-size: 24px; font-weight: bold; margin: 5px 0;">LAZIS SULTAN AGUNG</h1>
              <p style="margin: 2px 0; font-size: 14px;">Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah</p>
              <p style="margin: 2px 0; font-size: 14px;">Info : Telp. +62 24 6583584</p>
              <p style="margin: 2px 0; font-size: 14px;">
                <a href="https://lazis-sa.org/" target="_blank" rel="noreferrer">https://lazis-sa.org/</a>
              </p>
            </div>
          </div>

          <hr style="border: 1px solid black;" />

          <div class="report-title" style="text-align: center; font-size: 18px; font-weight: bold;">LAPORAN POSISI KEUANGAN</div>
          <div class="period" style="text-align: center; font-size: 16px; font-weight: bold;">
            PER AKHIR BULAN ${months[startMonth - 1]?.name} ${year1}
          </div>
          <div class="period" style="text-align: center; font-size: 16px; font-weight: bold;">
            Dengan Angka Perbandingan Untuk Bulan ${
              months[endMonth - 1]?.name
            } ${year2}
          </div>
          <div class="period" style="text-align: center; font-size: 16px; font-weight: bold;">
            (Dinyatakan Dalam Rupiah Kecuali Dinyatakan Lain)
          </div>

      ${dateTime && `<p className="mt-2 text-right mb-[-2vh]">${dateTime}</p>`}
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 8px; text-align: center;">ASET</th>
                <th style="border: 1px solid black; padding: 8px; text-align: center;">
                  ${months[startMonth - 1]?.name} ${year1}
                </th>
                <th style="border: 1px solid black; padding: 8px; text-align: center;">
                  ${months[endMonth - 1]?.name} ${year2}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: left; border: 1px solid black; padding: 8px; font-weight: bold;">
                 ASET LANCAR
                </td>
                <td style="border: 1px solid black; padding: 8px;"></td>
                <td style="border: 1px solid black; padding: 8px;"></td>
              </tr>
            ${Object.keys(posisiKeuangan["Aset Lancar"] || {})
              .filter((key) => key.toLowerCase() !== "total")
              .map(
                (key, index) =>
                  `<tr key="${index}">
        <td style="border: 1px solid black; padding: 8px; text-align: left; padding-left: 16px;">
          ${key}
        </td>
        <td style="border: 1px solid black; padding: 8px;">
          <p>
            ${formatNumber(
              posisiKeuangan["Aset Lancar"]?.[key]?.[
                `${months[startMonth - 1]?.name} ${year1}`
              ] || 0
            )}
          </p>
        </td>
        <td style="border: 1px solid black; padding: 8px;">
          <p>
            ${formatNumber(
              posisiKeuangan["Aset Lancar"]?.[key]?.[
                `${months[endMonth - 1]?.name} ${year2}`
              ] || 0
            )}
          </p>
        </td>
      </tr>`
              )
              .join("")}
              <tr>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: left; padding-left: 42px;">
                    Jumlah Aset Lancar
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: center;">
                      ${formatNumber(
                        posisiKeuangan[`Aset Lancar`]?.[
                          `Total ${months[startMonth - 1]?.name} ${year1}`
                        ] || 0
                      )}
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: center;">
                     ${formatNumber(
                       posisiKeuangan[`Aset Lancar`]?.[
                         `Total ${months[endMonth - 1]?.name} ${year2}`
                       ] || 0
                     )}
                  </td>
                </tr>

              <tr>
                <td style="text-align: left; border: 1px solid black; padding: 8px; font-weight: bold;">
                 ASET TETAP
                </td>
                <td style="border: 1px solid black; padding: 8px;"></td>
                <td style="border: 1px solid black; padding: 8px;"></td>
              </tr>
            ${Object.keys(posisiKeuangan["Aset Tetap"] || {})
              .filter((key) => key.toLowerCase() !== "total")
              .map(
                (key, index) =>
                  `<tr key="${index}">
        <td style="border: 1px solid black; padding: 8px; text-align: left; padding-left: 16px;">
          ${key}
        </td>
        <td style="border: 1px solid black; padding: 8px;">
          <p>
            ${formatNumber(
              posisiKeuangan["Aset Tetap"]?.[key]?.[
                `${months[startMonth - 1]?.name} ${year1}`
              ] || 0
            )}
          </p>
        </td>
        <td style="border: 1px solid black; padding: 8px;">
          <p>
            ${formatNumber(
              posisiKeuangan["Aset Tetap"]?.[key]?.[
                `${months[endMonth - 1]?.name} ${year2}`
              ] || 0
            )}
          </p>
        </td>
      </tr>`
              )
              .join("")}
                 
                <tr>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: left; padding-left: 42px;">
                    Jumlah Aset Tetap
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: center;">
                     ${formatNumber(
                       posisiKeuangan[`Aset Tetap`]?.[
                         `Total ${months[startMonth - 1]?.name} ${year1}`
                       ] || 0
                     )}
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: center;">
                     ${formatNumber(
                       posisiKeuangan[`Aset Tetap`]?.[
                         `Total ${months[endMonth - 1]?.name} ${year2}`
                       ] || 0
                     )}
                  </td>
                </tr>
              <tr>
                <td style="text-align: left; border: 1px solid black; padding: 8px; font-weight: bold;">
                 ASET LAIN-LAIN
                </td>
                <td style="border: 1px solid black; padding: 8px;"></td>
                <td style="border: 1px solid black; padding: 8px;"></td>
              </tr>
            ${Object.keys(posisiKeuangan["Aset Lain-Lain"] || {})
              .filter((key) => key.toLowerCase() !== "total")
              .map(
                (key, index) =>
                  `<tr key="${index}">
        <td style="border: 1px solid black; padding: 8px; text-align: left; padding-left: 16px;">
          ${key}
        </td>
        <td style="border: 1px solid black; padding: 8px;">
          <p>
            ${formatNumber(
              posisiKeuangan["Aset Lain-Lain"]?.[key]?.[
                `${months[startMonth - 1]?.name} ${year1}`
              ] || 0
            )}
          </p>
        </td>
        <td style="border: 1px solid black; padding: 8px;">
          <p>
            ${formatNumber(
              posisiKeuangan["Aset Lain-Lain"]?.[key]?.[
                `${months[endMonth - 1]?.name} ${year2}`
              ] || 0
            )}
          </p>
        </td>
      </tr>`
              )
              .join("")}
                 
                <tr>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: left; padding-left: 42px;">
                    Jumlah Aset Lain-Lain
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: center;">
                    ${formatNumber(
                      posisiKeuangan[`Aset Lain-Lain`]?.[
                        `Total ${months[startMonth - 1]?.name} ${year1}`
                      ] || 0
                    )}
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: center;">
                    ${formatNumber(
                      posisiKeuangan[`Aset Lain-Lain`]?.[
                        `Total ${months[endMonth - 1]?.name} ${year2}`
                      ] || 0
                    )}
                  </td>
                </tr>

              <tr>
                <td class="bg-gray" style="border: 1px solid black; padding: 8px; text-align: center;">
                  <p class="text-center font-bold">JUMLAH ASET</p>
                </td>
                <td class="bg-gray" style="border: 1px solid black; padding: 8px; text-align: center;"></td>
                <td class="bg-gray" style="border: 1px solid black; padding: 8px; text-align: center;"></td>
              </tr>
            </tbody>
          </table>

          <!-- Table 2: Kewajiban dan Dana -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 8px; text-align: center;">KEWAJIBAN DAN DANA-DANA ZIS</th>
                <th style="border: 1px solid black; padding: 8px; text-align: center;">
                  ${months[startMonth - 1]?.name} ${year1}
                </th>
                <th style="border: 1px solid black; padding: 8px; text-align: center;">
                  ${months[endMonth - 1]?.name} ${year2}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: left; border: 1px solid black; padding: 8px; font-weight: bold;">
                 KEWAJIBAN LANCAR
                </td>
                <td style="border: 1px solid black; padding: 8px;"></td>
                <td style="border: 1px solid black; padding: 8px;"></td>
              </tr>
            ${Object.keys(posisiKeuangan["Kewajiban Lancar"] || {})
              .filter((key) => key.toLowerCase() !== "total")
              .map(
                (key, index) =>
                  `<tr key="${index}">
        <td style="border: 1px solid black; padding: 8px; text-align: left; padding-left: 16px;">
          ${key}
        </td>
        <td style="border: 1px solid black; padding: 8px;">
          <p>
            ${formatNumber(
              posisiKeuangan["Kewajiban Lancar"]?.[key]?.[
                `${months[startMonth - 1]?.name} ${year1}`
              ] || 0
            )}
          </p>
        </td>
        <td style="border: 1px solid black; padding: 8px;">
          <p>
            ${formatNumber(
              posisiKeuangan["Kewajiban Lancar"]?.[key]?.[
                `${months[endMonth - 1]?.name} ${year2}`
              ] || 0
            )}
          </p>
        </td>
      </tr>`
              )
              .join("")}
                 
                <tr>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: left; padding-left: 42px;">
                    Jumlah Kewajiban Lancar
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: center;">
                    ${formatNumber(
                      posisiKeuangan[`Kewajiban Lancar`]?.[
                        `Total ${months[startMonth - 1]?.name} ${year1}`
                      ] || 0
                    )}
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: center;">
                    ${formatNumber(
                      posisiKeuangan[`Kewajiban Lancar`]?.[
                        `Total ${months[endMonth - 1]?.name} ${year2}`
                      ] || 0
                    )}
                  </td>
                </tr>
              <tr>
                <td style="text-align: left; border: 1px solid black; padding: 8px; font-weight: bold;">
                 DANA-DANA ZIS
                </td>
                <td style="border: 1px solid black; padding: 8px;"></td>
                <td style="border: 1px solid black; padding: 8px;"></td>
              </tr>
            ${Object.keys(posisiKeuangan["Dana ZIS"] || {})
              .filter((key) => key.toLowerCase() !== "total")
              .map(
                (key, index) =>
                  `<tr key="${index}">
        <td style="border: 1px solid black; padding: 8px; text-align: left; padding-left: 16px;">
          ${key}
        </td>
        <td style="border: 1px solid black; padding: 8px;">
          <p>
            ${formatNumber(
              posisiKeuangan["Dana ZIS"]?.[key]?.[
                `${months[startMonth - 1]?.name} ${year1}`
              ] || 0
            )}
          </p>
        </td>
        <td style="border: 1px solid black; padding: 8px;">
          <p>
            ${formatNumber(
              posisiKeuangan["Dana ZIS"]?.[key]?.[
                `${months[endMonth - 1]?.name} ${year2}`
              ] || 0
            )}
          </p>
        </td>
      </tr>`
              )
              .join("")}
                 
                <tr>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: left; padding-left: 42px;">
                    Jumlah Dana-Dana ZIS
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: center;">
                    ${formatNumber(
                      posisiKeuangan[`Dana ZIS`]?.[
                        `Total ${months[startMonth - 1]?.name} ${year1}`
                      ] || 0
                    )}
                  </td>
                  <td style="border: 1px solid black; padding: 8px; font-weight: bold; text-align: center;">
                    ${formatNumber(
                      posisiKeuangan[`Dana ZIS`]?.[
                        `Total ${months[endMonth - 1]?.name} ${year2}`
                      ] || 0
                    )}
                  </td>
                </tr>

              <tr>
            <td style={cellStyle} className="bg-gray-100">
              <p className="text-center font-bold">
                JUMLAH KEWAJIBAN DAN DANA-DANA ZIS
              </p>
            </td>
            <td style={cellStyle} className="bg-gray-100">
              <p className="text-center font-bold">
                ${formatNumber(
                  posisiKeuangan[
                    `Jumlah Kewajiban dan Dana ZIS ${
                      months[startMonth - 1]?.name
                    } ${year1}`
                  ] || 0
                )}
              </p>
            </td>
            <td style={cellStyle} className="bg-gray-100">
              <p className="text-center font-bold">
                ${formatNumber(
                  posisiKeuangan[
                    `Jumlah Kewajiban dan Dana ZIS ${
                      months[endMonth - 1]?.name
                    } ${year2}`
                  ] || 0
                )}
              </p>
            </td>
          </tr>
            </tbody>
          </table>
        </div>
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
          Filter Laporan Posisi Keuangan
        </h2>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Bulan Pertama
            </label>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Pilih Bulan</option>
              {months.map((month) => (
                <option key={month.id} value={month.id}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Bulan Kedua
            </label>
            <select
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Pilih Bulan</option>
              {months.map((month) => (
                <option key={month.id} value={month.id}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Tahun Pertama
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={year1}
              onChange={(e) => setYear1(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Tahun Kedua
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={year2}
              onChange={(e) => setYear2(e.target.value)}
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
              Download Neraca Saldo
            </button>
          )}
        </div>
      </div>
      <div ref={reportTemplateRef}>
        <DokumentasiNeraca
          m1={startMonth}
          m2={endMonth}
          y1={year1}
          y2={year2}
          dateTime={dateTime}
        />
      </div>
    </>
  );
}
