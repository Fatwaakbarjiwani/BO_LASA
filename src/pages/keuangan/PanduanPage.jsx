import { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Judul, inputCls } from "./ui";
import { PANDUAN_BAWAAN } from "./panduanBawaan";

/* ---------- format sederhana: ## subjudul, - butir, 1. nomor, > catatan, | tabel |, **tebal**, `kode` ---------- */

function Inline({ teks }) {
  const bagian = teks.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return bagian.map((b, i) =>
    b.startsWith("**") ? <b key={i}>{b.slice(2, -2)}</b>
      : b.startsWith("`") ? <code key={i} className="px-1 rounded bg-gray-100 text-[0.85em] text-slate-700">{b.slice(1, -1)}</code>
        : <Fragment key={i}>{b}</Fragment>);
}

function blokDari(isi) {
  const blok = [];
  for (const raw of isi.split("\n")) {
    const l = raw.trimEnd();
    const akhir = blok[blok.length - 1];
    if (!l.trim()) { blok.push({ t: "kosong" }); continue; }
    if (l.startsWith("## ")) blok.push({ t: "h", isi: l.slice(3) });
    else if (l.startsWith("> ")) blok.push({ t: "catatan", isi: l.slice(2) });
    else if (l.startsWith("|")) {
      const sel = l.replace(/^\||\|$/g, "").split("|").map((x) => x.trim());
      if (akhir?.t === "tabel") akhir.baris.push(sel); else blok.push({ t: "tabel", baris: [sel] });
    } else if (/^- /.test(l)) {
      if (akhir?.t === "ul") akhir.item.push(l.slice(2)); else blok.push({ t: "ul", item: [l.slice(2)] });
    } else if (/^\d+\. /.test(l)) {
      const isiL = l.replace(/^\d+\. /, "");
      if (akhir?.t === "ol") akhir.item.push(isiL); else blok.push({ t: "ol", item: [isiL] });
    } else if (akhir?.t === "p") akhir.isi += ` ${l}`;
    else blok.push({ t: "p", isi: l });
  }
  return blok.filter((b) => b.t !== "kosong");
}

export function IsiPanduan({ isi }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed text-gray-800">
      {blokDari(isi).map((b, i) => {
        if (b.t === "h") return <h4 key={i} className="font-semibold text-green-800 mt-4">{b.isi}</h4>;
        if (b.t === "catatan") return <div key={i} className="bg-amber-50 border-l-4 border-amber-400 px-3 py-2 rounded"><Inline teks={b.isi} /></div>;
        if (b.t === "ul") return <ul key={i} className="list-disc ml-6 space-y-0.5">{b.item.map((x, j) => <li key={j}><Inline teks={x} /></li>)}</ul>;
        if (b.t === "ol") return <ol key={i} className="list-decimal ml-6 space-y-0.5">{b.item.map((x, j) => <li key={j}><Inline teks={x} /></li>)}</ol>;
        if (b.t === "tabel") {
          const [kepala, ...isiT] = b.baris;
          return (
            <div key={i} className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-green-50"><tr>{kepala.map((k, j) => <th key={j} className="border px-2 py-1 text-left">{k}</th>)}</tr></thead>
                <tbody>{isiT.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k} className="border px-2 py-1 align-top"><Inline teks={c} /></td>)}</tr>)}</tbody>
              </table>
            </div>
          );
        }
        return <p key={i}><Inline teks={b.isi} /></p>;
      })}
    </div>
  );
}
IsiPanduan.propTypes = { isi: PropTypes.string };

