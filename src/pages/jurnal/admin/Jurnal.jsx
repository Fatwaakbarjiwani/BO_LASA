import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { getJurnal } from "../../../redux/actions/transaksiAction";
import logo from "../../../assets/logoUnissula.png";
import { OrbitProgress } from "react-loading-indicators";

export default function Jurnal() {
  const [format, setFormat] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { jurnal } = useSelector((state) => state.summary);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getJurnal());
  }, [dispatch]);

const handleSubmit = (e) => {
  e.preventDefault();

  if (format === "html") {
    setLoading(true);
    setTimeout(() => {
      openHtmlReport();
      setLoading(false);
    }, 1000);
  } else if (format === "pdf") {
    setLoading(true);
    downloadPdfReport();
     setLoading(true);
     setTimeout(() => {
       openHtmlReport();
       setLoading(false);
     }, 1000); 
  }
};


  const openHtmlReport = () => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(`
      <html>
        <head>
          <title>Laporan Jurnal</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; display:flex;}
            .header img { width: 80px; }
            .header2 {text-align: center; width:100%;}
            .header h1 { font-size: 20px; font-weight: bold; margin: 5px 0; }
            .header p { margin: 2px 0; font-size: 12px; }
            .report-title { text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold; }
            .period { font-size: 14px; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; font-size: 14px; }
            td { font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src=${logo} alt="UNISSULA Logo" />
            <div class="header2">
            <h1>UNIVERSITAS ISLAM SULTAN AGUNG</h1>
            <p>Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah</p>
            <p>Info : Telp. +62 24 6583584</p>
            <p><a href="http://www.unissula.ac.id" target="_blank">http://www.unissula.ac.id</a></p>
            </div>
          </div>
          <hr />
          <div class="report-title">LAPORAN JURNAL</div>
          <p class="period">Periode: ${startDate} - ${endDate}</p>
          <table>
            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>UNIT</th>
                <th>NOMOR BUKTI</th>
                <th>URAIAN</th>
                <th>COA</th>
                <th>DEBIT</th>
                <th>KREDIT</th>
              </tr>
            </thead>
            <tbody>
              ${jurnal
                .map(
                  (item) => `
                  <tr>
                    <td rowspan="2">${item.tanggal}</td>
                    <td rowspan="2">${item.unit}</td>
                    <td rowspan="2">${item.nomorBukti}</td>
                    <td rowspan="2">${item.uraian}</td>
                    <td>${item.coaDebit}</td>
                    <td>${item.debit}</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>${item.coaKredit}</td>
                    <td>0</td>
                    <td>${item.kredit}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
      newWindow.document.close();
    }
  };

  const downloadPdfReport = () => {
    const doc = new jsPDF();

    // Load the logo and draw it on the PDF
    doc.addImage(logo, "PNG", 15, 10, 18, 20);

    // Set up header
    doc.setFontSize(10);
    doc.text("UNIVERSITAS ISLAM SULTAN AGUNG", 105, 20, null, null, "center");
    doc.setFontSize(6);
    doc.text(
      "Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah",
      105,
      24,
      null,
      null,
      "center"
    );

    doc.text("Info : Telp. +62 24 6583584", 105, 27, null, null, "center");
    doc.setTextColor(0, 102, 204); // Optional: add color for link
    doc.textWithLink(
      "http://www.unissula.ac.id",
      94,
      30,
      {
        url: "http://www.unissula.ac.id",
      },
      "center"
    );
    // Draw a line below the header
    doc.setDrawColor(0, 0, 0); // Set line color to black
    doc.setLineWidth(0.5); // Set line width
    doc.line(15, 32, 200, 32); // Draw line from (x1, y1) to (x2, y2)

    // Report title and period
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("LAPORAN JURNAL", 105, 40, null, null, "center");
    doc.setFontSize(8);
    doc.text(`Periode: ${startDate} - ${endDate}`, 15, 43, null, null, "left");

    // Define table headers
    const tableHeaders = [
      ["TANGGAL", "UNIT", "NOMOR BUKTI", "URAIAN", "COA", "DEBIT", "KREDIT"],
    ];

    // Prepare data for the table with alternating debit and credit rows
    const tableData = jurnal.flatMap((item) => [
      [
        item.tanggal,
        item.unit,
        item.nomorBukti,
        item.uraian,
        item.coaDebit,
        item.debit,
        "0", // Empty for Kredit row
        "0",
      ],
      ["", "", "", "", item.coaKredit, "0", item.kredit],
    ]);

    // Add table to PDF with autoTable
    doc.autoTable({
      startY: 46,
      head: tableHeaders,
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 6,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [242, 242, 242],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 50 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 },
      },
    });

    doc.save("Laporan_Jurnal.pdf");
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-8 mt-10">
      <h1 className="text-start text-3xl font-bold text-gray-800 mb-6">
        Journal
      </h1>
      <div className="mb-4">
        <span className="font-semibold text-lg">Periode</span>
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Tanggal Selesai
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Format
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select Format</option>
          <option value="html">HTML</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
      {isLoading ? (
        <div className="w-full flex justify-center mt-8">
          <OrbitProgress
            variant="dotted"
            color="#69c53e"
            text=""
            style={{ fontSize: "8px" }}
            textColor=""
          />
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          className="w-full mt-6 bg-green-500 text-white font-semibold p-3 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Download Jurnal
        </button>
      )}
    </div>
  );
}
