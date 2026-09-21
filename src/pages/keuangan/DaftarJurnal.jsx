import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Judul, Modal, Tabel, inputCls, rp } from "./ui";

const STATUS_WARNA = {
  POSTED: "bg-green-100 text-green-800",
  VOID: "bg-gray-200 text-gray-600 line-through",
  DRAFT: "bg-yellow-100 text-yellow-800",
};

export default function DaftarJurnal() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ dana: "", jenis: "", periode: "", status: "", q: "" });
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const muat = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
    keuangan.jurnal(params).then(setRows).catch((e) => Swal.fire("Gagal", errMsg(e), "error")).finally(() => setLoading(false));
  }, [f]);
  useEffect(() => { muat(); }, [muat]);

  const buka = (id) => keuangan.jurnalDetail(id).then(setDetail).catch((e) => Swal.fire("Gagal", errMsg(e), "error"));

  const batalkan = async (j) => {
    const { value: alasan, isConfirmed } = await Swal.fire({
      title: `Batalkan ${j.nomorBukti}?`,
      input: "text",
      inputLabel: "Alasan pembatalan (wajib)",
      showCancelButton: true,
      confirmButtonText: "Batalkan jurnal",
      cancelButtonText: "Tutup",
    });
    if (!isConfirmed) return;
    try {
      const r = await keuangan.voidJurnal(j.id, alasan);
      await Swal.fire("Berhasil", r.pesan, "success");
      setDetail(null);
      muat();
    } catch (e) {
      Swal.fire("Ditolak", errMsg(e), "error");
    }
  };

  return (
    <div>
      <Judul aksi={<Btn color="gray" onClick={muat}>{loading ? "Memuat…" : "Muat ulang"}</Btn>}>Daftar Jurnal</Judul>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
        <select className={inputCls} value={f.dana} onChange={(e) => setF({ ...f, dana: e.target.value })}>
          <option value="">Semua dana</option>
          {["ZAKAT", "INFAQ", "DSKL", "PENGELOLA", "WAKAF"].map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className={inputCls} value={f.jenis} onChange={(e) => setF({ ...f, jenis: e.target.value })}>
          <option value="">Semua jenis</option>
          {["PENERIMAAN", "PENYALURAN", "BEBAN_OPERASIONAL", "TRANSFER_DANA", "ALOKASI_AMIL", "BAGI_HASIL_BANK", "PENYESUAIAN"].map((d) => <option key={d}>{d}</option>)}
        </select>
        <input type="month" className={inputCls} value={f.periode} onChange={(e) => setF({ ...f, periode: e.target.value })} />
        <select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
          <option value="">Semua status</option>
          {["POSTED", "VOID"].map((d) => <option key={d}>{d}</option>)}
        </select>
        <input className={inputCls} placeholder="Cari no. bukti / keterangan" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
      </div>
      <Tabel
        kolom={[
          { judul: "No. Bukti", tampil: (j) => <button className="text-blue-600 hover:underline" onClick={() => buka(j.id)}>{j.nomorBukti}</button> },
          { judul: "Tanggal", tampil: (j) => String(j.tanggal).slice(0, 10) },
          { judul: "Jenis", kunci: "jenis" },
          { judul: "Dana", tampil: (j) => <DanaBadge dana={j.dana} /> },
          { judul: "Keterangan", tampil: (j) => <span className="line-clamp-1 max-w-xs inline-block">{j.keterangan}</span> },
          { judul: "Nilai", kanan: true, tampil: (j) => rp(j.total) },
          { judul: "Status", tampil: (j) => (
            <span className={`px-2 py-0.5 rounded text-xs ${STATUS_WARNA[j.status] || ""}`}>
              {j.status}{j.lintasDanaLegacy ? " · legacy" : ""}
            </span>
          ) },
        ]}
        baris={rows}
        kosong={loading ? "Memuat…" : "Tidak ada jurnal"}
      />
      {detail && (
        <Modal wide title={`Jurnal ${detail.nomorBukti}`} onClose={() => setDetail(null)}>
          <div className="text-sm text-gray-600 mb-3 grid grid-cols-2 gap-1">
            <div>Tanggal: <b>{String(detail.tanggal).slice(0, 10)}</b></div>
            <div>Jenis: <b>{detail.jenis}</b> <DanaBadge dana={detail.dana} /></div>
            <div>Status: <b>{detail.status}</b> · {detail.verifikasi}</div>
            <div>Sumber: <b>{detail.sumber}</b></div>
            <div className="col-span-2">Keterangan: {detail.keterangan}</div>
          </div>
          <Tabel
            kolom={[
              { judul: "Dana", tampil: (b) => <DanaBadge dana={b.dana} /> },
              { judul: "Akun", tampil: (b) => `${b.kode} ${b.akun}` },
              { judul: "Debit", kanan: true, tampil: (b) => (Number(b.debit) ? rp(b.debit) : "") },
              { judul: "Kredit", kanan: true, tampil: (b) => (Number(b.kredit) ? rp(b.kredit) : "") },
            ]}
            baris={detail.baris.filter((b) => !b.dihapus)}
          />
          {detail.penerimaan?.length > 0 && (
            <div className="mt-3 text-sm">
              <b>Donatur:</b> {detail.penerimaan[0].donatur_nama} · {detail.penerimaan[0].metode_bayar}
              {detail.penerimaan[0].jenis_zakat && ` · Zakat ${detail.penerimaan[0].jenis_zakat}`}
            </div>
          )}
          {detail.penyaluran?.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-semibold mb-1">Penerima</div>
              <Tabel
                kolom={[
                  { judul: "Penerima", tampil: (p) => p.penerima || "—" },
                  { judul: "Asnaf", kunci: "asnaf" },
                  { judul: "Jumlah penerima", kanan: true, kunci: "jmlPenerima" },
                  { judul: "Jumlah", kanan: true, tampil: (p) => rp(p.jumlah) },
                ]}
                baris={detail.penyaluran}
              />
            </div>
          )}
          {detail.status === "POSTED" && (
            <div className="mt-4 text-right">
              <Btn color="red" onClick={() => batalkan(detail)}>Batalkan (VOID)</Btn>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
