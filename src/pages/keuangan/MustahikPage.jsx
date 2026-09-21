import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Field, Judul, Modal, Tabel, inputCls } from "./ui";

const ASNAF = ["FAKIR", "MISKIN", "AMIL", "MUALAF", "RIQAB", "GHARIM", "FISABILILLAH", "IBNU_SABIL"];
const kosong = { nama: "", nik: "", alamat: "", telepon: "", asnaf: "", samarkan: false, terverifikasi: false };

export default function MustahikPage() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [asnaf, setAsnaf] = useState("");
  const [form, setForm] = useState(null);

  const muat = useCallback(() => keuangan.mustahik({ q, asnaf }).then(setRows).catch((e) => Swal.fire("Gagal", errMsg(e), "error")), [q, asnaf]);
  useEffect(() => { muat(); }, [muat]);

  const simpan = async (e) => {
    e.preventDefault();
    try {
      if (form.id) await keuangan.mustahikUbah(form.id, form);
      else await keuangan.mustahikBaru(form);
      setForm(null);
      muat();
    } catch (err) { Swal.fire("Ditolak", errMsg(err), "error"); }
  };

  const hapus = async (m) => {
    const ok = await Swal.fire({ title: `Hapus ${m.nama}?`, icon: "warning", showCancelButton: true });
    if (ok.isConfirmed) { await keuangan.mustahikHapus(m.id); muat(); }
  };

  return (
    <div>
      <Judul aksi={<Btn onClick={() => setForm({ ...kosong })}>+ Mustahik</Btn>}>Mustahik (Penerima Manfaat)</Judul>
      <div className="flex gap-2 mb-3">
        <input className={inputCls} placeholder="Cari nama…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={`${inputCls} w-56`} value={asnaf} onChange={(e) => setAsnaf(e.target.value)}>
          <option value="">Semua asnaf</option>
          {ASNAF.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>
      <Tabel
        kolom={[
          { judul: "Nama", kunci: "nama" },
          { judul: "Asnaf", kunci: "asnaf" },
          { judul: "Alamat", kunci: "alamat" },
          { judul: "Telepon", kunci: "telepon" },
          { judul: "Verifikasi", tampil: (m) => (m.terverifikasi ? "✔" : "—") },
          { judul: "Samarkan", tampil: (m) => (m.samarkan ? "ya" : "") },
          { judul: "Aksi", tampil: (m) => (
            <div className="flex gap-1">
              <Btn color="amber" onClick={() => setForm({ ...m, samarkan: !!m.samarkan, terverifikasi: !!m.terverifikasi })}>Edit</Btn>
              <Btn color="red" onClick={() => hapus(m)}>Hapus</Btn>
            </div>
          ) },
        ]}
        baris={rows}
      />
      {form && (
        <Modal title={form.id ? "Ubah mustahik" : "Mustahik baru"} onClose={() => setForm(null)}>
          <form onSubmit={simpan} className="space-y-3">
            <Field label="Nama"><input required className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></Field>
            <Field label="Asnaf">
              <select className={inputCls} value={form.asnaf || ""} onChange={(e) => setForm({ ...form, asnaf: e.target.value })}>
                <option value="">—</option>
                {ASNAF.map((a) => <option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="NIK" hint="Disimpan apa adanya; batasi akses BO ke petugas berwenang"><input className={inputCls} value={form.nik || ""} onChange={(e) => setForm({ ...form, nik: e.target.value })} /></Field>
            <Field label="Alamat"><input className={inputCls} value={form.alamat || ""} onChange={(e) => setForm({ ...form, alamat: e.target.value })} /></Field>
            <Field label="Telepon"><input className={inputCls} value={form.telepon || ""} onChange={(e) => setForm({ ...form, telepon: e.target.value })} /></Field>
            <div className="flex gap-5 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.terverifikasi} onChange={(e) => setForm({ ...form, terverifikasi: e.target.checked })} /> Terverifikasi</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.samarkan} onChange={(e) => setForm({ ...form, samarkan: e.target.checked })} /> Samarkan di aplikasi</label>
            </div>
            <Btn className="w-full" color="green" type="submit">Simpan</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
