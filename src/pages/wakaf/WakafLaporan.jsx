import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { wakaf } from "../../services/wakafApi";
import { errMsg } from "../../services/keuanganApi";
import { Btn, Judul, Tabel, inputCls, num } from "../keuangan/ui";
import { useWakafMeta } from "./WakafInput";

const hariIni = () => new Date().toISOString().slice(0, 10);
const awalTahun = () => `${new Date().getFullYear()}-01-01`;
const akhirTahunLalu = () => `${new Date().getFullYear() - 1}-12-31`;

/** Kontrol angka yang ditampilkan di bawah judul laporan. */
function kontrol(r) {
  if (!r) return null;
  const s = r.summary || {};
  if ("selisihKontrol" in s) return s.selisihKontrol === 0 ? ["ok", "Kontrol: cocok dengan saldo buku wakaf"] : ["x", `Selisih kontrol ${num(s.selisihKontrol)}`];
  if ("seimbang" in s) return s.seimbang ? ["ok", "Kontrol: seimbang"] : ["x", "Tidak seimbang — periksa jurnal"];
  return null;
}

function unduhCsv(r) {
  const rows = [[r.title], [r.subtitle], [], ["Kode", "Uraian", ...r.columns]];
  r.rows.forEach((x) => rows.push([x.code || "", `${"  ".repeat(x.level)}${x.label}`, ...(x.values || [])]));
  const csv = rows.map((row) => row.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = `${r.title.replace(/\s+/g, "-")}-${hariIni()}.csv`;
  a.click();
}

export function TabelLaporan({ r }) {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th className="text-left py-2.5 px-3">Uraian</th>
            {r.columns.map((c) => <th key={c} className="text-right py-2.5 px-3 text-nowrap">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {r.rows.map((x, i) => {
            const cls = {
              HEADER: "font-bold bg-green-50 text-green-900",
              SUBHEADER: "font-semibold text-gray-800",
              TOTAL: "font-semibold border-t-2 border-gray-300 bg-gray-50",
              ITEM: "text-gray-700",
            }[x.style];
            return (
              <tr key={i} className={`border-t ${cls}`}>
                <td className="py-1.5 px-3" style={{ paddingLeft: `${0.75 + x.level * 1.25}rem` }}>
                  {x.code && x.style !== "ITEM" ? `${x.code}. ` : ""}{x.label}
                  {x.code && x.style === "ITEM" && <span className="ml-2 text-xs text-gray-400">{x.code}</span>}
                </td>
                {r.columns.map((c, j) => {
                  const v = x.values ? x.values[j] : null;
                  return (
                    <td key={c} className={`py-1.5 px-3 text-right tabular-nums text-nowrap ${v < 0 ? "text-red-600" : ""}`}>
                      {v === null || v === undefined ? "" : num(v)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
TabelLaporan.propTypes = { r: PropTypes.object };

const JUDUL = {
  aktivitas: "Laporan Aktivitas", posisi: "Laporan Posisi Keuangan", "arus-kas": "Laporan Arus Kas",
  "rincian-aset": "Laporan Rincian Aset", "neraca-saldo": "Neraca Saldo",
};

/** Laporan format BWI / PSAK 412 dari buku wakaf. */
export function LaporanWakaf({ jenis }) {
  const rentang = jenis === "aktivitas" || jenis === "arus-kas";
  const [p, setP] = useState({ from: awalTahun(), to: hariIni(), tanggal: hariIni(), banding: akhirTahunLalu(), lengkap: true });
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const params = rentang ? { from: p.from, to: p.to, ...(jenis === "aktivitas" ? { lengkap: p.lengkap } : {}) }
      : jenis === "posisi" ? { tanggal: p.tanggal, banding: p.banding } : { tanggal: p.tanggal };
    setLoading(true);
    wakaf.laporan(jenis, params).then(setR).catch((e) => Swal.fire("Gagal", errMsg(e), "error")).finally(() => setLoading(false));
  }, [jenis, p, rentang]);
  const k = kontrol(r);
  return (
    <div>
      <Judul
        aksi={
          <>
            {rentang ? (
              <>
                <input type="date" className={inputCls} value={p.from} onChange={(e) => setP({ ...p, from: e.target.value })} />
                <span className="text-gray-400">s/d</span>
                <input type="date" className={inputCls} value={p.to} onChange={(e) => setP({ ...p, to: e.target.value })} />
              </>
            ) : (
              <input type="date" className={inputCls} value={p.tanggal} onChange={(e) => setP({ ...p, tanggal: e.target.value })} />
            )}
            {jenis === "posisi" && (
              <label className="text-sm text-gray-600 flex items-center gap-1">banding
                <input type="date" className={inputCls} value={p.banding} onChange={(e) => setP({ ...p, banding: e.target.value })} />
              </label>
            )}
            {jenis === "aktivitas" && (
              <label className="text-sm text-gray-600 flex items-center gap-1">
                <input type="checkbox" checked={p.lengkap} onChange={(e) => setP({ ...p, lengkap: e.target.checked })} /> semua baris BWI
              </label>
            )}
            <Btn color="gray" onClick={() => r && unduhCsv(r)} disabled={!r}>Unduh CSV</Btn>
            <Btn color="gray" onClick={() => window.print()}>Cetak</Btn>
          </>
        }
      >
        {JUDUL[jenis]} Wakaf
      </Judul>
      {r && (
        <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
          <span className="text-gray-500">{r.subtitle}</span>
          {k && <span className={`px-2 py-0.5 rounded ${k[0] === "ok" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>{k[1]}</span>}
          {jenis === "aktivitas" && (
            <span className="text-gray-500">Penerimaan wakaf temporer (B) dicatat sebagai liabilitas, tidak menambah aset neto.</span>
          )}
        </div>
      )}
      {loading && <div className="text-gray-400">Memuat…</div>}
      {r && !loading && <TabelLaporan r={r} />}
    </div>
  );
}
LaporanWakaf.propTypes = { jenis: PropTypes.string };

export function BukuBesarWakaf() {
  const [meta] = useWakafMeta();
  const [p, setP] = useState({ akun: "1101", from: awalTahun(), to: hariIni() });
  const [r, setR] = useState(null);
  useEffect(() => {
    wakaf.laporan("buku-besar", p).then(setR).catch((e) => Swal.fire("Gagal", errMsg(e), "error"));
  }, [p]);
  return (
    <div>
      <Judul
        aksi={
          <>
            <select className={inputCls} value={p.akun} onChange={(e) => setP({ ...p, akun: e.target.value })}>
              {meta?.akun.map((a) => <option key={a.kode} value={a.kode}>{a.kode} {a.nama}</option>)}
            </select>
            <input type="date" className={inputCls} value={p.from} onChange={(e) => setP({ ...p, from: e.target.value })} />
            <input type="date" className={inputCls} value={p.to} onChange={(e) => setP({ ...p, to: e.target.value })} />
          </>
        }
      >
        Buku Besar Wakaf
      </Judul>
      {r && (
        <>
          <div className="text-sm text-gray-600 mb-2">
            {r.akun.kode} {r.akun.nama} — {r.periode}. Saldo awal <b>{num(r.saldoAwal)}</b>, saldo akhir <b>{num(r.saldoAkhir)}</b>
          </div>
          <Tabel
            kolom={[
              { judul: "Tanggal", kunci: "tanggal" },
              { judul: "Nomor bukti", kunci: "nomorBukti" },
              { judul: "Keterangan", kunci: "keterangan" },
              { judul: "Debit", kanan: true, tampil: (b) => (b.debit ? num(b.debit) : "") },
              { judul: "Kredit", kanan: true, tampil: (b) => (b.kredit ? num(b.kredit) : "") },
              { judul: "Saldo", kanan: true, tampil: (b) => num(b.saldo) },
            ]}
            baris={r.baris}
          />
        </>
      )}
    </div>
  );
}

export function WakafTemporer() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    wakaf.laporan("temporer").then(setRows).catch((e) => Swal.fire("Gagal", errMsg(e), "error"));
  }, []);
  return (
    <div>
      <Judul>Daftar Wakaf Temporer</Judul>
      <p className="text-sm text-gray-500 mb-3">
        Wakaf temporer disajikan sebagai liabilitas (PSAK 412). Harta dengan jangka waktu &quot;Temporer&quot; yang diimpor dari BWI
        sebagai wakaf permanen ikut ditampilkan agar dapat ditinjau keuangan.
      </p>
      <Tabel
        kolom={[
          { judul: "Nama", kunci: "name" },
          { judul: "Wakif", kunci: "wakif" },
          { judul: "Jenis", kunci: "typeLabel" },
          { judul: "Tanggal", kunci: "acquiredAt" },
          { judul: "Jangka waktu", kunci: "term" },
          { judul: "Jatuh tempo", tampil: (r) => r.dueDate || <span className="text-amber-600">belum diisi</span> },
          { judul: "Nilai", kanan: true, tampil: (r) => num(r.currentValue) },
        ]}
        baris={rows}
        kosong="Tidak ada wakaf temporer"
      />
    </div>
  );
}
