import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { wakaf } from "../../services/wakafApi";
import { errMsg } from "../../services/keuanganApi";
import { Btn, Field, Judul, Modal, SearchSelect, Tabel, inputCls, num, rp } from "../keuangan/ui";
import { useWakafMeta } from "./WakafInput";

const JENIS_JURNAL = {
  PENERIMAAN: "Penerimaan", MUTASI: "Mutasi", PENGUKURAN_ULANG: "Pengukuran Ulang",
  HASIL_PENGELOLAAN: "Hasil Pengelolaan", PENYALURAN: "Penyaluran", SALDO_AWAL: "Saldo Awal", PENYESUAIAN: "Penyesuaian",
};
const gagal = (e) => Swal.fire("Gagal", errMsg(e), "error");
const hariIni = () => new Date().toISOString().slice(0, 10);

/** Unduh baris tabel (array objek datar) sebagai CSV; `kolom` = [judul, kunciAtauFungsi][]. */
function unduhCsvBaris(namaFile, kolom, baris) {
  const rows = [kolom.map(([judul]) => judul)];
  baris.forEach((r) => rows.push(kolom.map(([, ambil]) => (typeof ambil === "function" ? ambil(r) : r[ambil]))));
  const csv = rows.map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = `${namaFile}-${hariIni()}.csv`;
  a.click();
}

// ------------------------------------------------------------------ Daftar harta benda wakaf

export function DaftarHarta() {
  const [meta] = useWakafMeta();
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ jenis: "", q: "" });
  const muat = useCallback(() => {
    wakaf.harta(Object.fromEntries(Object.entries(f).filter(([, v]) => v))).then(setRows).catch(gagal);
  }, [f]);
  useEffect(() => { muat(); }, [muat]);
  const total = rows.reduce((s, r) => s + r.currentValue, 0);
  const eksporCsv = () => unduhCsvBaris("Daftar-Harta-Wakaf", [
    ["Nama harta", "name"], ["Wakif", "wakif"], ["Jenis", "typeLabel"], ["Akun", "account"],
    ["Tanggal perolehan", "acquiredAt"], ["Jangka waktu", "term"], ["Jatuh tempo", (r) => r.dueDate || ""],
    ["AIW", (r) => (r.hasAiw ? "Ada" : "Tidak")], ["Sertifikat", (r) => (r.hasCertificate ? "Ada" : "Tidak")],
    ["Jenis wakaf", (r) => (r.purpose === "SOSIAL" ? "Sosial" : "Produktif")],
    ["Nilai awal", "initialValue"], ["Nilai kini", "currentValue"],
  ], rows);
  return (
    <div>
      <Judul
        aksi={
          <>
            <select className={inputCls} value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })}>
              <option value="">Semua jenis</option>
              {meta?.jenisHbw.map((j) => <option key={j.kode} value={j.kode}>{j.nama}</option>)}
            </select>
            <input className={inputCls} placeholder="Cari nama harta / wakif" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
            <Btn color="gray" onClick={eksporCsv} disabled={!rows.length}>Unduh CSV</Btn>
          </>
        }
      >
        Daftar Harta Benda Wakaf
      </Judul>
      <p className="text-sm text-gray-500 mb-3">{rows.length} harta, nilai kini {rp(total)}. Nilai kini = nilai wajar awal + dampak pengukuran ulang.</p>
      <Tabel
        kolom={[
          { judul: "Nama harta", tampil: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-gray-500">{r.wakif}</div></div> },
          { judul: "Jenis", tampil: (r) => <div><div>{r.typeLabel}</div><div className="text-xs text-gray-500">{r.account}</div></div> },
          { judul: "Perolehan", kunci: "acquiredAt" },
          { judul: "Jangka waktu", tampil: (r) => `${r.term}${r.dueDate ? ` (s/d ${r.dueDate})` : ""}` },
          { judul: "AIW / Sertifikat", tampil: (r) => `${r.hasAiw ? "Ada" : "Tidak"} / ${r.hasCertificate ? "Ada" : "Tidak"}` },
          { judul: "Jenis wakaf", tampil: (r) => (r.purpose === "SOSIAL" ? "Sosial" : "Produktif") },
          { judul: "Nilai awal", kanan: true, tampil: (r) => num(r.initialValue) },
          { judul: "Nilai kini", kanan: true, tampil: (r) => num(r.currentValue) },
        ]}
        baris={rows}
      />
    </div>
  );
}

