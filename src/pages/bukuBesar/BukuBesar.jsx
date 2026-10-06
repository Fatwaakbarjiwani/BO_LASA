import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryCoa } from "../../redux/actions/ziswafAction";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, SearchSelect, inputCls, num } from "../keuangan/ui";
import logo from "../../assets/logo-lazis.png";

/*
 * Buku Besar. Data dari GET /keuangan/buku-besar (ledger + saldo awal, jurnal VOID tidak ikut).
 * - Akun: semua akun, satu akun, atau beberapa akun terpilih.
 * - Tampilan web berhalaman; unduhan PDF / cetak memuat kop, periode, tanggal cetak, dan kolom tanda tangan.
 */

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const pad = (n) => String(n).padStart(2, "0");
const isoHariIni = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const isoAwalBulan = () => `${isoHariIni().slice(0, 8)}01`;
const tglPanjang = (iso) => { const [y, m, d] = String(iso).slice(0, 10).split("-"); return `${Number(d)} ${BULAN[Number(m) - 1]} ${y}`; };
const tglCetak = () => { const d = new Date(); return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}.${pad(d.getMinutes())}`; };
const angka = (v) => { const n = Number(v) || 0; return n < 0 ? `(${num(-n)})` : num(n); };
const BARIS_PER_HALAMAN = [25, 50, 100];

/** Nama file standar: Buku_Besar_<akun>_<dari>_sd_<sampai>.pdf */
function namaFile(hasil, pilihan) {
  const bagian = hasil.mode === "SEMUA" ? "Semua_Akun"
    : hasil.mode === "SATU" ? (hasil.akun[0]?.kode || "Akun")
      : `${pilihan.length}_Akun`;
  return `Buku_Besar_${bagian}_${hasil.from}_sd_${hasil.to}.pdf`;
}

function muatLogo() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Perkecil dulu (maks. 300 px) supaya ukuran PDF tidak membengkak oleh logo beresolusi penuh.
      const skala = Math.min(1, 300 / img.naturalWidth);
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * skala); c.height = Math.round(img.naturalHeight * skala);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve({ data: c.toDataURL("image/png"), w: c.width, h: c.height });
    };
    img.onerror = () => resolve(null);
    img.src = logo;
  });
}

/** Susun PDF laporan: kop, judul, periode, tanggal cetak, tabel per akun, tanda tangan. */
async function buatPdf(hasil) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const lg = await muatLogo();
  if (lg) doc.addImage(lg.data, "PNG", 14, 10, 24, (24 * lg.h) / lg.w);
  doc.setFont("helvetica", "bold").setFontSize(14).text("LAZIS SULTAN AGUNG", W / 2, 15, { align: "center" });
  doc.setFont("helvetica", "normal").setFontSize(9)
    .text("Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah · Telp. +62 24 6583584 · lazis-sa.org", W / 2, 20, { align: "center" });
  doc.setLineWidth(0.5).line(14, 32, W - 14, 32);
  doc.setFont("helvetica", "bold").setFontSize(12).text("LAPORAN BUKU BESAR", W / 2, 40, { align: "center" });
  doc.setFont("helvetica", "normal").setFontSize(9);
  doc.text(`Periode: ${tglPanjang(hasil.from)} s.d. ${tglPanjang(hasil.to)}`, 14, 47);
  doc.text(`Tanggal cetak: ${tglCetak()}`, W - 14, 47, { align: "right" });

  let y = 52;
  hasil.akun.forEach((a) => {
    const body = [
      ["", "", "Saldo awal", "", "", angka(a.saldoAwal)],
      ...a.baris.map((b) => [tglPanjang(b.tanggal), b.nomorBukti, b.uraian || "", Number(b.debit) ? num(b.debit) : "", Number(b.kredit) ? num(b.kredit) : "", angka(b.saldo)]),
    ];
    autoTable(doc, {
      startY: y,
      head: [[{ content: `${a.kode}  ${a.nama}   (saldo normal ${a.saldoNormal === "DEBIT" ? "debet" : "kredit"})`, colSpan: 6, styles: { halign: "left", fillColor: [236, 253, 245], textColor: [6, 95, 70] } }],
        ["Tanggal", "No. Bukti", "Uraian", "Debet", "Kredit", "Saldo"]],
      body,
      foot: [["", "", "Total mutasi / saldo akhir", num(a.totalDebit), num(a.totalKredit), angka(a.saldoAkhir)]],
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      headStyles: { fillColor: [240, 240, 240], textColor: 30 },
      footStyles: { fillColor: [245, 245, 245], textColor: 30, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 24 }, 1: { cellWidth: 28 }, 3: { halign: "right", cellWidth: 24 }, 4: { halign: "right", cellWidth: 24 }, 5: { halign: "right", cellWidth: 26 } },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 6;
  });

  // Tanda tangan
  if (y > doc.internal.pageSize.getHeight() - 50) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.text(`Semarang, ${tglPanjang(isoHariIni())}`, W - 14, y + 4, { align: "right" });
  const kolom = [[40, "Disiapkan oleh,", "Staf Keuangan"], [W - 50, "Mengetahui,", "Direktur LAZIS Sultan Agung"]];
  kolom.forEach(([x, judul, jabatan]) => {
    doc.text(judul, x, y + 12, { align: "center" });
    doc.text(jabatan, x, y + 17, { align: "center" });
    doc.text("(.................................)", x, y + 40, { align: "center" });
  });

  const n = doc.internal.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFontSize(7).text(`Halaman ${i} dari ${n}`, W - 14, doc.internal.pageSize.getHeight() - 8, { align: "right" });
  }
  return doc;
}

function PilihAkun({ coa, pilihan, onChange }) {
  const sisa = coa.filter((c) => !pilihan.some((p) => String(p) === String(c.id)));
  const label = (id) => { const c = coa.find((x) => String(x.id) === String(id)); return c ? `${c.accountCode} ${c.accountName}` : id; };
  return (
    <div className="space-y-2">
      <SearchSelect value="" onChange={(v) => onChange([...pilihan, v])}
        options={sisa.map((c) => ({ value: c.id, label: `${c.accountCode} ${c.accountName}` }))} placeholder="Cari & tambah akun…" />
      <div className="flex flex-wrap gap-1.5">
        {pilihan.map((id) => (
          <span key={id} className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs">
            {label(id)}
            <button type="button" className="text-blue-500 hover:text-red-600" onClick={() => onChange(pilihan.filter((p) => p !== id))} title="Hapus">×</button>
          </span>
        ))}
        {pilihan.length === 0 && <span className="text-xs text-gray-400">Belum ada akun dipilih</span>}
      </div>
    </div>
  );
}
PilihAkun.propTypes = { coa: PropTypes.array, pilihan: PropTypes.array, onChange: PropTypes.func };

export default function BukuBesar() {
  const dispatch = useDispatch();
  const { coaCategory } = useSelector((state) => state.ziswaf);
  const [dari, setDari] = useState(isoAwalBulan());
  const [sampai, setSampai] = useState(isoHariIni());
  const [mode, setMode] = useState("PILIH"); // SEMUA | PILIH
  const [pilihan, setPilihan] = useState([]);
  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50);

  useEffect(() => { dispatch(getCategoryCoa()); }, [dispatch]);

  const tampilkan = async () => {
    if (!dari || !sampai) return Swal.fire({ icon: "info", title: "Isi tanggal awal dan tanggal akhir" });
    if (dari > sampai) return Swal.fire({ icon: "info", title: "Tanggal awal tidak boleh sesudah tanggal akhir" });
    if (mode === "PILIH" && pilihan.length === 0) return Swal.fire({ icon: "info", title: "Pilih minimal satu akun", text: "Atau pilih \"Semua akun\"." });
    setMemuat(true);
    try {
      const r = await keuangan.bukuBesar({ akun: mode === "SEMUA" ? undefined : pilihan.join(","), from: dari, to: sampai });
      setHasil(r);
      setPage(1);
    } catch (e) {
      Swal.fire({ icon: "error", title: "Gagal memuat buku besar", text: errMsg(e) });
    } finally {
      setMemuat(false);
    }
  };

  const unduh = async (cetak) => {
    try {
      const doc = await buatPdf(hasil);
      if (cetak) { doc.autoPrint(); window.open(doc.output("bloburl"), "_blank"); }
      else doc.save(namaFile(hasil, pilihan));
    } catch (e) {
      Swal.fire({ icon: "error", title: "Gagal membuat PDF", text: String(e?.message || e) });
    }
  };

  // Pagination web: baris mutasi semua akun diratakan; tiap halaman menampilkan judul akun yang barisnya ada di halaman itu.
  const entri = useMemo(() => {
    if (!hasil) return [];
    const out = [];
    hasil.akun.forEach((a, ai) => {
      if (a.baris.length === 0) out.push({ ai, bi: -1 });
      a.baris.forEach((_, bi) => out.push({ ai, bi }));
    });
    return out;
  }, [hasil]);
  const totalHalaman = Math.max(1, Math.ceil(entri.length / size));
  const potong = entri.slice((page - 1) * size, page * size);
  const kelompok = [];
  potong.forEach((e) => {
    const g = kelompok[kelompok.length - 1];
    if (g && g.ai === e.ai) g.items.push(e.bi); else kelompok.push({ ai: e.ai, items: [e.bi] });
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 shadow rounded-lg space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Buku Besar</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="block text-sm text-gray-600">Tanggal awal
            <input type="date" className={inputCls} value={dari} max={sampai || undefined} onChange={(e) => setDari(e.target.value)} />
          </label>
          <label className="block text-sm text-gray-600">Tanggal akhir
            <input type="date" className={inputCls} value={sampai} min={dari || undefined} onChange={(e) => setSampai(e.target.value)} />
          </label>
          <div className="md:col-span-2 text-sm text-gray-600">
            Akun
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-1.5"><input type="radio" checked={mode === "SEMUA"} onChange={() => setMode("SEMUA")} /> Semua akun</label>
              <label className="flex items-center gap-1.5"><input type="radio" checked={mode === "PILIH"} onChange={() => setMode("PILIH")} /> Pilih akun (satu atau beberapa)</label>
            </div>
          </div>
        </div>
        {mode === "PILIH" && <PilihAkun coa={coaCategory || []} pilihan={pilihan} onChange={setPilihan} />}
        <div className="flex flex-wrap gap-2">
          <Btn color="green" disabled={memuat} onClick={tampilkan}>{memuat ? "Memuat…" : "Tampilkan"}</Btn>
          <Btn color="blue" disabled={!hasil || memuat} onClick={() => unduh(false)}>Unduh PDF</Btn>
          <Btn color="gray" disabled={!hasil || memuat} onClick={() => unduh(true)}>Cetak</Btn>
        </div>
        {hasil && <div className="text-xs text-gray-500">Unduhan PDF berisi seluruh data periode {tglPanjang(hasil.from)} s.d. {tglPanjang(hasil.to)}, lengkap dengan tanggal cetak dan kolom tanda tangan. Nama file: {namaFile(hasil, pilihan)}</div>}
      </div>

      {hasil && (
        <div className="bg-white p-5 shadow rounded-lg">
          <div className="flex flex-wrap justify-between gap-2 mb-3 text-sm text-gray-600">
            <div>Periode {tglPanjang(hasil.from)} s.d. {tglPanjang(hasil.to)} · {hasil.akun.length} akun</div>
            <div>Total mutasi: debet {num(hasil.totalDebit)} · kredit {num(hasil.totalKredit)}</div>
          </div>
          {hasil.akun.length === 0 && <div className="text-center text-gray-400 py-6">Tidak ada saldo maupun mutasi pada periode ini</div>}
          {kelompok.map((g) => {
            const a = hasil.akun[g.ai];
            const awal = g.items[0] <= 0;
            const akhir = g.items[g.items.length - 1] === a.baris.length - 1 || a.baris.length === 0;
            return (
              <div key={`${g.ai}-${g.items[0]}`} className="mb-5">
                <div className="flex flex-wrap items-center gap-2 font-semibold text-gray-700 mb-1">
                  {a.kode} {a.nama} <DanaBadge dana={a.dana} />
                  <span className="text-xs font-normal text-gray-400">saldo normal {a.saldoNormal === "DEBIT" ? "debet" : "kredit"}{!awal ? " · lanjutan" : ""}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                      <tr><th className="text-left py-1.5 px-2">Tanggal</th><th className="text-left px-2">No. bukti</th><th className="text-left px-2">Uraian</th>
                        <th className="text-right px-2">Debet</th><th className="text-right px-2">Kredit</th><th className="text-right px-2">Saldo</th></tr>
                    </thead>
                    <tbody>
                      {awal && (
                        <tr className="border-t bg-gray-50"><td className="py-1.5 px-2" colSpan={5}>Saldo awal</td><td className="px-2 text-right tabular-nums">{angka(a.saldoAwal)}</td></tr>
                      )}
                      {g.items.filter((bi) => bi >= 0).map((bi) => {
                        const b = a.baris[bi];
                        return (
                          <tr key={bi} className="border-t">
                            <td className="py-1.5 px-2 whitespace-nowrap">{tglPanjang(b.tanggal)}</td>
                            <td className="px-2 whitespace-nowrap">{b.nomorBukti}</td>
                            <td className="px-2">{b.uraian || ""}</td>
                            <td className="px-2 text-right tabular-nums">{Number(b.debit) ? num(b.debit) : ""}</td>
                            <td className="px-2 text-right tabular-nums">{Number(b.kredit) ? num(b.kredit) : ""}</td>
                            <td className="px-2 text-right tabular-nums">{angka(b.saldo)}</td>
                          </tr>
                        );
                      })}
                      {akhir && (
                        <tr className="border-t font-semibold bg-gray-50">
                          <td className="py-1.5 px-2" colSpan={3}>Total mutasi / saldo akhir</td>
                          <td className="px-2 text-right tabular-nums">{num(a.totalDebit)}</td>
                          <td className="px-2 text-right tabular-nums">{num(a.totalKredit)}</td>
                          <td className="px-2 text-right tabular-nums">{angka(a.saldoAkhir)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          {entri.length > 0 && (
            <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-gray-600">
              <select className="border rounded px-2 py-1 text-sm" value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}>
                {BARIS_PER_HALAMAN.map((u) => <option key={u} value={u}>{u} baris / halaman</option>)}
              </select>
              <Btn color="gray" disabled={page <= 1} onClick={() => setPage((x) => x - 1)}>‹ Sebelumnya</Btn>
              <span>Hal. {page} dari {totalHalaman}</span>
              <Btn color="gray" disabled={page >= totalHalaman} onClick={() => setPage((x) => x + 1)}>Berikutnya ›</Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
