import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Modal, Tabel, rp } from "./ui";
import { cetakJurnal } from "./cetakJurnal";
import { unduhExcelJurnalSatu } from "../../services/jurnalExport";
import { barisKopCsv, bukaPdf, gambarKop, muatLogo, simpanCsv } from "./kopLaporan";

/**
 * Telusur (traceability) laporan: baris laporan -> pop-up buku besar -> pop-up jurnal.
 * Parameter buku besar = field `ref` dari baris laporan backend (mis. "coa=12" atau "kelompok=PENERIMAAN&dana=ZAKAT&lr=1").
 */

const tgl = (v) => (v ? String(v).slice(0, 10).split("-").reverse().join("-") : "");
const num = (v) => new Intl.NumberFormat("id-ID").format(Math.round(Number(v) || 0));
const akhirBulan = (p) => { const [y, m] = p.split("-").map(Number); return `${p}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`; };

/** Rentang tanggal buku besar untuk pop-up dari laporan bulanan/tahunan. */
export function rentangTelusur(months, bulan) {
  if (bulan) return { from: `${bulan}-01`, to: akhirBulan(bulan) };
  return { from: `${months[0]}-01`, to: akhirBulan(months[months.length - 1]) };
}

export const paramDariRef = (ref) => Object.fromEntries(new URLSearchParams(ref));