// ------------------------------------------------------------------ Daftar jurnal wakaf + detail + pembatalan

export function DaftarJurnalWakaf() {
  const thn = new Date().getFullYear();
  const [f, setF] = useState({ from: `${thn}-01-01`, to: new Date().toISOString().slice(0, 10), jenis: "", q: "" });
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const muat = useCallback(() => {
    wakaf.jurnal(Object.fromEntries(Object.entries(f).filter(([, v]) => v))).then(setRows).catch(gagal);
  }, [f]);
  useEffect(() => { muat(); }, [muat]);

  const batalkan = async (j) => {
    const { value: alasan, isConfirmed } = await Swal.fire({
      title: `Batalkan ${j.nomorBukti}?`, input: "text", inputLabel: "Alasan pembatalan (wajib)",
      showCancelButton: true, confirmButtonText: "Batalkan jurnal", cancelButtonText: "Tutup",
    });
    if (!isConfirmed) return;
    try {
      await wakaf.batalkan(j.id, alasan);
      Swal.fire("Dibatalkan", "Jurnal ditandai VOID dan laporan wakaf dihitung ulang.", "success");
      setDetail(null);
      muat();
    } catch (e) {
      gagal(e);
    }
  };

  return (
    <div>
      <Judul
        aksi={
          <>
            <input type="date" className={inputCls} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
            <input type="date" className={inputCls} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
            <select className={inputCls} value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })}>
              <option value="">Semua jenis</option>
              {Object.entries(JENIS_JURNAL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className={inputCls} placeholder="Cari nomor / keterangan" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
          </>
        }
      >
        Daftar Jurnal Wakaf
      </Judul>
      <Tabel
        kolom={[
          { judul: "Nomor bukti", tampil: (r) => <button className="text-blue-600 hover:underline" onClick={() => wakaf.jurnalDetail(r.id).then(setDetail).catch(gagal)}>{r.nomorBukti}</button> },
          { judul: "Tanggal", kunci: "tanggal" },
          { judul: "Jenis", tampil: (r) => JENIS_JURNAL[r.jenis] || r.jenis },
          { judul: "Keterangan", tampil: (r) => <span className="line-clamp-2">{r.keterangan}</span> },
          { judul: "Status", tampil: (r) => <span className={r.status === "VOID" ? "text-gray-400 line-through" : "text-green-700"}>{r.status}</span> },
          { judul: "Nilai", kanan: true, tampil: (r) => num(r.nilai) },
        ]}
        baris={rows}
      />
      {detail && (
        <Modal title={detail.nomorBukti} onClose={() => setDetail(null)} wide>
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div><span className="text-gray-500">Tanggal:</span> {detail.tanggal}</div>
            <div><span className="text-gray-500">Jenis:</span> {JENIS_JURNAL[detail.jenis]}</div>
            <div className="col-span-2"><span className="text-gray-500">Keterangan:</span> {detail.keterangan}</div>
            {detail.harta && <div className="col-span-2"><span className="text-gray-500">Harta:</span> {detail.harta}</div>}
            {detail.mauqufAlaih && <div><span className="text-gray-500">Mauquf alaih:</span> {detail.mauqufAlaih}</div>}
            {detail.perantara && <div><span className="text-gray-500">Perantara:</span> {detail.perantara}</div>}
            {detail.jenisTransaksi && <div><span className="text-gray-500">Jenis mutasi:</span> {detail.jenisTransaksi}</div>}
            {detail.acuan && <div><span className="text-gray-500">Acuan:</span> {detail.acuan}</div>}
            {detail.stafNazhir && <div><span className="text-gray-500">Staf nazhir:</span> {detail.stafNazhir}</div>}
            {detail.refZis && <div><span className="text-gray-500">Dari buku ZIS:</span> {detail.refZis}</div>}
            <div><span className="text-gray-500">Sumber:</span> {detail.sumber}</div>
            <div><span className="text-gray-500">Status:</span> {detail.status}{detail.alasanBatal ? ` — ${detail.alasanBatal}` : ""}</div>
          </div>
          <Tabel
            kolom={[
              { judul: "Akun", tampil: (b) => `${b.akunKode} ${b.akunNama}` },
              { judul: "Debit", kanan: true, tampil: (b) => (Number(b.debit) ? num(b.debit) : "") },
              { judul: "Kredit", kanan: true, tampil: (b) => (Number(b.kredit) ? num(b.kredit) : "") },
            ]}
            baris={detail.baris}
          />
          {detail.status === "POSTED" && (
            <div className="mt-4 text-right"><Btn color="red" onClick={() => batalkan(detail)}>Batalkan (VOID)</Btn></div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Donasi wakaf online yang masuk lewat buku ZIS

export function WakafOnline() {
  const [rows, setRows] = useState([]);
  const muat = () => wakaf.online().then(setRows).catch(gagal);
  useEffect(() => { muat(); }, []);
  const catat = async (r) => {
    const { value: jenis, isConfirmed } = await Swal.fire({
      title: `Catat ${r.nomorBukti} ke buku wakaf?`,
      text: `${r.donatur || "Donatur"} — ${rp(r.nilai)}`,
      input: "select",
      inputOptions: { WAKAF_MELALUI_UANG: "Wakaf Melalui Uang", WAKAF_UANG: "Wakaf Uang" },
      inputValue: "WAKAF_MELALUI_UANG",
      showCancelButton: true, confirmButtonText: "Catat", cancelButtonText: "Tutup",
    });
    if (!isConfirmed) return;
    try {
      const x = await wakaf.catatOnline(r.nomorBukti, jenis);
      Swal.fire("Tercatat", `Nomor bukti wakaf ${x.nomorBukti}`, "success");
      muat();
    } catch (e) {
      gagal(e);
    }
  };
  return (
    <div>
      <Judul aksi={<Btn color="gray" onClick={muat}>Muat ulang</Btn>}>Donasi Wakaf Online</Judul>
      <p className="text-sm text-gray-500 mb-3">
        Donasi wakaf dari website/aplikasi donatur/teller masih masuk ke buku ZIS (dana WAKAF). Catat ke buku wakaf di sini
        agar tampil di laporan wakaf; setiap transaksi hanya bisa dicatat sekali.
      </p>
      <Tabel
        kolom={[
          { judul: "Nomor bukti ZIS", kunci: "nomorBukti" },
          { judul: "Tanggal", kunci: "tanggal" },
          { judul: "Donatur", kunci: "donatur" },
          { judul: "Metode", tampil: (r) => `${r.metode || "-"} / ${r.kanal || "-"}` },
          { judul: "Nilai", kanan: true, tampil: (r) => num(r.nilai) },
          { judul: "", tampil: (r) => <Btn color="green" onClick={() => catat(r)}>Catat ke buku wakaf</Btn> },
        ]}
        baris={rows}
        kosong="Semua donasi wakaf sudah dicatat di buku wakaf"
      />
    </div>
  );
}

// ------------------------------------------------------------------ Daftar akun wakaf

const KELOMPOK = {
  KAS: "Kas", PIUTANG: "Piutang", SURAT_BERHARGA: "Surat Berharga", LOGAM_MULIA: "Logam Mulia",
  ASET_LANCAR_LAIN: "Aset Lancar Lain", INVESTASI: "Investasi", ASET_TETAP: "Aset Tetap", ASET_TAK_BERWUJUD: "Aset Tak Berwujud",
  ASET_TIDAK_LANCAR_LAIN: "Aset Tidak Lancar Lain", LIABILITAS_PENDEK: "Liabilitas Jk Pendek", LIABILITAS_PANJANG: "Liabilitas Jk Panjang",
  ASET_NETO: "Aset Neto", PENERIMAAN: "Penerimaan", PENGUKURAN_ULANG: "Pengukuran Ulang", HASIL_PENGELOLAAN: "Hasil Pengelolaan",
  BEBAN_PENGELOLAAN: "Beban Pengelolaan", PENYALURAN: "Penyaluran",
};

const KOSONG_AKUN = { kode: "", nama: "", kelompok: "KAS", normal: "D", grup: "", urut: 100, aktif: true };

export function DaftarAkunWakaf() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const muat = useCallback(() => wakaf.akunSemua().then(setRows).catch(gagal), []);
  useEffect(() => { muat(); }, [muat]);

  const bukaTambah = () => setForm({ ...KOSONG_AKUN });
  const bukaEdit = (a) => setForm({
    kode: a.kode, nama: a.nama, kelompok: a.kelompok, normal: a.normal, grup: a.grup || "",
    urut: a.urut, aktif: !!a.aktif, sistem: !!a.sistem, editKode: a.kode,
  });

  const simpan = async (e) => {
    e.preventDefault();
    try {
      if (form.editKode) await wakaf.akunUbah(form.editKode, form);
      else await wakaf.akunBaru(form);
      setForm(null);
      muat();
    } catch (err) { gagal(err); }
  };

  return (
    <div>
      <Judul aksi={<Btn onClick={bukaTambah}>+ Tambah akun</Btn>}>Daftar Akun Wakaf</Judul>
      <p className="text-sm text-gray-500 mb-3">Akun mengikuti &quot;Jenis Akun&quot; laporan BWI dan daftar akun PSAK 412. Terpisah dari COA ZIS.</p>
      <Tabel
        kolom={[
          { judul: "Kode", kunci: "kode" },
          { judul: "Nama akun", kunci: "nama" },
          { judul: "Kelompok", tampil: (a) => KELOMPOK[a.kelompok] || a.kelompok },
          { judul: "Kategori", tampil: (a) => a.grup || "" },
          { judul: "Saldo normal", tampil: (a) => (a.normal === "D" ? "Debit" : "Kredit") },
          { judul: "Status", tampil: (a) => (a.aktif ? "aktif" : "nonaktif") },
          { judul: "", tampil: (a) => <Btn color="amber" onClick={() => bukaEdit(a)}>Edit</Btn> },
        ]}
        baris={rows.map((a) => ({ ...a, id: a.kode }))}
      />
      {form && (
        <Modal title={form.editKode ? "Ubah akun" : "Akun baru"} onClose={() => setForm(null)}>
          <form onSubmit={simpan} className="space-y-3">
            {form.editKode && form.sistem && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded p-2">
                Akun bawaan format BWI: hanya kategori dan status aktif yang bisa diubah, supaya peta jurnal tetap aman.
              </div>
            )}
            <Field label="Kode akun">
              <input required disabled={!!form.editKode} className={inputCls} value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} />
            </Field>
            <Field label="Nama akun">
              <input required disabled={form.editKode && form.sistem} className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </Field>
            <Field label="Kelompok">
              <select disabled={form.editKode && form.sistem} className={inputCls} value={form.kelompok} onChange={(e) => setForm({ ...form, kelompok: e.target.value })}>
                {Object.entries(KELOMPOK).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="Saldo normal">
              <select disabled={form.editKode && form.sistem} className={inputCls} value={form.normal} onChange={(e) => setForm({ ...form, normal: e.target.value })}>
                <option value="D">Debit</option>
                <option value="K">Kredit</option>
              </select>
            </Field>
            <Field label="Kategori (opsional)" hint="Mis. kategori mauquf alaih untuk akun Penyaluran">
              <input className={inputCls} value={form.grup} onChange={(e) => setForm({ ...form, grup: e.target.value })} />
            </Field>
            <Field label="Urutan tampil">
              <input type="number" disabled={form.editKode && form.sistem} className={inputCls} value={form.urut} onChange={(e) => setForm({ ...form, urut: e.target.value })} />
            </Field>
            {form.editKode && (
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} /> Aktif</label>
            )}
            <Btn className="w-full" color="green" type="submit">Simpan</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Sumber kas wakaf (rekening bank/kas)

const BARU = "__BARU__";
const KOSONG_SUMBER_KAS = { pilihAkun: "", kodeBaru: "", namaBaru: "", kodeBank: "", namaBank: "", noRek: "", isKas: false };

export function SumberKasWakaf() {
  const [meta] = useWakafMeta();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const muat = useCallback(() => wakaf.sumberKas().then(setRows).catch(gagal), []);
  useEffect(() => { muat(); }, [muat]);

  const akunBelumTerdaftar = (meta?.akun || []).filter((a) => a.kelompok === "KAS" && !rows.some((r) => r.akunKode === a.kode));

  const bukaTambah = () => setForm({ ...KOSONG_SUMBER_KAS, pilihAkun: akunBelumTerdaftar[0]?.kode || BARU });
  const bukaEdit = (r) => setForm({
    pilihAkun: r.akunKode, kodeBaru: "", namaBaru: "", kodeBank: r.kodeBank, namaBank: r.namaBank,
    noRek: r.noRek || "", isKas: !!r.kas, editKode: r.akunKode,
  });

  const simpan = async (e) => {
    e.preventDefault();
    try {
      if (form.editKode) {
        await wakaf.sumberKasUbah(form.editKode, form);
      } else {
        const akunBaru = form.pilihAkun === BARU;
        await wakaf.sumberKasBaru({
          akunKode: akunBaru ? null : form.pilihAkun,
          kodeBaru: akunBaru ? form.kodeBaru : null, namaBaru: akunBaru ? form.namaBaru : null,
          kodeBank: form.kodeBank, namaBank: form.namaBank, noRek: form.noRek, isKas: form.isKas,
        });
      }
      setForm(null);
      muat();
    } catch (err) { gagal(err); }
  };

  const akunBaru = form && !form.editKode && form.pilihAkun === BARU;

  return (
    <div>
      <Judul aksi={<Btn onClick={bukaTambah}>+ Tambah sumber kas</Btn>}>Sumber Kas Wakaf</Judul>
      <p className="text-sm text-gray-500 mb-3">
        Rekening bank / kas tunai yang dipakai sebagai sumber dan tujuan kas pada input Hasil Pengelolaan dan
        Penyaluran Mauquf Alaih. Bisa ditambah tanpa menyentuh database langsung.
      </p>
      <Tabel
        kolom={[
          { judul: "Kode akun", kunci: "akunKode" },
          { judul: "Akun wakaf", kunci: "akunNama" },
          { judul: "Bank", tampil: (r) => `${r.kodeBank} · ${r.namaBank}` },
          { judul: "No. (tersamar)", kunci: "noRek" },
          { judul: "Kas", tampil: (r) => (r.kas ? "ya" : "") },
          { judul: "Status", tampil: (r) => (r.aktif ? "aktif" : "nonaktif") },
          { judul: "", tampil: (r) => <Btn color="amber" onClick={() => bukaEdit(r)}>Edit</Btn> },
        ]}
        baris={rows}
      />
      {form && (
        <Modal title={form.editKode ? "Ubah sumber kas" : "Tambah sumber kas"} onClose={() => setForm(null)}>
          <form onSubmit={simpan} className="space-y-3">
            {!form.editKode && (
              <Field label="Akun KAS" hint="Pilih akun kas yang sudah ada, atau buat akun baru untuk rekening ini">
                <SearchSelect
                  value={form.pilihAkun}
                  onChange={(v) => setForm({ ...form, pilihAkun: v })}
                  options={[
                    ...akunBelumTerdaftar.map((a) => ({ value: a.kode, label: `${a.kode} ${a.nama}` })),
                    { value: BARU, label: "+ Buat akun KAS baru…" },
                  ]}
                  placeholder="Cari akun kas…"
                />
              </Field>
            )}
            {akunBaru && (
              <>
                <Field label="Kode akun baru" hint="mis. 1104"><input required className={inputCls} value={form.kodeBaru} onChange={(e) => setForm({ ...form, kodeBaru: e.target.value })} /></Field>
                <Field label="Nama akun baru" hint="mis. Bank BSI Wakaf"><input required className={inputCls} value={form.namaBaru} onChange={(e) => setForm({ ...form, namaBaru: e.target.value })} /></Field>
              </>
            )}
            <Field label="Kode bank" hint="Kode singkat, sama dengan aplikasi mobile"><input required className={inputCls} value={form.kodeBank} onChange={(e) => setForm({ ...form, kodeBank: e.target.value })} /></Field>
            <Field label="Nama bank / rekening"><input required className={inputCls} value={form.namaBank} onChange={(e) => setForm({ ...form, namaBank: e.target.value })} /></Field>
            <Field label="No. rekening (tersamar)"><input className={inputCls} value={form.noRek} onChange={(e) => setForm({ ...form, noRek: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isKas} onChange={(e) => setForm({ ...form, isKas: e.target.checked })} /> Kas tunai (bukan rekening bank)</label>
            <Btn className="w-full" color="green" type="submit">Simpan</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
