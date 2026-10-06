import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { bukaPdf, gambarKop, muatLogo } from "./kopLaporan";

/**
 * Cetak jurnal ke PDF berkop + logo (dibuka di tab baru dan langsung memunculkan dialog cetak). Keduanya async.
 *  - cetakJurnal(detail)                 : satu jurnal (bukti jurnal), detail = hasil keuangan.jurnalDetail(id)
 *  - cetakDaftarJurnal(rows, opsi)       : banyak jurnal sesuai filter/periode, rows = hasil keuangan.jurnal(params)
 */

const rp = (v) => new Intl.NumberFormat("id-ID").format(Math.round(Number(v) || 0));
const tgl = (v) => (v ? String(v).slice(0, 10).split("-").reverse().join("-") : "");

export async function cetakJurnal(detail) {
  if (!detail) return;
  const logo = await muatLogo();
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  let y = gambarKop(doc, logo, "BUKTI JURNAL", detail.nomorBukti);

  const info = [
    ["Tanggal", tgl(detail.tanggal)],
    ["Jenis", detail.jenis],
    ["Dana", detail.dana],
    ["Status", detail.status],
    ["Keterangan", detail.keterangan || "-"],
  ];
  const pen = detail.penerimaan?.[0];
  if (pen) info.push(["Donatur", `${pen.donatur_nama || "-"}${pen.metode_bayar ? ` (${pen.metode_bayar})` : ""}`]);
  doc.setFontSize(9.5);
  info.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.text(k, 14, y);
    doc.setFont("helvetica", "normal");
    const baris = doc.splitTextToSize(`: ${v ?? ""}`, 140);
    doc.text(baris, 40, y);
    y += 5 * baris.length;
  });

  const baris = (detail.baris || []).filter((b) => !b.dihapus);
  const td = baris.reduce((s, b) => s + (Number(b.debit) || 0), 0);
  const tk = baris.reduce((s, b) => s + (Number(b.kredit) || 0), 0);
  autoTable(doc, {
    startY: y + 2,
    head: [["Dana", "Kode", "Akun", "Debit", "Kredit"]],
    body: baris.map((b) => [b.dana, b.kode, b.akun, Number(b.debit) ? rp(b.debit) : "", Number(b.kredit) ? rp(b.kredit) : ""]),
    foot: [["", "", "Total", rp(td), rp(tk)]],
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 101, 52] },
    footStyles: { fillColor: [235, 235, 235], textColor: 20, fontStyle: "bold" },
    columnStyles: { 3: { halign: "right" }, 4: { halign: "right" } },
  });
  y = doc.lastAutoTable.finalY + 6;

  if (detail.penyaluran?.length) {
    autoTable(doc, {
      startY: y,
      head: [["Penerima", "Asnaf", "Jumlah"]],
      body: detail.penyaluran.map((p) => [p.penerima || "-", p.asnaf || "", rp(p.jumlah)]),
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [22, 101, 52] },
      columnStyles: { 2: { halign: "right" } },
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // Kolom tanda tangan
  const tinggi = doc.internal.pageSize.getHeight();
  if (y > tinggi - 45) {
    doc.addPage();
    y = 20;
  }
  const lebar = doc.internal.pageSize.getWidth();
  const kol = (lebar - 28) / 3;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  ["Dibuat oleh", "Diperiksa oleh", "Disetujui oleh"].forEach((t, i) => {
    const x = 14 + kol * i + kol / 2;
    doc.text(t, x, y + 4, { align: "center" });
    doc.line(x - kol / 2 + 6, y + 28, x + kol / 2 - 6, y + 28);
  });
  bukaPdf(doc, "bukti-jurnal.pdf");
}

export async function cetakDaftarJurnal(rows, { rentang = "", filter = "" } = {}) {
  const logo = await muatLogo();
  const doc = new jsPDF({ format: "a4", orientation: "landscape", unit: "mm" });
  const sub = [rentang, filter].filter(Boolean).join(" | ");
  const y = gambarKop(doc, logo, "DAFTAR JURNAL", sub);
  const total = rows.filter((r) => r.status === "POSTED").reduce((s, r) => s + (Number(r.total) || 0), 0);
  autoTable(doc, {
    startY: y,
    head: [["No. Bukti", "Tanggal", "Jenis", "Dana", "Pihak", "Keterangan", "Status", "Nilai"]],
    body: rows.map((r) => [r.nomorBukti, tgl(r.tanggal), r.jenis, r.dana, r.pihak || "", r.keterangan || "", r.status, rp(r.total)]),
    foot: [["", "", "", "", "", "", "Total (POSTED)", rp(total)]],
    theme: "grid",
    styles: { fontSize: 8, overflow: "linebreak" },
    headStyles: { fillColor: [22, 101, 52] },
    footStyles: { fillColor: [235, 235, 235], textColor: 20, fontStyle: "bold" },
    columnStyles: { 5: { cellWidth: 70 }, 7: { halign: "right" } },
    margin: { left: 14, right: 14, bottom: 14 },
    didDrawPage: () => {
      const n = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.text(`Halaman ${n}`, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 6, { align: "right" });
    },
  });
  bukaPdf(doc, "daftar-jurnal.pdf");
}
