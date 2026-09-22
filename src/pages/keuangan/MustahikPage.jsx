import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Field, Judul, Modal, Tabel, inputCls } from "./ui";

const ASNAF = ["FAKIR", "MISKIN", "AMIL", "MUALAF", "RIQAB", "GHARIM", "FISABILILLAH", "IBNU_SABIL"];

/**
 * Dua jenis penerima disimpan di tabel yang sama, dibedakan lewat `jenisPenerima`:
 *  - MUSTAHIK     : penerima Zakat/Infaq/DSKL, memakai asnaf.
 *  - MAUQUF_ALAIH : penerima manfaat wakaf (perorangan/lembaga), tanpa asnaf, ada peruntukan.
 */
const JENIS = {
  MUSTAHIK: { label: "Mustahik", judul: "Mustahik (Penerima Zakat, Infaq & DSKL)", tombol: "+ Mustahik" },
  MAUQUF_ALAIH: { label: "Mauquf 'Alaih", judul: "Mauquf 'Alaih (Penerima Manfaat Wakaf)", tombol: "+ Mauquf 'Alaih" },
};

const kosong = (jenisPenerima) => ({
  nama: "", jenisPenerima, tipePenerima: jenisPenerima === "MAUQUF_ALAIH" ? "LEMBAGA" : "PERORANGAN",
  nik: "", alamat: "", telepon: "", asnaf: "", peruntukan: "", samarkan: false, terverifikasi: false,
});

export default function MustahikPage() {
  const [jenis, setJenis] = useState("MUSTAHIK");
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [asnaf, setAsnaf] = useState("");
  const [form, setForm] = useState(null);
  const mauquf = jenis === "MAUQUF_ALAIH";

  const muat = useCallback(
    () => keuangan.mustahik({ q, asnaf: mauquf ? "" : asnaf, jenis }).then(setRows).catch((e) => Swal.fire("Gagal", errMsg(e), "error")),
    [q, asnaf, jenis, mauquf],
  );
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

  const edit = (m) => setForm({
    ...m, jenisPenerima: m.jenisPenerima || "MUSTAHIK", samarkan: !!m.samarkan, terverifikasi: !!m.terverifikasi,
  });

  const aksi = {
    judul: "Aksi", tampil: (m) => (
      <div className="flex gap-1">
        <Btn color="amber" onClick={() => edit(m)}>Edit</Btn>
        <Btn color="red" onClick={() => hapus(m)}>Hapus</Btn>
      </div>
    ),
  };
  const kolom = mauquf
    ? [
      { judul: "Nama", kunci: "nama" },
      { judul: "Tipe", tampil: (m) => (m.tipePenerima === "LEMBAGA" ? "Lembaga" : m.tipePenerima === "PERORANGAN" ? "Perorangan" : "—") },
      { judul: "Peruntukan", kunci: "peruntukan" },
      { judul: "Alamat", kunci: "alamat" },
      { judul: "Telepon", kunci: "telepon" },
      { judul: "Verifikasi", tampil: (m) => (m.terverifikasi ? "✔" : "—") },
      aksi,
    ]
    : [
      { judul: "Nama", kunci: "nama" },
      { judul: "Asnaf", kunci: "asnaf" },
      { judul: "Alamat", kunci: "alamat" },
      { judul: "Telepon", kunci: "telepon" },
      { judul: "Verifikasi", tampil: (m) => (m.terverifikasi ? "✔" : "—") },
      { judul: "Samarkan", tampil: (m) => (m.samarkan ? "ya" : "") },
      aksi,
    ];

  const formMauquf = form?.jenisPenerima === "MAUQUF_ALAIH";

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {Object.entries(JENIS).map(([k, v]) => (
          <button key={k} onClick={() => { setJenis(k); setAsnaf(""); }}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${jenis === k ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-blue-50"}`}>
            {v.label}
          </button>
        ))}
      </div>
      <Judul aksi={<Btn onClick={() => setForm(kosong(jenis))}>{JENIS[jenis].tombol}</Btn>}>{JENIS[jenis].judul}</Judul>
      {mauquf && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded p-2 mb-3">
          Mauquf &apos;alaih adalah pihak yang menerima manfaat harta wakaf (perorangan atau lembaga, mis. masjid, sekolah).
          Hanya penerima di tab ini yang dapat dipilih saat input penyaluran dana Wakaf.
        </div>
      )}
      <div className="flex gap-2 mb-3">
        <input className={inputCls} placeholder="Cari nama…" value={q} onChange={(e) => setQ(e.target.value)} />
        {!mauquf && (
          <select className={`${inputCls} w-56`} value={asnaf} onChange={(e) => setAsnaf(e.target.value)}>
            <option value="">Semua asnaf</option>
            {ASNAF.map((a) => <option key={a}>{a}</option>)}
          </select>
        )}
      </div>
      <Tabel kolom={kolom} baris={rows} />
      {form && (
        <Modal
          title={`${form.id ? "Ubah" : "Tambah"} ${JENIS[form.jenisPenerima].label.toLowerCase()}`}
          onClose={() => setForm(null)}
        >
          <form onSubmit={simpan} className="space-y-3">
            <Field label="Nama"><input required className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} /></Field>
            <Field label="Tipe penerima">
              <select className={inputCls} value={form.tipePenerima || ""} onChange={(e) => setForm({ ...form, tipePenerima: e.target.value })}>
                <option value="PERORANGAN">Perorangan</option>
                <option value="LEMBAGA">Lembaga</option>
              </select>
            </Field>
            {formMauquf ? (
              <Field label="Peruntukan" hint="Manfaat wakaf untuk apa, mis. operasional masjid, beasiswa, layanan kesehatan">
                <input className={inputCls} value={form.peruntukan || ""} onChange={(e) => setForm({ ...form, peruntukan: e.target.value })} />
              </Field>
            ) : (
              <Field label="Asnaf">
                <select className={inputCls} value={form.asnaf || ""} onChange={(e) => setForm({ ...form, asnaf: e.target.value })}>
                  <option value="">—</option>
                  {ASNAF.map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
            )}
            <Field label={form.tipePenerima === "LEMBAGA" ? "NIK / No. registrasi lembaga" : "NIK"} hint="Disimpan apa adanya; batasi akses BO ke petugas berwenang"><input className={inputCls} value={form.nik || ""} onChange={(e) => setForm({ ...form, nik: e.target.value })} /></Field>
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
