import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { bukaPdf, gambarKop, muatLogo } from "./kopLaporan";

/**
 * Cetak laporan bulanan (LPD, Laba Rugi) ke PDF A4 lanskap dengan kop + logo, tabel rapi, dan nomor halaman.
 *  rows: [{ tipe: "header" | "sub" | "item" | "total", label, nilai?: number[], jumlah?: boolean }]
 *  - header : judul bagian (satu sel penuh)    - sub : sub judul bagian
 *  - item   : baris biasa                       - total: baris tebal berlatar abu
 *  jumlah (default true) menambahkan kolom total tahun di sisi kanan baris yang bernilai.
 */

const fmt = (v) => {
  const n = Math.round(Number(v) || 0);
  const s = new Intl.NumberFormat("id-ID").format(Math.abs(n));
  return n < 0 ? `(${s})` : s;
};

export async function cetakLaporanBulanan({ judul, subjudul, kolom, rows, namaFile = "laporan.pdf", tanpaJumlah = false }) {
  const logo = await muatLogo();
  const doc = new jsPDF({ format: "a4", orientation: "landscape", unit: "mm" });
  const startY = gambarKop(doc, logo, judul, subjudul);
  const n = kolom.length;
  const penuh = n + (tanpaJumlah ? 1 : 2);

  const body = rows.map((r) => {
    if (r.tipe === "header") {
      return [{ content: r.label, colSpan: penuh, styles: { fontStyle: "bold", fillColor: [220, 237, 224], textColor: [22, 80, 45] } }];
    }
    if (r.tipe === "sub") {
      return [{ content: r.label, colSpan: penuh, styles: { fontStyle: "bold", textColor: [90, 90, 90] } }];
    }
    const nilai = r.nilai || [];
    const adaJumlah = !tanpaJumlah && r.jumlah !== false && nilai.length > 0;
    const total = nilai.reduce((s, v) => s + (Number(v) || 0), 0);
    const gaya = r.tipe === "total" ? { fontStyle: "bold", fillColor: [238, 238, 238] } : {};
    return [
      { content: (r.tipe === "item" ? "   " : "") + r.label, styles: gaya },
      ...kolom.map((_, i) => ({ content: nilai.length ? fmt(nilai[i]) : "", styles: { halign: "right", ...gaya } })),
      ...(tanpaJumlah ? [] : [{ content: adaJumlah ? fmt(total) : "", styles: { halign: "right", fontStyle: "bold", ...gaya } }]),
    ];
  });

  autoTable(doc, {
    startY,
    head: [["Uraian", ...kolom, ...(tanpaJumlah ? [] : ["Jumlah"])]],
    body,
    theme: "grid",
    margin: { left: 14, right: 14, bottom: 14 },
    styles: { fontSize: n > 8 ? 6.5 : 8, cellPadding: 1.3, overflow: "linebreak", lineColor: [190, 190, 190], lineWidth: 0.1 },
    headStyles: { fillColor: [22, 101, 52], halign: "center", valign: "middle" },
    columnStyles: { 0: { cellWidth: n > 8 ? 58 : 80 } },
    didDrawPage: () => {
      const lebar = doc.internal.pageSize.getWidth();
      const tinggi = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Halaman ${doc.internal.getCurrentPageInfo().pageNumber}`, lebar - 14, tinggi - 7, { align: "right" });
    },
  });
  bukaPdf(doc, namaFile);
}
