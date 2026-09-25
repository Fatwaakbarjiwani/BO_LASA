import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { wakaf } from "../../services/wakafApi";
import { errMsg } from "../../services/keuanganApi";
import { Btn, Field, Judul, inputCls, num, today } from "../keuangan/ui";

/*
 * Lima formulir input buku wakaf, sama dengan sheet input laporan BWI:
 * Penerimaan Harta Benda Wakaf, Mutasi Pengelolaan, Dampak Pengukuran Ulang, Hasil Pengelolaan, Penyaluran Mauquf Alaih.
 * Setiap simpan menjadi satu jurnal seimbang di buku wakaf (bukan buku ZIS).
 */

export function useWakafMeta() {
  const [meta, setMeta] = useState(null);
  const muat = () => wakaf.meta().then(setMeta).catch((e) => Swal.fire("Gagal memuat data", errMsg(e), "error"));
  useEffect(() => { muat(); }, []);
  return [meta, muat];
}

const ASET = ["KAS", "PIUTANG", "SURAT_BERHARGA", "LOGAM_MULIA", "ASET_LANCAR_LAIN", "INVESTASI", "ASET_TETAP",
  "ASET_TAK_BERWUJUD", "ASET_TIDAK_LANCAR_LAIN"];
const akunKelompok = (meta, kelompok) => meta.akun.filter((a) => kelompok.includes(a.kelompok));
const namaAkun = (meta, kode) => meta?.akun.find((a) => a.kode === kode)?.nama || kode;
const temporer = (jenis) => (jenis || "").includes("TEMPORER");
const kreditPenerimaan = (jenis) =>
  jenis.endsWith("PENDEK") && temporer(jenis) ? "2201" : jenis.endsWith("PANJANG") && temporer(jenis) ? "2301" : "4101";

async function simpan(aksi, reset) {
  try {
    const r = await aksi();
    await Swal.fire("Tersimpan", `Nomor bukti ${r.nomorBukti}`, "success");
    reset();
  } catch (e) {
    Swal.fire("Gagal", errMsg(e), "error");
  }
}

