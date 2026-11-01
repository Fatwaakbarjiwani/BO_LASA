import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Field, Judul, Modal, SearchSelect, inputCls, num, rp } from "./ui";

/**
 * Aset & Penyusutan (masukan klien no. 3): aset internal milik Dana Pengelola/Amil, penyusutan garis lurus mulai
 * bulan perolehan. Aset baru -> jurnal perolehan dari rekening; aset lama (sebelum cut-over) -> tanpa jurnal, dengan
 * akumulasi awal (saldonya lewat Saldo Awal). Jurnal penyusutan dibuat lewat tab "Proses penyusutan".
 */

const hariIni = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const tgl = (v) => (v == null ? "" : typeof v === "number" ? new Date(v).toISOString().slice(0, 10) : String(v).slice(0, 10));
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const labelPeriode = (p) => (p ? `${BULAN[Number(String(p).slice(5, 7)) - 1]} ${String(p).slice(0, 4)}` : "-");
const TAB = [["daftar", "Daftar aset"], ["tambah", "Tambah aset"], ["susut", "Proses penyusutan"]];

function Nominal({ value, onChange }) {
  return (
    <input inputMode="numeric" className={inputCls} value={value ? num(value) : ""} placeholder="0"
      onChange={(e) => onChange(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0)} />
  );
}
Nominal.propTypes = { value: PropTypes.number, onChange: PropTypes.func };