/* ---------- cetak: HTML sederhana di tab baru ---------- */
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inlineHtml = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>");
function htmlBagian(isi) {
  return blokDari(isi).map((b) => {
    if (b.t === "h") return `<h3>${inlineHtml(b.isi)}</h3>`;
    if (b.t === "catatan") return `<div class="cat">${inlineHtml(b.isi)}</div>`;
    if (b.t === "ul" || b.t === "ol") return `<${b.t}>${b.item.map((x) => `<li>${inlineHtml(x)}</li>`).join("")}</${b.t}>`;
    if (b.t === "tabel") return `<table>${b.baris.map((r, i) => `<tr>${r.map((c) => `<${i ? "td" : "th"}>${inlineHtml(c)}</${i ? "td" : "th"}>`).join("")}</tr>`).join("")}</table>`;
    return `<p>${inlineHtml(b.isi)}</p>`;
  }).join("");
}
function cetak(bagian) {
  const w = window.open("", "_blank");
  if (!w) return Swal.fire("Pop-up diblokir", "Izinkan pop-up untuk mencetak panduan.", "info");
  w.document.write(`<html><head><title>Panduan Administrasi Keuangan</title><style>
    body{font-family:Arial,sans-serif;margin:28px;font-size:12px;color:#222} h1{font-size:20px;text-align:center;margin:0}
    .sub{text-align:center;color:#555;margin-bottom:18px} h2{font-size:15px;color:#166534;border-bottom:2px solid #166534;padding-bottom:3px;margin-top:24px;page-break-after:avoid}
    h3{font-size:13px;color:#166534;margin:12px 0 4px} table{border-collapse:collapse;width:100%;margin:6px 0} th,td{border:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top}
    th{background:#eaf5ee} .cat{background:#fff7e0;border-left:4px solid #e0a800;padding:6px 8px;margin:6px 0} code{background:#f1f1f1;padding:0 3px}
  </style></head><body><h1>PANDUAN ADMINISTRASI KEUANGAN</h1><div class="sub">LAZIS Sultan Agung — dicetak ${new Date().toLocaleString("id-ID")}</div>
  ${bagian.map((b) => `<h2>${esc(b.judul)}</h2>${htmlBagian(b.isi)}`).join("")}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

/** Panduan (manual book) menu Administrasi. Dapat diedit; tersimpan di server untuk semua pengguna. */
export default function PanduanPage() {
  const [bagian, setBagian] = useState(PANDUAN_BAWAAN);
  const [info, setInfo] = useState(null); // { diubahAt, diubahOleh } bila versi tersimpan dipakai
  const [aktif, setAktif] = useState(0);
  const [cari, setCari] = useState("");
  const [draf, setDraf] = useState(null); // salinan saat mode edit
  const [simpan, setSimpan] = useState(false);

  const muat = () =>
    keuangan.panduan()
      .then((r) => {
        if (r.length) {
          setBagian(r.map((x) => ({ judul: x.judul, isi: x.isi })));
          setInfo({ diubahAt: String(r[0].diubahAt).replace("T", " ").slice(0, 16), diubahOleh: r[0].diubahOleh });
        } else { setBagian(PANDUAN_BAWAAN); setInfo(null); }
      })
      .catch(() => { setBagian(PANDUAN_BAWAAN); setInfo(null); });
  useEffect(() => { muat(); }, []);

  const kirim = async (isi, pesanKonfirmasi) => {
    const k = await Swal.fire({ icon: "question", title: pesanKonfirmasi, text: "Perubahan berlaku untuk semua pengguna dan tercatat di Audit.", showCancelButton: true, confirmButtonText: "Ya, simpan", cancelButtonText: "Batal" });
    if (!k.isConfirmed) return;
    setSimpan(true);
    try {
      const r = await keuangan.panduanSimpan(isi);
      await muat();
      setDraf(null);
      setAktif(0);
      Swal.fire("Berhasil", r.pesan, "success");
    } catch (e) { Swal.fire("Gagal", errMsg(e), "error"); } finally { setSimpan(false); }
  };

  const ubah = (i, field, v) => setDraf((d) => d.map((b, j) => (j === i ? { ...b, [field]: v } : b)));
  const pindah = (i, arah) => setDraf((d) => { const n = [...d]; const j = i + arah; if (j < 0 || j >= n.length) return d; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const hapus = async (i) => {
    const k = await Swal.fire({ icon: "warning", title: `Hapus bagian "${draf[i].judul}"?`, text: "Belum permanen sampai Anda menekan Simpan.", showCancelButton: true, confirmButtonText: "Hapus", cancelButtonText: "Batal" });
    if (k.isConfirmed) setDraf((d) => d.filter((_, j) => j !== i));
  };

  const q = cari.trim().toLowerCase();
  const tampil = bagian.map((b, i) => ({ ...b, i })).filter((b) => !q || `${b.judul}\n${b.isi}`.toLowerCase().includes(q));

  if (draf) {
    return (
      <div>
        <Judul aksi={
          <>
            <Btn color="gray" onClick={() => setDraf((d) => [...d, { judul: `${d.length + 1}. Bagian baru`, isi: "Tulis isi di sini." }])}>+ Tambah bagian</Btn>
            <Btn color="gray" onClick={() => setDraf(null)}>Batal</Btn>
            <Btn color="green" disabled={simpan} onClick={() => kirim(draf, "Simpan perubahan panduan?")}>{simpan ? "Menyimpan…" : "Simpan"}</Btn>
          </>
        }>Edit Panduan</Judul>
        <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          Format: <code>## Subjudul</code> · <code>- butir</code> · <code>1. langkah</code> · <code>&gt; catatan penting</code> ·
          <code> | kolom 1 | kolom 2 |</code> (baris pertama = judul tabel) · <code>**tebal**</code> · <code>`tombol`</code>. Pratinjau tampil di kanan.
        </div>
        <div className="space-y-4">
          {draf.map((b, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-3">
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <input className={`${inputCls} flex-1 min-w-[16rem] font-semibold`} value={b.judul} onChange={(e) => ubah(i, "judul", e.target.value)} placeholder="Judul bagian" />
                <Btn color="gray" disabled={i === 0} onClick={() => pindah(i, -1)}>↑</Btn>
                <Btn color="gray" disabled={i === draf.length - 1} onClick={() => pindah(i, 1)}>↓</Btn>
                <Btn color="red" onClick={() => hapus(i)}>Hapus</Btn>
              </div>
              <div className="grid lg:grid-cols-2 gap-3">
                <textarea className={`${inputCls} font-mono text-xs h-80`} value={b.isi} onChange={(e) => ubah(i, "isi", e.target.value)} />
                <div className="border rounded p-3 h-80 overflow-y-auto bg-gray-50"><IsiPanduan isi={b.isi} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sekarang = bagian[aktif] ? aktif : 0;
  return (
    <div>
      <Judul aksi={
        <>
          <input className={`${inputCls} w-56`} placeholder="Cari di panduan…" value={cari} onChange={(e) => setCari(e.target.value)} />
          <Btn color="gray" onClick={() => cetak(bagian)}>Cetak / PDF</Btn>
          <Btn color="amber" onClick={() => setDraf(bagian.map((b) => ({ ...b })))}>Edit panduan</Btn>
          {info && <Btn color="gray" disabled={simpan} onClick={() => kirim([], "Kembalikan panduan ke isi bawaan?")}>Kembalikan ke bawaan</Btn>}
        </>
      }>Panduan Administrasi Keuangan</Judul>
      <p className="text-xs text-gray-500 mb-3">
        {info ? `Versi disesuaikan — terakhir diubah ${info.diubahAt}${info.diubahOleh ? ` oleh ${info.diubahOleh}` : ""}.` : "Versi bawaan sistem."} Panduan ini dapat disesuaikan dengan tombol Edit panduan.
      </p>
      <div className="grid md:grid-cols-[16rem_1fr] gap-4">
        <nav className="bg-white shadow rounded-lg p-2 h-max md:sticky md:top-4">
          {tampil.length === 0 && <div className="text-sm text-gray-500 p-2">Tidak ditemukan.</div>}
          {tampil.map((b) => (
            <button key={b.i} type="button" onClick={() => setAktif(b.i)}
              className={`block w-full text-left text-sm px-3 py-2 rounded ${b.i === sekarang ? "bg-green-600 text-white" : "hover:bg-gray-100"}`}>{b.judul}</button>
          ))}
        </nav>
        <article className="bg-white shadow rounded-lg p-5">
          {bagian[sekarang] && (
            <>
              <h3 className="text-lg font-bold mb-3">{bagian[sekarang].judul}</h3>
              <IsiPanduan isi={bagian[sekarang].isi} />
              <div className="flex justify-between mt-6">
                <Btn color="gray" disabled={sekarang === 0} onClick={() => setAktif(sekarang - 1)}>‹ Sebelumnya</Btn>
                <Btn color="gray" disabled={sekarang >= bagian.length - 1} onClick={() => setAktif(sekarang + 1)}>Berikutnya ›</Btn>
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