function Pratinjau({ meta, baris }) {
  const d = baris.reduce((s, b) => s + (Number(b.debit) || 0), 0);
  const k = baris.reduce((s, b) => s + (Number(b.kredit) || 0), 0);
  return (
    <div className="bg-white rounded-lg shadow p-4 text-sm">
      <div className="font-semibold text-gray-700 mb-2">Pratinjau jurnal buku wakaf</div>
      <table className="w-full">
        <thead className="text-xs text-gray-500">
          <tr><th className="text-left">Akun</th><th className="text-right">Debit</th><th className="text-right">Kredit</th></tr>
        </thead>
        <tbody>
          {baris.map((b, i) => (
            <tr key={i} className="border-t">
              <td className="py-1">{b.akun ? `${b.akun} ${namaAkun(meta, b.akun)}` : <span className="text-gray-400">(pilih akun)</span>}</td>
              <td className="py-1 text-right tabular-nums">{b.debit ? num(b.debit) : ""}</td>
              <td className="py-1 text-right tabular-nums">{b.kredit ? num(b.kredit) : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`mt-2 text-xs ${d === k && d > 0 ? "text-green-700" : "text-gray-400"}`}>
        {d === k && d > 0 ? "Seimbang" : "Lengkapi isian"}
      </div>
    </div>
  );
}
Pratinjau.propTypes = { meta: PropTypes.object, baris: PropTypes.array };

const Rupiah = ({ value, onChange }) => (
  <input type="number" min="0" step="1" className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
);
Rupiah.propTypes = { value: PropTypes.any, onChange: PropTypes.func };

const Cek = ({ label, value, onChange }) => (
  <label className="flex items-center gap-2 text-sm text-gray-700 mt-6">
    <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {label}
  </label>
);
Cek.propTypes = { label: PropTypes.string, value: PropTypes.bool, onChange: PropTypes.func };

function Kerangka({ judul, info, children, pratinjau, bisaSimpan, onSimpan }) {
  return (
    <div>
      <Judul>{judul}</Judul>
      {info && <p className="text-sm text-gray-500 mb-4 -mt-2">{info}</p>}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 grid md:grid-cols-2 gap-3">{children}</div>
        <div className="space-y-3">
          {pratinjau}
          <Btn color="green" className="w-full" disabled={!bisaSimpan} onClick={onSimpan}>Simpan</Btn>
        </div>
      </div>
    </div>
  );
}
Kerangka.propTypes = {
  judul: PropTypes.string, info: PropTypes.string, children: PropTypes.node, pratinjau: PropTypes.node,
  bisaSimpan: PropTypes.bool, onSimpan: PropTypes.func,
};

// ------------------------------------------------------------------ 1. Penerimaan harta benda wakaf

export function PenerimaanHarta() {
  const [meta, muatUlang] = useWakafMeta();
  const kosong = {
    tanggal: today(), nama: "", jenisHbw: "WAKAF_UANG", akunKode: "1101", jangkaWaktu: "Permanen", jatuhTempo: "",
    nilai: "", wakifNama: "", aiw: false, sertifikat: false, stafNazhir: "", peruntukan: "PRODUKTIF", program: "", keterangan: "",
  };
  const [f, setF] = useState(kosong);
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const uang = f.jenisHbw.includes("UANG");
  const tmp = temporer(f.jenisHbw);

  const akunList = useMemo(() => {
    if (!meta) return [];
    if (uang) {
      return meta.akun.filter((a) => a.kelompok === "KAS" && (tmp ? a.kode !== "1101" : a.kode === "1101"));
    }
    return akunKelompok(meta, ASET).filter((a) => a.kode !== "1791");
  }, [meta, uang, tmp]);

  useEffect(() => {
    if (!akunList.some((a) => a.kode === f.akunKode)) set("akunKode", akunList[0]?.kode || "");
    set("jangkaWaktu", tmp ? "Temporer" : "Permanen");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.jenisHbw, akunList.length]);

  if (!meta) return <div className="text-gray-400">Memuat…</div>;
  const nilai = Number(f.nilai) || 0;
  const lengkap = f.nama && f.wakifNama && f.akunKode && nilai > 0 && (!tmp || f.jatuhTempo);
  return (
    <Kerangka
      judul="Penerimaan Harta Benda Wakaf"
      info="Satu baris sheet 'Penerimaan Harta Wakaf' BWI. Harta tercatat di daftar harta wakaf; wakaf temporer menjadi liabilitas."
      pratinjau={<Pratinjau meta={meta} baris={[{ akun: f.akunKode, debit: nilai }, { akun: kreditPenerimaan(f.jenisHbw), kredit: nilai }]} />}
      bisaSimpan={!!lengkap}
      onSimpan={() => simpan(() => wakaf.penerimaan({ ...f, nilai }), () => { setF({ ...kosong, tanggal: f.tanggal }); muatUlang(); })}
    >
      <Field label="Tanggal perolehan"><input type="date" className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
      <Field label="Jenis harta benda wakaf">
        <select className={inputCls} value={f.jenisHbw} onChange={(e) => set("jenisHbw", e.target.value)}>
          {meta.jenisHbw.map((j) => <option key={j.kode} value={j.kode}>{j.nama}</option>)}
        </select>
      </Field>
      <Field label="Nama harta benda wakaf" hint="Mis. Tanah Kel. Dadapsari, Semarang 313 (M2)">
        <input className={inputCls} value={f.nama} onChange={(e) => set("nama", e.target.value)} />
      </Field>
      <Field label="Akun wakaf">
        <select className={inputCls} value={f.akunKode} onChange={(e) => set("akunKode", e.target.value)}>
          {akunList.map((a) => <option key={a.kode} value={a.kode}>{a.kode} {a.nama}</option>)}
        </select>
      </Field>
      <Field label="Nilai wajar (Rp)" hint="Appraisal, NJOP (tanah/bangunan), atau nilai pasar"><Rupiah value={f.nilai} onChange={(v) => set("nilai", v)} /></Field>
      <Field label="Nama wakif"><input className={inputCls} value={f.wakifNama} onChange={(e) => set("wakifNama", e.target.value)} /></Field>
      <Field label="Jangka waktu"><input className={inputCls} value={f.jangkaWaktu} onChange={(e) => set("jangkaWaktu", e.target.value)} /></Field>
      {tmp && <Field label="Jatuh tempo (wajib untuk temporer)"><input type="date" className={inputCls} value={f.jatuhTempo} onChange={(e) => set("jatuhTempo", e.target.value)} /></Field>}
      <Field label="Jenis wakaf">
        <select className={inputCls} value={f.peruntukan} onChange={(e) => set("peruntukan", e.target.value)}>
          <option value="PRODUKTIF">Wakaf Produktif</option>
          <option value="SOSIAL">Wakaf Sosial</option>
        </select>
      </Field>
      <Field label="Peruntukan program (opsional)"><input className={inputCls} value={f.program} onChange={(e) => set("program", e.target.value)} /></Field>
      <Field label="Staf nazhir"><input className={inputCls} value={f.stafNazhir} onChange={(e) => set("stafNazhir", e.target.value)} /></Field>
      <div className="flex gap-6">
        <Cek label="Akta Ikrar Wakaf (AIW) ada" value={f.aiw} onChange={(v) => set("aiw", v)} />
        <Cek label="Sertifikat ada" value={f.sertifikat} onChange={(v) => set("sertifikat", v)} />
      </div>
      <Field label="Keterangan"><input className={inputCls} value={f.keterangan} onChange={(e) => set("keterangan", e.target.value)} /></Field>
    </Kerangka>
  );
}

// ------------------------------------------------------------------ 2. Mutasi pengelolaan

/** Isian bawaan akun (dari -> ke) per jenis transaksi; tetap bisa diubah. */
const PRESET_MUTASI = {
  "Piutang Wakaf": ["1101", "1201"], "Pembayaran Piutang": ["1201", "1101"],
  "Pembelian Efek Ekuitas": ["1101", "1301"], "Penjualan Efek Ekuitas": ["1301", "1101"],
  "Pembelian Efek Hutang": ["1101", "1302"], "Penerimaan Efek Hutang": ["1302", "1101"],
  "Pembelian Logam Mulia": ["1101", "1401"], "Penjualan Logam Mulia": ["1401", "1101"],
  "Penyertaan Investasi Entitas Lain": ["1101", "1601"], "Divestasi Entitas Lain": ["1601", "1101"],
  "Hutang Wakaf": ["2101", "1101"], "Pembayaran Hutang": ["1101", "2101"],
  "Pengadaan Aset Tetap": ["1101", "1702"], "Penyusutan Aset Tetap": ["1791", "5103"],
  "Penjualan Aset Tetap": ["1702", "1101"], "Pengembalian Wakaf Temporer": ["1103", "2301"],
};

export function MutasiPengelolaan() {
  const [meta, muatUlang] = useWakafMeta();
  const kosong = {
    tanggal: today(), jenisTransaksi: "Pembelian Logam Mulia", akunAsal: "1101", akunTujuan: "1401", nominal: "",
    hartaId: "", daftarBaru: false, namaHartaBaru: "", jenisHbwBaru: "", namaPj: "", viaMi: false, surat: "",
    stafNazhir: "", keterangan: "",
  };
  const [f, setF] = useState(kosong);
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const pilihJenis = (j) => {
    const p = PRESET_MUTASI[j];
    setF((o) => ({ ...o, jenisTransaksi: j, ...(p ? { akunAsal: p[0], akunTujuan: p[1] } : {}) }));
  };
  if (!meta) return <div className="text-gray-400">Memuat…</div>;
  const akunBoleh = akunKelompok(meta, [...ASET, "LIABILITAS_PENDEK", "LIABILITAS_PANJANG", "BEBAN_PENGELOLAAN"]);
  const nom = Number(f.nominal) || 0;
  const lengkap = f.akunAsal && f.akunTujuan && f.akunAsal !== f.akunTujuan && nom > 0 && (!f.daftarBaru || f.namaHartaBaru);
  return (
    <Kerangka
      judul="Mutasi Pengelolaan Harta Wakaf"
      info="Perubahan bentuk harta wakaf (mis. wakaf uang dibelikan logam mulia), hutang, penyusutan, dan pengembalian wakaf temporer."
      pratinjau={<Pratinjau meta={meta} baris={[{ akun: f.akunTujuan, debit: nom }, { akun: f.akunAsal, kredit: nom }]} />}
      bisaSimpan={!!lengkap}
      onSimpan={() => simpan(() => wakaf.mutasi({
        ...f, nominal: nom, hartaId: f.hartaId ? Number(f.hartaId) : null,
        namaHartaBaru: f.daftarBaru ? f.namaHartaBaru : null, jenisHbwBaru: f.daftarBaru ? f.jenisHbwBaru || null : null,
      }), () => { setF({ ...kosong, tanggal: f.tanggal }); muatUlang(); })}
    >
      <Field label="Tanggal transaksi"><input type="date" className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
      <Field label="Jenis transaksi">
        <select className={inputCls} value={f.jenisTransaksi} onChange={(e) => pilihJenis(e.target.value)}>
          {meta.jenisMutasi.map((j) => <option key={j}>{j}</option>)}
        </select>
      </Field>
      <Field label="Dari akun (dikredit)">
        <select className={inputCls} value={f.akunAsal} onChange={(e) => set("akunAsal", e.target.value)}>
          {akunBoleh.map((a) => <option key={a.kode} value={a.kode}>{a.kode} {a.nama}</option>)}
        </select>
      </Field>
      <Field label="Ke akun (didebit)">
        <select className={inputCls} value={f.akunTujuan} onChange={(e) => set("akunTujuan", e.target.value)}>
          {akunBoleh.map((a) => <option key={a.kode} value={a.kode}>{a.kode} {a.nama}</option>)}
        </select>
      </Field>
      <Field label="Nominal (Rp)" hint="Kas keluar ditolak bila saldo kas wakaf tidak cukup"><Rupiah value={f.nominal} onChange={(v) => set("nominal", v)} /></Field>
      <Field label="Harta asal (opsional)">
        <select className={inputCls} value={f.hartaId} onChange={(e) => set("hartaId", e.target.value)}>
          <option value="">—</option>
          {meta.harta.map((h) => <option key={h.id} value={h.id}>{h.nama}</option>)}
        </select>
      </Field>
      <Cek label="Daftarkan hasil mutasi sebagai harta wakaf baru" value={f.daftarBaru} onChange={(v) => set("daftarBaru", v)} />
      {f.daftarBaru && (
        <>
          <Field label="Nama harta tujuan"><input className={inputCls} value={f.namaHartaBaru} onChange={(e) => set("namaHartaBaru", e.target.value)} /></Field>
          <Field label="Jenis harta benda wakaf" hint="Kosong = mengikuti harta asal">
            <select className={inputCls} value={f.jenisHbwBaru} onChange={(e) => set("jenisHbwBaru", e.target.value)}>
              <option value="">(ikuti harta asal)</option>
              {meta.jenisHbw.map((j) => <option key={j.kode} value={j.kode}>{j.nama}</option>)}
            </select>
          </Field>
        </>
      )}
      <Field label="Nama PJ investasi"><input className={inputCls} value={f.namaPj} onChange={(e) => set("namaPj", e.target.value)} /></Field>
      <Cek label="Melalui manajer investasi (MI)" value={f.viaMi} onChange={(v) => set("viaMi", v)} />
      <Field label="Surat / dokumen"><input className={inputCls} value={f.surat} onChange={(e) => set("surat", e.target.value)} /></Field>
      <Field label="Staf nazhir"><input className={inputCls} value={f.stafNazhir} onChange={(e) => set("stafNazhir", e.target.value)} /></Field>
      <Field label="Keterangan"><input className={inputCls} value={f.keterangan} onChange={(e) => set("keterangan", e.target.value)} /></Field>
    </Kerangka>
  );
}

// ------------------------------------------------------------------ 3. Dampak pengukuran ulang

export function PengukuranUlang() {
  const [meta, muatUlang] = useWakafMeta();
  const kosong = { tanggal: today(), hartaId: "", arah: "NAIK", nilai: "", petugasAppraisal: "", acuan: "Appraisal", stafNazhir: "", keterangan: "" };
  const [f, setF] = useState(kosong);
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  if (!meta) return <div className="text-gray-400">Memuat…</div>;
  const harta = meta.harta.find((h) => String(h.id) === String(f.hartaId));
  const v = Number(f.nilai) || 0;
  const baris = f.arah === "NAIK"
    ? [{ akun: harta?.akunKode, debit: v }, { akun: "4201", kredit: v }]
    : [{ akun: "4201", debit: v }, { akun: harta?.akunKode, kredit: v }];
  return (
    <Kerangka
      judul="Dampak Pengukuran Ulang"
      info="Kenaikan atau penurunan nilai harta wakaf hasil penilaian ulang. Harta harus sudah tercatat di penerimaan atau mutasi."
      pratinjau={<Pratinjau meta={meta} baris={baris} />}
      bisaSimpan={!!harta && v > 0}
      onSimpan={() => simpan(() => wakaf.pengukuranUlang({
        tanggal: f.tanggal, hartaId: Number(f.hartaId), selisih: f.arah === "NAIK" ? v : -v,
        petugasAppraisal: f.petugasAppraisal, acuan: f.acuan, stafNazhir: f.stafNazhir, keterangan: f.keterangan,
      }), () => { setF({ ...kosong, tanggal: f.tanggal }); muatUlang(); })}
    >
      <Field label="Tanggal penilaian"><input type="date" className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
      <Field label="Harta benda wakaf">
        <select className={inputCls} value={f.hartaId} onChange={(e) => set("hartaId", e.target.value)}>
          <option value="">— pilih —</option>
          {meta.harta.map((h) => <option key={h.id} value={h.id}>{h.nama} ({h.akunNama})</option>)}
        </select>
      </Field>
      <Field label="Arah">
        <select className={inputCls} value={f.arah} onChange={(e) => set("arah", e.target.value)}>
          <option value="NAIK">Kenaikan nilai</option>
          <option value="TURUN">Penurunan nilai</option>
        </select>
      </Field>
      <Field label="Selisih nilai (Rp)"><Rupiah value={f.nilai} onChange={(x) => set("nilai", x)} /></Field>
      <Field label="Petugas appraisal"><input className={inputCls} value={f.petugasAppraisal} onChange={(e) => set("petugasAppraisal", e.target.value)} /></Field>
      <Field label="Acuan">
        <select className={inputCls} value={f.acuan} onChange={(e) => set("acuan", e.target.value)}>
          {["Appraisal", "NJOP", "Nilai pasar", "Lainnya"].map((a) => <option key={a}>{a}</option>)}
        </select>
      </Field>
      <Field label="Staf nazhir"><input className={inputCls} value={f.stafNazhir} onChange={(e) => set("stafNazhir", e.target.value)} /></Field>
      <Field label="Keterangan"><input className={inputCls} value={f.keterangan} onChange={(e) => set("keterangan", e.target.value)} /></Field>
    </Kerangka>
  );
}

// ------------------------------------------------------------------ 4. Hasil pengelolaan

export function HasilPengelolaan() {
  const [meta] = useWakafMeta();
  const kosong = { tanggal: today(), akunHasil: "4309", hartaId: "", akunKas: "1101", nominal: "", acuan: "RKAT", stafNazhir: "", keterangan: "" };
  const [f, setF] = useState(kosong);
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  if (!meta) return <div className="text-gray-400">Memuat…</div>;
  const jenisList = meta.akun.filter((a) => a.kelompok === "HASIL_PENGELOLAAN" || a.kode === "5101" || a.kode === "5102");
  const beban = f.akunHasil.startsWith("5");
  const nom = Number(f.nominal) || 0;
  const baris = beban
    ? [{ akun: f.akunHasil, debit: nom }, { akun: f.akunKas, kredit: nom }]
    : [{ akun: f.akunKas, debit: nom }, { akun: f.akunHasil, kredit: nom }];
  return (
    <Kerangka
      judul="Hasil Pengelolaan dan Pengembangan"
      info="Bagi hasil, sewa, dividen, hasil investasi properti, dll. Beban pengelolaan dan hak nazhir dicatat di sini sebagai pengurang."
      pratinjau={<Pratinjau meta={meta} baris={baris} />}
      bisaSimpan={nom > 0}
      onSimpan={() => simpan(() => wakaf.hasil({ ...f, nominal: nom, hartaId: f.hartaId ? Number(f.hartaId) : null }),
        () => setF({ ...kosong, tanggal: f.tanggal, akunHasil: f.akunHasil }))}
    >
      <Field label="Tanggal transaksi"><input type="date" className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
      <Field label="Jenis hasil pengelolaan">
        <select className={inputCls} value={f.akunHasil} onChange={(e) => set("akunHasil", e.target.value)}>
          {jenisList.map((a) => <option key={a.kode} value={a.kode}>{a.nama}</option>)}
        </select>
      </Field>
      <Field label="Harta benda wakaf sumber (opsional)">
        <select className={inputCls} value={f.hartaId} onChange={(e) => set("hartaId", e.target.value)}>
          <option value="">—</option>
          {meta.harta.map((h) => <option key={h.id} value={h.id}>{h.nama}</option>)}
        </select>
      </Field>
      <Field label={beban ? "Dibayar dari" : "Diterima di"}>
        <select className={inputCls} value={f.akunKas} onChange={(e) => set("akunKas", e.target.value)}>
          {meta.akun.filter((a) => a.kelompok === "KAS").map((a) => <option key={a.kode} value={a.kode}>{a.kode} {a.nama}</option>)}
        </select>
      </Field>
      <Field label={beban ? "Nominal (Rp)" : "Perolehan hasil (Rp)"}
        hint={f.akunHasil === "5102" ? "Hak nazhir paling banyak 10% dari hasil bersih pengelolaan (UU 41/2004 Ps. 12)" : undefined}>
        <Rupiah value={f.nominal} onChange={(v) => set("nominal", v)} />
      </Field>
      <Field label="Acuan"><input className={inputCls} value={f.acuan} onChange={(e) => set("acuan", e.target.value)} /></Field>
      <Field label="Staf nazhir"><input className={inputCls} value={f.stafNazhir} onChange={(e) => set("stafNazhir", e.target.value)} /></Field>
      <Field label="Keterangan"><input className={inputCls} value={f.keterangan} onChange={(e) => set("keterangan", e.target.value)} /></Field>
    </Kerangka>
  );
}

// ------------------------------------------------------------------ 5. Penyaluran ke mauquf alaih

export function PenyaluranMauquf() {
  const [meta] = useWakafMeta();
  const kosong = {
    tanggal: today(), kategori: "Pendidikan", akunPenyaluran: "", mauqufAlaih: "", mustahikId: "", akunKas: "1101",
    nominal: "", diserahkanLangsung: false, perantara: "Lazis Sultan Agung", stafNazhir: "", keterangan: "",
  };
  const [f, setF] = useState(kosong);
  const set = (k, v) => setF((o) => ({ ...o, [k]: v }));
  const subs = useMemo(() => (meta ? meta.akun.filter((a) => a.kelompok === "PENYALURAN" && a.grup === f.kategori) : []), [meta, f.kategori]);
  useEffect(() => {
    if (!subs.some((a) => a.kode === f.akunPenyaluran)) set("akunPenyaluran", subs[0]?.kode || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subs]);
  if (!meta) return <div className="text-gray-400">Memuat…</div>;
  const nom = Number(f.nominal) || 0;
  return (
    <Kerangka
      judul="Penyaluran Manfaat ke Mauquf Alaih"
      info="Penyaluran hasil pengelolaan wakaf per kategori dan sub kategori mauquf alaih (format BWI)."
      pratinjau={<Pratinjau meta={meta} baris={[{ akun: f.akunPenyaluran, debit: nom }, { akun: f.akunKas, kredit: nom }]} />}
      bisaSimpan={!!(f.akunPenyaluran && f.mauqufAlaih && nom > 0)}
      onSimpan={() => simpan(() => wakaf.penyaluran({ ...f, nominal: nom, mustahikId: f.mustahikId ? Number(f.mustahikId) : null }),
        () => setF({ ...kosong, tanggal: f.tanggal, kategori: f.kategori }))}
    >
      <Field label="Tanggal transaksi"><input type="date" className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
      <Field label="Mauquf alaih / nama program" hint="Mis. Beasiswa GenKU Lazis SA 2026">
        <input className={inputCls} value={f.mauqufAlaih} onChange={(e) => set("mauqufAlaih", e.target.value)} />
      </Field>
      <Field label="Kategori mauquf alaih">
        <select className={inputCls} value={f.kategori} onChange={(e) => set("kategori", e.target.value)}>
          {meta.kategoriMauqufAlaih.map((k) => <option key={k}>{k}</option>)}
        </select>
      </Field>
      <Field label="Sub kategori">
        <select className={inputCls} value={f.akunPenyaluran} onChange={(e) => set("akunPenyaluran", e.target.value)}>
          {subs.map((a) => <option key={a.kode} value={a.kode}>{a.nama}</option>)}
        </select>
      </Field>
      <Field label="Penerima terdaftar (opsional)" hint="Data dari Administrasi > Mustahik & Mauquf Alaih">
        <select className={inputCls} value={f.mustahikId} onChange={(e) => set("mustahikId", e.target.value)}>
          <option value="">—</option>
          {meta.mauqufAlaih.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
        </select>
      </Field>
      <Field label="Sumber kas">
        <select className={inputCls} value={f.akunKas} onChange={(e) => set("akunKas", e.target.value)}>
          {meta.akun.filter((a) => a.kelompok === "KAS").map((a) => <option key={a.kode} value={a.kode}>{a.kode} {a.nama}</option>)}
        </select>
      </Field>
      <Field label="Nominal (Rp)"><Rupiah value={f.nominal} onChange={(v) => set("nominal", v)} /></Field>
      <Field label="Perantara"><input className={inputCls} value={f.perantara} onChange={(e) => set("perantara", e.target.value)} /></Field>
      <Cek label="Diserahkan langsung ke mauquf alaih" value={f.diserahkanLangsung} onChange={(v) => set("diserahkanLangsung", v)} />
      <Field label="Staf nazhir"><input className={inputCls} value={f.stafNazhir} onChange={(e) => set("stafNazhir", e.target.value)} /></Field>
      <Field label="Keterangan"><input className={inputCls} value={f.keterangan} onChange={(e) => set("keterangan", e.target.value)} /></Field>
    </Kerangka>
  );
}