export default function AsetPage() {
  const [tab, setTab] = useState("daftar");
  const [kategori, setKategori] = useState([]);
  const [meta, setMeta] = useState(null);
  const [versi, setVersi] = useState(0);

  useEffect(() => {
    keuangan.asetKategori().then(setKategori).catch((e) => Swal.fire("Gagal memuat kategori aset", errMsg(e), "error"));
    keuangan.meta().then(setMeta).catch(() => {});
  }, []);
  const selesai = () => { setVersi((v) => v + 1); setTab("daftar"); };

  return (
    <div>
      <Judul>Aset &amp; Penyusutan</Judul>
      <p className="text-sm text-gray-500 mb-3">
        Aset internal milik Dana Pengelola (Amil). Penyusutan garis lurus mulai bulan perolehan; beban penyusutan masuk LPD Dana Amil.
        Jurnal penyusutan dibuat lewat tab <b>Proses penyusutan</b> (satu jurnal per bulan, tidak bisa dobel).
      </p>
      <div className="flex flex-wrap gap-1 mb-3 border-b">
        {TAB.map(([k, n]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm -mb-px border-b-2 ${tab === k ? "border-green-600 text-green-700 font-semibold" : "border-transparent text-gray-600 hover:text-gray-800"}`}>
            {n}
          </button>
        ))}
      </div>
      {tab === "daftar" && <TabDaftar versi={versi} />}
      {tab === "tambah" && <TabTambah kategori={kategori} meta={meta} onSelesai={selesai} />}
      {tab === "susut" && <TabSusut onSelesai={() => setVersi((v) => v + 1)} />}
    </div>
  );
}

// ----------------------------------------------------------------------------------------------
function TabDaftar({ versi }) {
  const [data, setData] = useState(null);
  const [semua, setSemua] = useState(false);
  const [jadwal, setJadwal] = useState(null);
  const [ubah, setUbah] = useState(null);
  const [ulang, setUlang] = useState(0);

  useEffect(() => {
    let batal = false;
    setData(null);
    keuangan.aset(semua).then((d) => { if (!batal) setData(d); }).catch((e) => { if (!batal) { setData([]); Swal.fire("Gagal memuat aset", errMsg(e), "error"); } });
    return () => { batal = true; };
  }, [semua, versi, ulang]);

  const bukaJadwal = async (a) => {
    try { setJadwal(await keuangan.asetJadwal(a.id)); } catch (e) { Swal.fire("Gagal memuat jadwal", errMsg(e), "error"); }
  };
  const batalkan = async (a) => {
    const k = await Swal.fire({
      icon: "warning", title: `Batalkan aset ${a.kode}?`,
      html: a.sumber === "BARU" ? "Jurnal perolehannya ikut dibatalkan. Aset yang sudah disusutkan harus dibatalkan penyusutannya dulu." : "Aset lama dihapus dari daftar (tanpa jurnal).",
      input: "text", inputLabel: "Alasan", inputValidator: (v) => (!v || !v.trim() ? "Alasan wajib diisi" : undefined),
      showCancelButton: true, confirmButtonText: "Batalkan aset", confirmButtonColor: "#dc2626", cancelButtonText: "Kembali",
    });
    if (!k.isConfirmed) return;
    try { const r = await keuangan.asetBatal(a.id, k.value.trim()); await Swal.fire("Dibatalkan", r.pesan || "", "success"); setUlang((x) => x + 1); } catch (e) { Swal.fire("Gagal", errMsg(e), "error"); }
  };
  const simpanUbah = async (e) => {
    e.preventDefault();
    try { await keuangan.asetUbah(ubah.id, { nama: ubah.nama, lokasi: ubah.lokasi, keterangan: ubah.keterangan }); setUbah(null); setUlang((x) => x + 1); } catch (err) { Swal.fire("Ditolak", errMsg(err), "error"); }
  };

  const aktif = (data || []).filter((a) => a.status === "AKTIF");
  const tot = aktif.reduce((t, a) => ({ harga: t.harga + Number(a.harga || 0), akum: t.akum + Number(a.akumulasi || 0), buku: t.buku + Number(a.nilaiBuku || 0) }), { harga: 0, akum: 0, buku: 0 });

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <label className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <input type="checkbox" checked={semua} onChange={(e) => setSemua(e.target.checked)} /> Tampilkan aset yang dibatalkan
      </label>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left py-2 px-2">Kode</th>
              <th className="text-left px-2">Aset</th>
              <th className="text-left px-2">Perolehan</th>
              <th className="text-right px-2">Harga</th>
              <th className="text-right px-2">Akumulasi</th>
              <th className="text-right px-2">Nilai buku</th>
              <th className="text-right px-2">Susut/bulan</th>
              <th className="text-left px-2">Terakhir disusutkan</th>
              <th className="px-2" />
            </tr>
          </thead>
          <tbody>
            {data == null && <tr><td colSpan={9} className="py-4 text-center text-gray-400">Memuat…</td></tr>}
            {data && data.length === 0 && <tr><td colSpan={9} className="py-4 text-center text-gray-400">Belum ada aset. Tambah lewat tab “Tambah aset”.</td></tr>}
            {(data || []).map((a) => (
              <tr key={a.id} className={`border-t ${a.status === "BATAL" ? "text-gray-400 line-through" : ""}`}>
                <td className="py-1.5 px-2 font-mono whitespace-nowrap">{a.kode}</td>
                <td className="px-2">{a.nama}<span className="block text-xs text-gray-500">{a.kategori}{a.lokasi ? ` · ${a.lokasi}` : ""}{a.sumber === "LAMA" ? " · aset lama" : ""}</span></td>
                <td className="px-2 whitespace-nowrap">{tgl(a.tanggalPerolehan)}{a.nomorPerolehan && <span className="block text-xs text-gray-500">{a.nomorPerolehan}</span>}</td>
                <td className="px-2 text-right tabular-nums">{num(a.harga)}</td>
                <td className="px-2 text-right tabular-nums">{num(a.akumulasi)}</td>
                <td className="px-2 text-right tabular-nums font-medium">{num(a.nilaiBuku)}</td>
                <td className="px-2 text-right tabular-nums">{Number(a.disusutkan) ? num(a.perBulan) : <span className="text-xs text-gray-500">tidak disusutkan</span>}</td>
                <td className="px-2 whitespace-nowrap">{a.habis ? "Habis disusutkan" : labelPeriode(a.periodeTerakhir)}</td>
                <td className="px-2 text-right whitespace-nowrap space-x-3">
                  {a.status === "AKTIF" && (
                    <>
                      {Number(a.disusutkan) ? <button type="button" className="text-blue-600 hover:underline" onClick={() => bukaJadwal(a)}>Jadwal</button> : null}
                      <button type="button" className="text-blue-600 hover:underline" onClick={() => setUbah({ id: a.id, nama: a.nama, lokasi: a.lokasi || "", keterangan: a.keterangan || "" })}>Ubah</button>
                      <button type="button" className="text-red-600 hover:underline" onClick={() => batalkan(a)}>Batal</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {aktif.length > 0 && (
              <tr className="border-t font-semibold bg-gray-50">
                <td className="py-1.5 px-2" colSpan={3}>Total aset aktif ({aktif.length})</td>
                <td className="px-2 text-right tabular-nums">{num(tot.harga)}</td>
                <td className="px-2 text-right tabular-nums">{num(tot.akum)}</td>
                <td className="px-2 text-right tabular-nums">{num(tot.buku)}</td>
                <td colSpan={3} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {jadwal && (
        <Modal wide title={`Jadwal penyusutan ${jadwal.aset.kode} — ${jadwal.aset.nama}`} onClose={() => setJadwal(null)}>
          <div className="text-sm text-gray-600 mb-2">Rp {num(jadwal.aset.perBulan)} per bulan mulai {labelPeriode(jadwal.aset.mulai)}. Baris tanpa no. bukti belum dijurnal.</div>
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 text-xs uppercase sticky top-0">
                <tr><th className="text-left py-1.5 px-2">Bulan</th><th className="text-right px-2">Penyusutan</th><th className="text-right px-2">Akumulasi</th><th className="text-right px-2">Nilai buku</th><th className="text-left px-2">No. bukti</th></tr>
              </thead>
              <tbody>
                {jadwal.baris.map((b) => (
                  <tr key={b.periode} className={`border-t ${b.nomorBukti ? "" : "text-gray-500"}`}>
                    <td className="py-1 px-2">{labelPeriode(b.periode)}</td>
                    <td className="px-2 text-right tabular-nums">{num(b.nilai)}</td>
                    <td className="px-2 text-right tabular-nums">{num(b.akumulasi)}</td>
                    <td className="px-2 text-right tabular-nums">{num(b.nilaiBuku)}</td>
                    <td className="px-2">{b.nomorBukti || "belum"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
      {ubah && (
        <Modal title="Ubah data aset" onClose={() => setUbah(null)}>
          <form onSubmit={simpanUbah} className="space-y-3">
            <Field label="Nama aset"><input required className={inputCls} value={ubah.nama} onChange={(e) => setUbah({ ...ubah, nama: e.target.value })} /></Field>
            <Field label="Lokasi / pemegang"><input className={inputCls} value={ubah.lokasi} onChange={(e) => setUbah({ ...ubah, lokasi: e.target.value })} /></Field>
            <Field label="Keterangan"><input className={inputCls} value={ubah.keterangan} onChange={(e) => setUbah({ ...ubah, keterangan: e.target.value })} /></Field>
            <p className="text-xs text-gray-500">Harga, tanggal, dan umur tidak bisa diubah. Untuk mengoreksinya, batalkan aset lalu input ulang.</p>
            <Btn color="green" type="submit" className="w-full">Simpan</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
TabDaftar.propTypes = { versi: PropTypes.number };

// ----------------------------------------------------------------------------------------------
function TabTambah({ kategori, meta, onSelesai }) {
  const kosong = { sumber: "BARU", nama: "", kategoriId: "", tanggal: hariIni(), harga: 0, residu: 0, umur: "", akumAwal: 0, rekId: "", lokasi: "", ket: "" };
  const [f, setF] = useState(kosong);
  const [kirim, setKirim] = useState(false);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const kat = kategori.find((k) => String(k.id) === String(f.kategoriId));
  const disusutkan = kat ? !!Number(kat.disusutkan) : true;
  const umur = disusutkan ? (parseInt(f.umur, 10) || 0) : 0;
  const perBulan = umur > 0 ? Math.round((f.harga - f.residu) / umur) : 0;
  const lama = f.sumber === "LAMA";
  const rek = (meta?.rekening || []).find((r) => String(r.coaId) === String(f.rekId));
  const pilihKategori = (v) => {
    const k = kategori.find((x) => String(x.id) === String(v));
    setF((s) => ({ ...s, kategoriId: v, umur: k && Number(k.disusutkan) ? String(k.umurTahun * 12) : "" }));
  };
  const siap = f.nama.trim() && kat && f.harga > 0 && f.residu < f.harga && (!disusutkan || umur > 0) && (lama || rek)
    && (!lama || f.akumAwal <= f.harga - f.residu);

  const simpan = async () => {
    setKirim(true);
    try {
      const r = await keuangan.asetTambah({
        sumber: f.sumber, nama: f.nama.trim(), kategoriId: Number(f.kategoriId), tanggalPerolehan: f.tanggal,
        hargaPerolehan: f.harga, nilaiResidu: disusutkan ? f.residu : 0, umurBulan: disusutkan ? umur : 0,
        akumulasiAwal: lama ? f.akumAwal : 0, rekeningCoaId: lama ? null : rek.coaId, lokasi: f.lokasi || null, keterangan: f.ket || null,
      });
      await Swal.fire({ icon: "success", title: `Aset ${r.kode} tersimpan`, html: `${r.nomorBukti ? `<b>${r.nomorBukti}</b><br/>` : ""}<small>${(r.peringatan || []).join("<br/>")}</small>` });
      setF(kosong);
      onSelesai();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Aset ditolak", text: errMsg(e) });
    } finally {
      setKirim(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="bg-white shadow rounded-lg p-4 space-y-3">
        <Field label="Jenis pencatatan">
          <div className="flex gap-2" role="radiogroup" aria-label="Jenis pencatatan aset">
            {[["BARU", "Aset baru (dibeli)"], ["LAMA", "Aset lama (sebelum cut-over)"]].map(([v, n]) => (
              <button key={v} type="button" role="radio" aria-checked={f.sumber === v} onClick={() => set("sumber", v)}
                className={`px-3 py-1.5 rounded-lg border text-sm ${f.sumber === v ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-blue-50"}`}>{n}</button>
            ))}
          </div>
        </Field>
        <Field label="Nama aset"><input className={inputCls} value={f.nama} onChange={(e) => set("nama", e.target.value)} placeholder="mis. Laptop Lenovo staf keuangan" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori">
            <select className={inputCls} value={f.kategoriId} onChange={(e) => pilihKategori(e.target.value)}>
              <option value="">Pilih kategori…</option>
              {kategori.filter((k) => Number(k.aktif)).map((k) => <option key={k.id} value={k.id}>{k.nama}{Number(k.disusutkan) ? ` (${k.umurTahun} th)` : " (tidak disusutkan)"}</option>)}
            </select>
          </Field>
          <Field label="Tanggal perolehan"><input type="date" max={hariIni()} className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Harga perolehan"><Nominal value={f.harga} onChange={(v) => set("harga", v)} /></Field>
          {disusutkan && <Field label="Nilai residu (sisa)" hint="Biasanya 0"><Nominal value={f.residu} onChange={(v) => set("residu", v)} /></Field>}
        </div>
        {disusutkan && (
          <Field label="Umur ekonomis (bulan)" hint={kat ? `Bawaan kategori ${kat.umurTahun} tahun = ${kat.umurTahun * 12} bulan` : undefined}>
            <input type="number" min="1" className={inputCls} value={f.umur} onChange={(e) => set("umur", e.target.value)} />
          </Field>
        )}
        {lama ? (
          disusutkan && (
            <Field label="Akumulasi penyusutan s.d. sebelum cut-over" hint="Penyusutan yang sudah terjadi sebelum sistem ini; nilainya harus sama dengan Saldo Awal akun akumulasi.">
              <Nominal value={f.akumAwal} onChange={(v) => set("akumAwal", v)} />
            </Field>
          )
        ) : (
          <Field label="Dibayar dari rekening" hint="Dicatat sebagai kas Dana Pengelola (Amil).">
            <SearchSelect value={f.rekId} onChange={(v) => set("rekId", v)}
              options={(meta?.rekening || []).map((r) => ({ value: r.coaId, label: `${r.kas ? "Kas: " : ""}${r.namaBank || ""} ${r.noRek || ""}`.trim() + (r.namaAkun ? ` — ${r.namaAkun}` : "") }))}
              placeholder="Cari rekening…" />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lokasi / pemegang (opsional)"><input className={inputCls} value={f.lokasi} onChange={(e) => set("lokasi", e.target.value)} /></Field>
          <Field label="Keterangan (opsional)"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
        </div>
        <Btn color="green" className="w-full" disabled={!siap || kirim} onClick={simpan}>{kirim ? "Menyimpan…" : "Simpan aset"}</Btn>
      </div>
      <div className="bg-white shadow rounded-lg p-4 text-sm space-y-2">
        <div className="font-semibold text-gray-700">Ringkasan</div>
        {!kat ? <div className="text-gray-400">Pilih kategori untuk melihat ringkasan.</div> : (
          <>
            <div>Akun aset: <b>{kat.akunAset}</b></div>
            {disusutkan ? (
              <>
                <div>Akumulasi: {kat.akunAkumulasi}</div>
                <div>Beban: {kat.akunBeban}</div>
                <div className="pt-2">Penyusutan: <b>{rp(perBulan)}/bulan</b> selama {umur || "?"} bulan, mulai {lama ? "bulan cut-over" : labelPeriode(f.tanggal.slice(0, 7))}.</div>
                {lama && <div>Nilai buku awal: <b>{rp(f.harga - f.akumAwal)}</b></div>}
              </>
            ) : <div className="pt-2">Kategori ini tidak disusutkan.</div>}
            <div className="pt-2 text-gray-600">
              {lama
                ? "Aset lama tidak dibuatkan jurnal. Pastikan harga perolehan dan akumulasinya sudah ada di Saldo Awal."
                : <>Jurnal perolehan: D {kat.akunAset} / K {rek ? `${rek.namaBank || ""} ${rek.noRek || ""}`.trim() || rek.namaAkun : "rekening"} sebesar {rp(f.harga)} (Dana Pengelola).</>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
TabTambah.propTypes = { kategori: PropTypes.array, meta: PropTypes.object, onSelesai: PropTypes.func };

// ----------------------------------------------------------------------------------------------
function TabSusut({ onSelesai }) {
  const [sampai, setSampai] = useState(hariIni().slice(0, 7));
  const [p, setP] = useState(null);
  const [kirim, setKirim] = useState(false);
  const muat = useCallback(() => {
    setP(null);
    keuangan.asetPratinjau(sampai).then(setP).catch((e) => { setP({ bulan: [], total: 0 }); Swal.fire("Gagal", errMsg(e), "error"); });
  }, [sampai]);
  useEffect(() => { muat(); }, [muat]);

  const proses = async () => {
    const k = await Swal.fire({ icon: "question", title: `Proses penyusutan s.d. ${labelPeriode(sampai)}?`, html: `Total ${rp(p.total)} dalam ${p.bulan.length} bulan. Satu jurnal per bulan.`, showCancelButton: true, confirmButtonText: "Proses", cancelButtonText: "Batal" });
    if (!k.isConfirmed) return;
    setKirim(true);
    try {
      const r = await keuangan.asetProses(sampai);
      await Swal.fire({ icon: "success", title: "Penyusutan diproses", html: `${r.pesan}<br/><small>${(r.jurnal || []).join("<br/>")}</small>` });
      muat();
      onSelesai();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Gagal memproses", text: errMsg(e) });
    } finally {
      setKirim(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Proses s.d. bulan"><input type="month" max={hariIni().slice(0, 7)} className={`${inputCls} w-48`} value={sampai} onChange={(e) => setSampai(e.target.value)} /></Field>
        <Btn color="green" disabled={!p || !p.bulan.length || kirim} onClick={proses}>{kirim ? "Memproses…" : "Proses penyusutan"}</Btn>
      </div>
      <p className="text-xs text-gray-500">
        Semua bulan yang belum dijurnal s.d. bulan terpilih ikut diproses. Bulan yang periodenya sudah ditutup dicatat sebagai susulan di bulan terbuka berikutnya.
        Untuk mengoreksi, batalkan jurnal penyusutannya di Daftar Jurnal (jenis PENYUSUTAN) lalu proses ulang.
      </p>
      {p == null ? <div className="text-gray-400">Memuat…</div> : p.bulan.length === 0 ? (
        <div className="text-sm bg-green-50 border border-green-200 text-green-800 rounded p-3">Tidak ada penyusutan tertunda s.d. {labelPeriode(sampai)}.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr><th className="text-left py-2 px-2">Bulan</th><th className="text-left px-2">Aset</th><th className="text-right px-2">Penyusutan</th></tr>
            </thead>
            <tbody>
              {p.bulan.map((b) => (
                <tr key={b.periode} className="border-t align-top">
                  <td className="py-1.5 px-2 whitespace-nowrap">{labelPeriode(b.periode)}{b.tutup && <span className="block text-xs text-amber-700">periode ditutup → susulan</span>}</td>
                  <td className="px-2">{b.aset.map((a) => <div key={a.id}>{a.kode} {a.nama} <span className="text-xs text-gray-500">· {a.kategori} · {num(a.nilai)}</span></div>)}</td>
                  <td className="px-2 text-right tabular-nums">{num(b.total)}</td>
                </tr>
              ))}
              <tr className="border-t font-semibold bg-gray-50"><td className="py-1.5 px-2" colSpan={2}>Total</td><td className="px-2 text-right tabular-nums">{num(p.total)}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
TabSusut.propTypes = { onSelesai: PropTypes.func };