/** Tabel buku besar per akun; nomor bukti bisa diklik untuk membuka jurnal. */
export function TabelBukuBesar({ data, onJurnal }) {
  if (!data) return null;
  if (!data.akun.length) return <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm">Tidak ada akun / mutasi pada filter ini.</div>;
  return (
    <div className="space-y-5">
      {data.akun.map((a) => (
        <div key={a.coaId} className="bg-white shadow rounded-lg overflow-x-auto">
          <div className="px-3 py-2 font-semibold bg-green-50 text-green-900 flex flex-wrap justify-between gap-2">
            <span>{a.kode} {a.nama}</span>
            <span className="text-xs font-normal text-gray-600">saldo normal {a.saldoNormal.toLowerCase()}</span>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-1.5">Tanggal</th>
                <th className="text-left px-2">No. Bukti</th>
                <th className="text-left px-2">Uraian</th>
                <th className="text-left px-2">Dana</th>
                <th className="text-right px-2">Debit</th>
                <th className="text-right px-2">Kredit</th>
                <th className="text-right px-3">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t bg-gray-50">
                <td colSpan={6} className="px-3 py-1.5 italic text-gray-600">Saldo awal per {tgl(data.from)}</td>
                <td className="px-3 text-right tabular-nums">{num(a.saldoAwal)}</td>
              </tr>
              {a.baris.map((b, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-1.5 whitespace-nowrap">{tgl(b.tanggal)}</td>
                  <td className="px-2 whitespace-nowrap">
                    {b.jurnalId ? (
                      <button type="button" className="text-blue-600 hover:underline" onClick={() => onJurnal(b.jurnalId)}>{b.nomorBukti}</button>
                    ) : b.nomorBukti}
                  </td>
                  <td className="px-2">{b.uraian}</td>
                  <td className="px-2"><DanaBadge dana={b.dana} /></td>
                  <td className="px-2 text-right tabular-nums">{b.debit ? num(b.debit) : ""}</td>
                  <td className="px-2 text-right tabular-nums">{b.kredit ? num(b.kredit) : ""}</td>
                  <td className={`px-3 text-right tabular-nums ${b.saldo < 0 ? "text-red-600" : ""}`}>{num(b.saldo)}</td>
                </tr>
              ))}
              <tr className="border-t font-semibold bg-gray-50">
                <td colSpan={4} className="px-3 py-1.5">Jumlah mutasi & saldo akhir per {tgl(data.to)}</td>
                <td className="px-2 text-right tabular-nums">{num(a.totalDebit)}</td>
                <td className="px-2 text-right tabular-nums">{num(a.totalKredit)}</td>
                <td className={`px-3 text-right tabular-nums ${a.saldoAkhir < 0 ? "text-red-600" : ""}`}>{num(a.saldoAkhir)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
TabelBukuBesar.propTypes = { data: PropTypes.object, onJurnal: PropTypes.func };

const subjudulBb = (data, ket) => `Periode: ${tgl(data.from)} s.d. ${tgl(data.to)}${ket ? ` | ${ket}` : ""}`;

export function unduhBukuBesarCsv(data, ket = "") {
  const rows = [...barisKopCsv("BUKU BESAR", subjudulBb(data, ket))];
  data.akun.forEach((a) => {
    rows.push([], [`${a.kode} ${a.nama}`], ["Tanggal", "No. Bukti", "Uraian", "Dana", "Debit", "Kredit", "Saldo"]);
    rows.push(["", "", `Saldo awal per ${tgl(data.from)}`, "", "", "", a.saldoAwal]);
    a.baris.forEach((b) => rows.push([tgl(b.tanggal), b.nomorBukti, b.uraian || "", b.dana || "", b.debit || "", b.kredit || "", b.saldo]));
    rows.push(["", "", "Jumlah / saldo akhir", "", a.totalDebit, a.totalKredit, a.saldoAkhir]);
  });
  simpanCsv(rows, `Buku-Besar-${data.from}-sd-${data.to}.csv`);
}

export async function cetakBukuBesar(data, ket = "") {
  const logo = await muatLogo();
  const doc = new jsPDF({ format: "a4", unit: "mm", orientation: "landscape" });
  let y = gambarKop(doc, logo, "BUKU BESAR", subjudulBb(data, ket));
  data.akun.forEach((a, i) => {
    if (i > 0 && y > 170) { doc.addPage(); y = 15; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(`${a.kode} ${a.nama}`, 14, y + 4);
    autoTable(doc, {
      startY: y + 6,
      head: [["Tanggal", "No. Bukti", "Uraian", "Dana", "Debit", "Kredit", "Saldo"]],
      body: [
        ["", "", `Saldo awal per ${tgl(data.from)}`, "", "", "", num(a.saldoAwal)],
        ...a.baris.map((b) => [tgl(b.tanggal), b.nomorBukti, b.uraian || "", b.dana || "", b.debit ? num(b.debit) : "", b.kredit ? num(b.kredit) : "", num(b.saldo)]),
      ],
      foot: [["", "", "Jumlah / saldo akhir", "", num(a.totalDebit), num(a.totalKredit), num(a.saldoAkhir)]],
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 101, 52] },
      footStyles: { fillColor: [235, 235, 235], textColor: 20, fontStyle: "bold" },
      columnStyles: { 2: { cellWidth: 95 }, 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" } },
    });
    y = doc.lastAutoTable.finalY + 6;
  });
  bukaPdf(doc, `Buku-Besar-${data.from}-sd-${data.to}.pdf`);
}

/** Pop-up detail jurnal (baca saja) + Cetak & Unduh Excel. */
export function ModalJurnal({ id, onClose }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    keuangan.jurnalDetail(id).then(setD).catch((e) => { Swal.fire("Gagal", errMsg(e), "error"); onClose(); });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const jalankan = (aksi) => async () => {
    try { await aksi(); } catch (e) { Swal.fire("Gagal", e?.response ? errMsg(e) : e.message, "error"); }
  };
  return (
    <Modal wide title={d ? `Jurnal ${d.nomorBukti}` : "Memuat jurnal…"} onClose={onClose}>
      {!d ? <div className="text-gray-400">Memuat…</div> : (
        <>
          <div className="text-sm text-gray-600 mb-3 grid grid-cols-2 gap-1">
            <div>Tanggal: <b>{tgl(d.tanggal)}</b></div>
            <div>Jenis: <b>{d.jenis}</b> <DanaBadge dana={d.dana} /></div>
            <div>Status: <b>{d.status}</b> · {d.verifikasi}</div>
            <div>Sumber: <b>{d.sumber}</b></div>
            <div className="col-span-2">Keterangan: {d.keterangan}</div>
          </div>
          <Tabel
            kolom={[
              { judul: "Dana", tampil: (b) => <DanaBadge dana={b.dana} /> },
              { judul: "Akun", tampil: (b) => `${b.kode} ${b.akun}` },
              { judul: "Debit", kanan: true, tampil: (b) => (Number(b.debit) ? rp(b.debit) : "") },
              { judul: "Kredit", kanan: true, tampil: (b) => (Number(b.kredit) ? rp(b.kredit) : "") },
            ]}
            baris={d.baris.filter((b) => !b.dihapus)}
          />
          {d.penerimaan?.length > 0 && (
            <div className="mt-3 text-sm">
              <b>Donatur:</b> {d.penerimaan[0].donatur_nama} · {d.penerimaan[0].metode_bayar}
              {d.penerimaan[0].jenis_zakat && ` · Zakat ${d.penerimaan[0].jenis_zakat}`}
            </div>
          )}
          {d.penyaluran?.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-semibold mb-1">Penerima</div>
              <Tabel
                kolom={[
                  { judul: "Penerima", tampil: (p) => p.penerima || "—" },
                  { judul: "Asnaf", kunci: "asnaf" },
                  { judul: "Jumlah penerima", kanan: true, kunci: "jmlPenerima" },
                  { judul: "Jumlah", kanan: true, tampil: (p) => rp(p.jumlah) },
                ]}
                baris={d.penyaluran}
              />
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Btn color="gray" onClick={jalankan(() => cetakJurnal(d))}>Cetak</Btn>
            <Btn color="gray" onClick={jalankan(() => unduhExcelJurnalSatu(d.id))}>Unduh Excel</Btn>
          </div>
        </>
      )}
    </Modal>
  );
}
ModalJurnal.propTypes = { id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired, onClose: PropTypes.func.isRequired };

/** Pop-up buku besar untuk satu baris laporan; nomor bukti di dalamnya membuka pop-up jurnal. */
export function ModalBukuBesar({ judul, params, onClose }) {
  const [data, setData] = useState(null);
  const [jurnal, setJurnal] = useState(null);
  useEffect(() => {
    keuangan.bukuBesar(params).then(setData).catch((e) => { Swal.fire("Gagal", errMsg(e), "error"); onClose(); });
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps
  const jalankan = (aksi) => async () => {
    try { await aksi(); } catch (e) { Swal.fire("Gagal", e.message, "error"); }
  };
  return (
    <>
      <Modal lebar="max-w-6xl" title={`Buku Besar — ${judul}`} onClose={onClose}>
        {!data ? <div className="text-gray-400">Memuat…</div> : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-sm text-gray-600">
              <span>Periode {tgl(data.from)} s.d. {tgl(data.to)} · klik No. Bukti untuk melihat jurnal</span>
              <span className="flex gap-2">
                <Btn color="gray" onClick={() => unduhBukuBesarCsv(data, judul)}>Unduh CSV</Btn>
                <Btn color="gray" onClick={jalankan(() => cetakBukuBesar(data, judul))}>Cetak</Btn>
              </span>
            </div>
            <TabelBukuBesar data={data} onJurnal={setJurnal} />
          </>
        )}
      </Modal>
      {jurnal && <ModalJurnal id={jurnal} onClose={() => setJurnal(null)} />}
    </>
  );
}
ModalBukuBesar.propTypes = { judul: PropTypes.string, params: PropTypes.object.isRequired, onClose: PropTypes.func.isRequired };
