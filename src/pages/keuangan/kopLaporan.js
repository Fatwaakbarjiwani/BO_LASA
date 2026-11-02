import logoUrl from "../../assets/logo-lazis.png";

/** Kop surat bersama untuk semua cetak PDF/CSV laporan keuangan BO. */

export const NAMA_LEMBAGA = "LAZIS Sultan Agung";
export const NAMA_UNIT = "Yayasan Badan Wakaf Sultan Agung";

let logoCache;

/** Muat logo sebagai data-URL PNG (di-cache). Hasil null bila gagal dimuat; kop tetap tercetak tanpa logo. */
export function muatLogo() {
  logoCache ||= new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Diperkecil (maks 360 px) supaya berkas PDF tetap ringan.
      const skala = Math.min(1, 360 / img.naturalWidth);
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * skala);
      c.height = Math.round(img.naturalHeight * skala);
      const g = c.getContext("2d");
      g.fillStyle = "#fff";
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      resolve({ data: c.toDataURL("image/png"), w: c.width, h: c.height });
    };
    img.onerror = () => resolve(null);
    img.src = logoUrl;
  });
  return logoCache;
}

export const waktuCetak = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/**
 * Gambar kop (logo + nama lembaga + garis), judul laporan, dan baris periode/filter di halaman PDF aktif.
 * Mengembalikan posisi y (mm) tempat isi laporan boleh dimulai.
 */
export function gambarKop(doc, logo, judul, subjudul) {
  const lebar = doc.internal.pageSize.getWidth();
  const kiri = 14;
  let xTeks = kiri;
  if (logo) {
    const tinggi = 20;
    const lebarLogo = (tinggi * logo.w) / logo.h;
    doc.addImage(logo.data, "PNG", kiri, 7, lebarLogo, tinggi);
    xTeks = kiri + lebarLogo + 4;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(NAMA_LEMBAGA.toUpperCase(), xTeks, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(NAMA_UNIT, xTeks, 21);
  doc.setFontSize(8);
  doc.text(`Dicetak ${waktuCetak()}`, lebar - kiri, 15, { align: "right" });

  doc.setLineWidth(0.6);
  doc.line(kiri, 30, lebar - kiri, 30);
  doc.setLineWidth(0.15);
  doc.line(kiri, 31, lebar - kiri, 31);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(judul, lebar / 2, 38, { align: "center" });
  let y = 38;
  if (subjudul) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    y += 5;
    doc.text(subjudul, lebar / 2, y, { align: "center" });
  }
  return y + 6;
}

/** Baris-baris kop untuk CSV (CSV tidak bisa memuat gambar, jadi logo diganti nama lembaga). */
export function barisKopCsv(judul, subjudul) {
  return [[NAMA_LEMBAGA.toUpperCase()], [NAMA_UNIT], [judul], subjudul ? [subjudul] : [], [`Dicetak ${waktuCetak()}`], []];
}

export function csvDari(rows) {
  return rows.map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
}

export function simpanCsv(rows, namaFile) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csvDari(rows)], { type: "text/csv;charset=utf-8" }));
  a.download = namaFile;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Buka PDF di tab baru + dialog cetak; bila pop-up diblokir, unduh langsung. */
export function bukaPdf(doc, namaFile = "laporan.pdf") {
  doc.autoPrint();
  const w = window.open(doc.output("bloburl"), "_blank");
  if (!w) doc.save(namaFile);
}
