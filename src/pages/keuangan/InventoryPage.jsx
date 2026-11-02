import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Field, Judul, Modal, SearchSelect, inputCls, num, rp } from "./ui";

/**
 * Inventory Barang (masukan klien no. 13 & 14): stok zakat/infaq berupa barang per dana.
 *  - Barang MASUK dicatat di Input Jurnal > Penerimaan, bentuk "Barang" (nilai wajar, tanpa hak amil).
 *  - Barang KELUAR (penyaluran ke mustahik) dicatat di sini; nilainya harga rata-rata stok, jurnal PENYALURAN dibuat otomatis.
 *  - Membatalkan mutasi = membatalkan jurnalnya (stok ikut kembali).
 */

/** Tanggal hari ini menurut jam lokal (WIB). */
const hariIni = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const awalBulan = () => `${hariIni().slice(0, 8)}01`;
const tgl = (v) => (v == null ? "" : typeof v === "number" ? new Date(v).toISOString().slice(0, 10) : String(v).slice(0, 10));
const teksQty = (n) => Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 3 });
const angkaQty = (v) => {
  const n = parseFloat(String(v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 1000) / 1000 : 0;
};
const POLA_ASNAF = /\s*\(\s*(fakir\s*miskin|fakir|miskin|amil|mu'?all?af|riqab|gharim(in)?|fi+\s*sabilillah|fisabilillah|ibnu\s*sabil)\s*\)\s*$/i;
const namaProgram = (nama) => String(nama || "").replace(POLA_ASNAF, "").trim();
const labelBidang = (b) =>
  b ? b.toLowerCase().split("_").map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" / ") : "Tanpa bidang";
const TAB = [["stok", "Stok"], ["keluar", "Barang keluar (penyaluran)"], ["riwayat", "Riwayat mutasi"]];
const barisKosong = () => ({ nama: "", qty: "", jml: 1, asnaf: "" });

export default function InventoryPage() {
  const [tab, setTab] = useState("stok");
  const [stok, setStok] = useState(null);
  const [barang, setBarang] = useState(null);
  const [meta, setMeta] = useState(null);
  const [pilihStok, setPilihStok] = useState("");
  const [form, setForm] = useState(null); // modal tambah/ubah barang

  const muat = useCallback(() => {
    keuangan.inventoryStok().then(setStok).catch((e) => { setStok([]); Swal.fire("Gagal memuat stok", errMsg(e), "error"); });
    keuangan.inventoryBarang(true).then(setBarang).catch(() => setBarang([]));
  }, []);
  useEffect(() => {
    muat();
    keuangan.meta().then(setMeta).catch((e) => Swal.fire("Gagal memuat data referensi", errMsg(e), "error"));
  }, [muat]);

  const salurkan = (s) => { setPilihStok(`${s.barangId}|${s.dana}`); setTab("keluar"); };

  const simpanBarang = async (e) => {
    e.preventDefault();
    try {
      const body = { kode: form.kode || null, nama: form.nama, satuan: form.satuan, kategori: form.kategori || null, aktif: form.aktif };
      if (form.id) await keuangan.inventoryBarangUbah(form.id, body);
      else await keuangan.inventoryBarangBaru(body);
      setForm(null);
      muat();
    } catch (err) {
      Swal.fire("Ditolak", errMsg(err), "error");
    }
  };

  return (
    <div>
      <Judul aksi={<Btn onClick={() => setForm({ kode: "", nama: "", satuan: "", kategori: "", aktif: true })}>+ Barang</Btn>}>
        Inventory Barang
      </Judul>
      <p className="text-sm text-gray-500 mb-3">
        Zakat/infaq berupa barang. Barang masuk dicatat di <b>Input Jurnal → Penerimaan</b> (bentuk Barang); penyalurannya
        dicatat di tab <b>Barang keluar</b>. Nilai masuk = nilai wajar saat diterima, nilai keluar = harga rata-rata stok.
        Penerimaan barang tidak dipotong hak amil.
      </p>
      <div className="flex flex-wrap gap-1 mb-3 border-b">
        {TAB.map(([k, n]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm -mb-px border-b-2 ${tab === k ? "border-green-600 text-green-700 font-semibold" : "border-transparent text-gray-600 hover:text-gray-800"}`}>
            {n}
          </button>
        ))}
      </div>
      {tab === "stok" && <TabStok stok={stok} barang={barang} onSalurkan={salurkan} onEdit={(b) => setForm({ ...b, kategori: b.kategori || "", aktif: !!Number(b.aktif) })} />}
      {tab === "keluar" && (meta
        ? <TabKeluar stok={stok || []} meta={meta} awal={pilihStok} onSelesai={() => { setPilihStok(""); muat(); }} />
        : <div className="text-gray-400">Memuat data referensi…</div>)}
      {tab === "riwayat" && <TabRiwayat barang={barang || []} onBerubah={muat} />}

      {form && (
        <Modal title={form.id ? "Ubah barang" : "Barang baru"} onClose={() => setForm(null)}>
          <form onSubmit={simpanBarang} className="grid grid-cols-2 gap-3">
            <Field label="Kode" hint={form.id ? undefined : "Kosongkan untuk dibuat otomatis"}>
              <input className={inputCls} value={form.kode || ""} onChange={(e) => setForm({ ...form, kode: e.target.value })} />
            </Field>
            <Field label="Satuan"><input required className={inputCls} placeholder="kg / paket / dus" value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} /></Field>
            <div className="col-span-2"><Field label="Nama barang"><input required className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></Field></div>
            <Field label="Kategori (opsional)"><input className={inputCls} placeholder="mis. Sembako" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} /></Field>
            {form.id && (
              <Field label="Status">
                <label className="flex items-center gap-2 mt-2 text-sm"><input type="checkbox" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} /> Aktif (bisa dipilih)</label>
              </Field>
            )}
            <div className="col-span-2"><Btn color="green" type="submit" className="w-full">Simpan</Btn></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------------------------
function TabStok({ stok, barang, onSalurkan, onEdit }) {
  const [q, setQ] = useState("");
  const kata = q.trim().toLowerCase();
  const baris = (stok || []).filter((s) => !kata || `${s.nama} ${s.kode} ${s.kategori || ""}`.toLowerCase().includes(kata));
  const totalNilai = {};
  baris.forEach((s) => { totalNilai[s.dana] = (totalNilai[s.dana] || 0) + (Number(s.nilai) || 0); });
  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="font-semibold text-gray-700">Stok per dana</div>
          <input className={`${inputCls} w-64`} placeholder="Cari barang…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left py-2 px-2">Barang</th>
                <th className="text-left px-2">Dana</th>
                <th className="text-right px-2">Masuk</th>
                <th className="text-right px-2">Keluar</th>
                <th className="text-right px-2">Stok</th>
                <th className="text-right px-2">Harga rata-rata</th>
                <th className="text-right px-2">Nilai stok</th>
                <th className="text-left px-2">Mutasi terakhir</th>
                <th className="px-2" />
              </tr>
            </thead>
            <tbody>
              {stok == null && <tr><td colSpan={9} className="py-4 text-center text-gray-400">Memuat…</td></tr>}
              {stok && baris.length === 0 && <tr><td colSpan={9} className="py-4 text-center text-gray-400">Belum ada stok. Catat penerimaan barang di Input Jurnal → Penerimaan (bentuk Barang).</td></tr>}
              {baris.map((s) => (
                <tr key={`${s.barangId}-${s.dana}`} className="border-t">
                  <td className="py-1.5 px-2">{s.nama}<span className="text-xs text-gray-500"> · {s.kode}{s.kategori ? ` · ${s.kategori}` : ""}</span></td>
                  <td className="px-2"><DanaBadge dana={s.dana} /></td>
                  <td className="px-2 text-right tabular-nums">{teksQty(s.totalMasuk)}</td>
                  <td className="px-2 text-right tabular-nums">{teksQty(s.totalKeluar)}</td>
                  <td className="px-2 text-right tabular-nums font-semibold">{teksQty(s.qty)} {s.satuan}</td>
                  <td className="px-2 text-right tabular-nums">{rp(s.hargaRata)}</td>
                  <td className="px-2 text-right tabular-nums">{rp(s.nilai)}</td>
                  <td className="px-2">{tgl(s.terakhir)}</td>
                  <td className="px-2 text-right">
                    {Number(s.qty) > 0 && <button type="button" className="text-blue-600 hover:underline" onClick={() => onSalurkan(s)}>Salurkan</button>}
                  </td>
                </tr>
              ))}
              {Object.entries(totalNilai).map(([d, v]) => (
                <tr key={d} className="border-t font-semibold bg-gray-50">
                  <td className="py-1.5 px-2" colSpan={6}>Total nilai persediaan Dana {d}</td>
                  <td className="px-2 text-right tabular-nums">{rp(v)}</td>
                  <td colSpan={2} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4">
        <div className="font-semibold text-gray-700 mb-3">Daftar barang</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left py-2 px-2">Kode</th>
                <th className="text-left px-2">Nama</th>
                <th className="text-left px-2">Satuan</th>
                <th className="text-left px-2">Kategori</th>
                <th className="text-right px-2">Stok total</th>
                <th className="text-left px-2">Status</th>
                <th className="px-2" />
              </tr>
            </thead>
            <tbody>
              {(barang || []).length === 0 && <tr><td colSpan={7} className="py-4 text-center text-gray-400">Belum ada barang. Tambah lewat tombol “+ Barang” atau langsung dari form penerimaan.</td></tr>}
              {(barang || []).map((b) => (
                <tr key={b.id} className={`border-t ${Number(b.aktif) ? "" : "text-gray-400"}`}>
                  <td className="py-1.5 px-2 font-mono">{b.kode}</td>
                  <td className="px-2">{b.nama}</td>
                  <td className="px-2">{b.satuan}</td>
                  <td className="px-2">{b.kategori || ""}</td>
                  <td className="px-2 text-right tabular-nums">{teksQty(b.stokTotal)}</td>
                  <td className="px-2">{Number(b.aktif) ? "Aktif" : "Nonaktif"}</td>
                  <td className="px-2 text-right"><button type="button" className="text-blue-600 hover:underline" onClick={() => onEdit(b)}>Ubah</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
TabStok.propTypes = { stok: PropTypes.array, barang: PropTypes.array, onSalurkan: PropTypes.func, onEdit: PropTypes.func };

// ----------------------------------------------------------------------------------------------
function TabKeluar({ stok, meta, awal, onSelesai }) {
  const kosong = { tanggal: hariIni(), stokKey: awal || "", bidang: "", akunId: "", campaign: "", ket: "" };
  const [f, setF] = useState(kosong);
  const [rows, setRows] = useState([barisKosong()]);
  const [kirim, setKirim] = useState(false);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  useEffect(() => { if (awal) setF((s) => ({ ...s, stokKey: awal })); }, [awal]);

  const tersedia = stok.filter((s) => Number(s.qty) > 0);
  const s = tersedia.find((x) => `${x.barangId}|${x.dana}` === f.stokKey);
  const dana = s?.dana;
  const program = useMemo(() => (meta.akun || [])
    .filter((a) => a.kelompok === "PENDAYAGUNAAN" && Number(a.postable ?? 1) && dana && (a.dana === dana || !a.dana))
    .sort((a, b) => String(a.kode).localeCompare(String(b.kode))), [meta, dana]);
  const programBidang = program.filter((a) => !f.bidang || (f.bidang === "TANPA" ? !a.bidang : a.bidang === f.bidang));
  const akun = program.find((a) => String(a.id) === String(f.akunId));
  const zakat = dana === "ZAKAT";
  const totalQty = Math.round(rows.reduce((t, r) => t + angkaQty(r.qty), 0) * 1000) / 1000;
  const stokQty = Number(s?.qty) || 0;
  const estimasi = !s ? 0 : totalQty === stokQty ? Math.round(Number(s.nilai) || 0) : Math.round(totalQty * (Number(s.nilai) || 0) / (stokQty || 1));
  const lebih = s && totalQty > stokQty;
  const asnafKurang = zakat && !akun?.asnaf && rows.some((r) => !r.asnaf);
  const siap = s && akun && totalQty > 0 && !lebih && !asnafKurang && rows.every((r) => r.nama.trim() && angkaQty(r.qty) > 0);
  const ubah = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const bidangAda = [...new Set(program.map((a) => a.bidang || "TANPA"))];

  const simpan = async () => {
    setKirim(true);
    try {
      const r = await keuangan.inventoryKeluar({
        tanggal: f.tanggal, barangId: s.barangId, dana, akunProgramId: akun.id,
        campaignId: dana === "INFAQ" && f.campaign ? Number(f.campaign) : null, keterangan: f.ket || null,
        penerima: rows.map((x) => ({ nama: x.nama.trim(), qty: angkaQty(x.qty), jmlPenerima: x.jml || 1, asnaf: x.asnaf || null })),
      });
      await Swal.fire({
        icon: "success", title: "Penyaluran barang tersimpan",
        html: `<b>${r.nomorBukti}</b>${r.peringatan?.length ? "<br/><small>" + r.peringatan.join("<br/>") + "</small>" : ""}`,
      });
      setF({ ...kosong, stokKey: "", tanggal: f.tanggal });
      setRows([barisKosong()]);
      onSelesai();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Penyaluran barang ditolak", text: errMsg(e) });
    } finally {
      setKirim(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white shadow rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal"><input type="date" max={hariIni()} className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
          <Field label="Dana">{dana ? <div className="mt-2"><DanaBadge dana={dana} /></div> : <div className="mt-2 text-sm text-gray-400">ikut stok</div>}</Field>
        </div>
        <Field label="Barang (stok)" hint="Hanya stok yang masih ada. Dana mengikuti dana penerimaan barangnya.">
          <SearchSelect value={f.stokKey} onChange={(v) => setF((x) => ({ ...x, stokKey: v, akunId: "", bidang: "", campaign: "" }))}
            options={tersedia.map((x) => ({ value: `${x.barangId}|${x.dana}`, label: `${x.nama} — ${x.dana} — stok ${teksQty(x.qty)} ${x.satuan} (rata-rata ${rp(x.hargaRata)}/${x.satuan})` }))}
            placeholder={tersedia.length ? `Cari barang (${tersedia.length} stok)…` : "Belum ada stok barang"} />
        </Field>
        <Field label="Bidang">
          <select className={inputCls} value={f.bidang} disabled={!s} onChange={(e) => setF((x) => ({ ...x, bidang: e.target.value, akunId: "" }))}>
            <option value="">Semua bidang ({program.length} program)</option>
            {bidangAda.map((b) => <option key={b} value={b}>{b === "TANPA" ? "Tanpa bidang" : labelBidang(b)} ({program.filter((a) => (b === "TANPA" ? !a.bidang : a.bidang === b)).length} program)</option>)}
          </select>
        </Field>
        <Field label="Program" hint={akun?.asnaf ? `Asnaf bawaan program: ${akun.asnaf}` : undefined}>
          <SearchSelect value={f.akunId} onChange={(v) => set("akunId", v)}
            options={programBidang.map((a) => ({ value: a.id, label: `${a.kode} ${namaProgram(a.nama)}${a.bidang ? ` · ${labelBidang(a.bidang)}` : ""}` }))}
            placeholder={s ? `Pilih program (${programBidang.length})…` : "Pilih barang dulu…"} />
        </Field>
        {dana === "INFAQ" && (meta.campaign || []).length > 0 && (
          <Field label="Campaign (opsional)">
            <SearchSelect value={f.campaign} onChange={(v) => set("campaign", v)}
              options={[{ value: "", label: "— Bukan campaign —" }, ...meta.campaign.map((c) => ({ value: String(c.id), label: `${c.id}. ${c.nama}` }))]}
              placeholder="Cari campaign…" />
          </Field>
        )}
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} placeholder="mis. paket sembako Ramadan" /></Field>
        {s && (
          <div className="text-sm bg-gray-50 border rounded p-2 space-y-1">
            <div>Disalurkan: <b>{teksQty(totalQty)} {s.satuan}</b> dari stok {teksQty(stokQty)} {s.satuan}</div>
            <div>Perkiraan nilai (harga rata-rata): <b>{rp(estimasi)}</b> <span className="text-xs text-gray-500">— angka pasti dihitung server saat disimpan</span></div>
            <div className="text-xs text-gray-500">Jurnal: D {akun ? `${akun.kode} ${namaProgram(akun.nama)}` : "akun program"} / K {dana === "ZAKAT" ? "1201 Zakat Fitrah Barang" : "1401 Infaq Barang"}.</div>
          </div>
        )}
        {lebih && <div className="text-sm text-red-600">Jumlah melebihi stok yang tersedia.</div>}
        {asnafKurang && <div className="text-sm text-red-600">Program Zakat ini belum punya asnaf bawaan: isi asnaf di setiap baris penerima.</div>}
        <Btn color="green" className="w-full" disabled={!siap || kirim} onClick={simpan}>{kirim ? "Menyimpan…" : "Simpan penyaluran barang"}</Btn>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <div className="text-sm font-semibold text-gray-600 mb-2">Rincian penerima {zakat ? "(asnaf wajib untuk Zakat)" : "(asnaf opsional)"}</div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="border rounded-lg p-2 grid grid-cols-6 gap-2">
              <input className={`${inputCls} col-span-6`} placeholder="Nama penerima / lembaga" value={r.nama} onChange={(e) => ubah(i, "nama", e.target.value)} />
              <div className="col-span-2">
                <input inputMode="decimal" className={inputCls} placeholder={`Jumlah ${s?.satuan || ""}`} value={r.qty} onChange={(e) => ubah(i, "qty", e.target.value.replace(/[^0-9.,]/g, ""))} />
              </div>
              <input type="number" min="1" className={`${inputCls} col-span-1`} title="Jumlah penerima" value={r.jml} onChange={(e) => ubah(i, "jml", parseInt(e.target.value, 10) || 1)} />
              <select className={`${inputCls} col-span-3`} value={r.asnaf} onChange={(e) => ubah(i, "asnaf", e.target.value)} title="Asnaf penerima">
                <option value="">{akun?.asnaf ? `(ikut program: ${akun.asnaf})` : zakat ? "asnaf…" : "asnaf (opsional)"}</option>
                {(meta.asnaf || []).map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <button type="button" className="text-red-500 text-xs col-span-6 text-right" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} disabled={rows.length === 1}>hapus baris</button>
            </div>
          ))}
        </div>
        <Btn color="gray" className="mt-2" onClick={() => setRows((rs) => [...rs, barisKosong()])}>+ Tambah penerima</Btn>
      </div>
    </div>
  );
}
TabKeluar.propTypes = { stok: PropTypes.array, meta: PropTypes.object, awal: PropTypes.string, onSelesai: PropTypes.func };

// ----------------------------------------------------------------------------------------------
function TabRiwayat({ barang, onBerubah }) {
  const [dari, setDari] = useState(awalBulan());
  const [sampai, setSampai] = useState(hariIni());
  const [barangId, setBarangId] = useState("");
  const [status, setStatus] = useState("AKTIF");
  const [data, setData] = useState(null);
  const [ulang, setUlang] = useState(0);

  useEffect(() => {
    let batal = false;
    setData(null);
    keuangan.inventoryMutasi({ from: dari || undefined, to: sampai || undefined, barang: barangId || undefined, status: status || undefined })
      .then((d) => { if (!batal) setData(d); })
      .catch((e) => { if (!batal) { setData([]); Swal.fire("Gagal memuat riwayat", errMsg(e), "error"); } });
    return () => { batal = true; };
  }, [dari, sampai, barangId, status, ulang]);

  const batalkan = async (m) => {
    const k = await Swal.fire({
      icon: "warning",
      title: `Batalkan ${m.nomorBukti}?`,
      html: "Jurnalnya dibatalkan dan stok barang dikembalikan. Penerimaan barang yang sudah disalurkan tidak bisa dibatalkan sebelum penyalurannya dibatalkan.",
      input: "text",
      inputLabel: "Alasan pembatalan",
      inputValidator: (v) => (!v || !v.trim() ? "Alasan wajib diisi" : undefined),
      showCancelButton: true,
      confirmButtonText: "Batalkan",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Kembali",
    });
    if (!k.isConfirmed) return;
    try {
      const r = await keuangan.voidJurnal(m.jurnalId, k.value.trim());
      await Swal.fire({ icon: "success", title: "Dibatalkan", text: r?.pesan || "" });
      setUlang((x) => x + 1);
      onBerubah();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Gagal membatalkan", text: errMsg(e) });
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex flex-wrap items-end gap-2 mb-3">
        <label className="text-xs text-gray-500">Tanggal awal
          <input type="date" className={`${inputCls} w-40`} value={dari} max={sampai || undefined} onChange={(e) => setDari(e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">Tanggal akhir
          <input type="date" className={`${inputCls} w-40`} value={sampai} min={dari || undefined} onChange={(e) => setSampai(e.target.value)} />
        </label>
        <label className="text-xs text-gray-500">Barang
          <select className={`${inputCls} w-56`} value={barangId} onChange={(e) => setBarangId(e.target.value)}>
            <option value="">Semua barang</option>
            {barang.map((b) => <option key={b.id} value={b.id}>{b.nama}</option>)}
          </select>
        </label>
        <label className="text-xs text-gray-500">Status
          <select className={`${inputCls} w-32`} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="AKTIF">Aktif</option>
            <option value="BATAL">Dibatalkan</option>
            <option value="">Semua</option>
          </select>
        </label>
        {(dari || sampai) && <button type="button" className="text-xs text-blue-600 hover:underline pb-3" onClick={() => { setDari(""); setSampai(""); }}>Semua tanggal</button>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left py-2 px-2">Tanggal</th>
              <th className="text-left px-2">No. bukti</th>
              <th className="text-left px-2">Mutasi</th>
              <th className="text-left px-2">Barang</th>
              <th className="text-left px-2">Dana</th>
              <th className="text-right px-2">Jumlah</th>
              <th className="text-right px-2">Nilai</th>
              <th className="text-left px-2">Donatur / penerima</th>
              <th className="text-left px-2">Status</th>
              <th className="px-2" />
            </tr>
          </thead>
          <tbody>
            {data == null && <tr><td colSpan={10} className="py-4 text-center text-gray-400">Memuat…</td></tr>}
            {data && data.length === 0 && <tr><td colSpan={10} className="py-4 text-center text-gray-400">Tidak ada mutasi pada filter ini</td></tr>}
            {(data || []).map((m) => (
              <tr key={m.id} className={`border-t ${m.status === "BATAL" ? "text-gray-400" : ""}`}>
                <td className="py-1.5 px-2 whitespace-nowrap">{tgl(m.tanggal)}</td>
                <td className="px-2 whitespace-nowrap">{m.nomorBukti}</td>
                <td className="px-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${m.tipe === "MASUK" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{m.tipe === "MASUK" ? "Masuk" : "Keluar"}</span>
                </td>
                <td className="px-2">{m.nama}</td>
                <td className="px-2"><DanaBadge dana={m.dana} /></td>
                <td className="px-2 text-right tabular-nums whitespace-nowrap">{m.tipe === "KELUAR" ? "−" : ""}{teksQty(m.qty)} {m.satuan}</td>
                <td className="px-2 text-right tabular-nums">{num(m.nilai)}</td>
                <td className="px-2">{m.pihak || ""}</td>
                <td className="px-2">{m.status === "AKTIF" ? "Aktif" : "Dibatalkan"}</td>
                <td className="px-2 text-right">
                  {m.status === "AKTIF" && m.statusJurnal === "POSTED" && (
                    <button type="button" className="text-red-600 hover:underline" onClick={() => batalkan(m)}>Batal</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
TabRiwayat.propTypes = { barang: PropTypes.array, onBerubah: PropTypes.func };
