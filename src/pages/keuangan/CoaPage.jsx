import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Field, Judul, Modal, inputCls } from "./ui";

const DANA = ["ZAKAT", "INFAQ", "DSKL", "PENGELOLA", "WAKAF"];
const KELOMPOK = ["KAS_BANK", "ASET_LAIN", "KEWAJIBAN", "SALDO_DANA", "PENERIMAAN", "PENDAYAGUNAAN", "BEBAN_OPERASIONAL", "ANTAR_DANA", "BAGI_HASIL"];
const TIPE = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
const ASNAF = ["FAKIR", "MISKIN", "AMIL", "MUALAF", "RIQAB", "GHARIM", "FISABILILLAH", "IBNU_SABIL"];
const BIDANG = ["PENDIDIKAN", "SOSIAL", "KEAGAMAAN", "DAKWAH", "KEMANUSIAAN", "EKONOMI_PEMBERDAYAAN", "LINGKUNGAN", "KESEHATAN"];
const LABEL_JENIS_PENERIMAAN = { TUNAI: "Wakaf Tunai", ASET: "Wakaf Aset", TERIKAT: "Infaq Terikat", TIDAK_TERIKAT: "Infaq Tidak Terikat" };
const JENIS_PENERIMAAN = ["FITRAH", "MAAL", "PROFESI", "PERDAGANGAN", "PERTANIAN", "EMAS_PERAK", "TUNAI", "ASET", "TERIKAT", "TIDAK_TERIKAT"];

const kosong = {
  accountCode: "", accountName: "", accountType: "Expense", parentId: "", danaKode: "", kelompok: "",
  postable: true, asnaf: "", bidang: "", jenisPenerimaan: "", namaLpd: "", grupLpd: "", urutLpd: "",
};

export default function CoaPage() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ dana: "", kelompok: "", q: "", tanpaDana: false });
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  const muat = useCallback(() => {
    setLoading(true);
    keuangan.coaAll().then(setRows).catch((e) => Swal.fire("Gagal", errMsg(e), "error")).finally(() => setLoading(false));
  }, []);
  useEffect(() => { muat(); }, [muat]);

  const tampil = useMemo(() => rows.filter((r) => {
    if (f.dana && r.danaKode !== f.dana) return false;
    if (f.tanpaDana && r.danaKode) return false;
    if (f.kelompok && r.kelompok !== f.kelompok) return false;
    if (f.q && !`${r.accountCode} ${r.accountName}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  }), [rows, f]);

  const buka = (r) =>
    setForm(r ? {
      id: r.id, accountCode: r.accountCode, accountName: r.accountName, accountType: r.accountType,
      parentId: r.parentAccount?.id || "", danaKode: r.danaKode || "", kelompok: r.kelompok || "",
      postable: r.postable !== false, asnaf: r.asnaf || "", bidang: r.bidang || "", jenisPenerimaan: r.jenisPenerimaan || "",
      namaLpd: r.namaLpd || "", grupLpd: r.grupLpd || "", urutLpd: r.urutLpd ?? "",
    } : { ...kosong });

  const simpan = async (e) => {
    e.preventDefault();
    const body = {
      accountCode: form.accountCode, accountName: form.accountName, accountType: form.accountType,
      ...(form.parentId && { parentAccount: { id: Number(form.parentId) } }),
      danaKode: form.danaKode || null, kelompok: form.kelompok || null, postable: form.postable,
      asnaf: form.asnaf || null, bidang: form.bidang || null, jenisPenerimaan: form.jenisPenerimaan || null,
      namaLpd: form.namaLpd || null, grupLpd: form.grupLpd || null, urutLpd: form.urutLpd === "" ? null : Number(form.urutLpd),
    };
    try {
      if (form.id) await keuangan.coaEdit(form.id, body);
      else await keuangan.coaCreate(body);
      setForm(null);
      muat();
    } catch (err) { Swal.fire("Ditolak", errMsg(err), "error"); }
  };

  const hapus = async (r) => {
    const ok = await Swal.fire({ title: `Hapus ${r.accountCode} ${r.accountName}?`, icon: "warning", showCancelButton: true });
    if (!ok.isConfirmed) return;
    try { await keuangan.coaDelete(r.id); muat(); } catch (e) { Swal.fire("Ditolak", errMsg(e), "error"); }
  };

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const zakatPd = form && form.danaKode === "ZAKAT" && form.kelompok === "PENDAYAGUNAAN";
  const netral = rows.filter((r) => !r.danaKode && r.postable !== false).length;

  return (
    <div>
      <Judul aksi={<Btn onClick={() => buka(null)}>+ Tambah akun</Btn>}>Daftar COA</Judul>
      {netral > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded p-2 mb-3">
          {netral} akun postable belum memiliki dana (netral). Akun netral hanya boleh ada pada masa transisi.
          <button className="underline ml-2" onClick={() => setF({ ...f, tanpaDana: !f.tanpaDana })}>{f.tanpaDana ? "tampilkan semua" : "tampilkan"}</button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <select className={inputCls} value={f.dana} onChange={(e) => setF({ ...f, dana: e.target.value })}><option value="">Semua dana</option>{DANA.map((d) => <option key={d}>{d}</option>)}</select>
        <select className={inputCls} value={f.kelompok} onChange={(e) => setF({ ...f, kelompok: e.target.value })}><option value="">Semua kelompok</option>{KELOMPOK.map((d) => <option key={d}>{d}</option>)}</select>
        <input className={`${inputCls} col-span-2`} placeholder="Cari kode / nama akun" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
      </div>
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr>{["Kode", "Nama akun", "Tipe", "Dana", "Kelompok", "Postable", "Asnaf / bidang", "Nama di LPD", ""].map((h) => <th key={h} className="text-left py-2 px-3 text-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="p-6 text-center text-gray-400">Memuat…</td></tr>}
            {tampil.map((r) => (
              <tr key={r.id} className={`border-t hover:bg-gray-50 ${r.postable === false ? "bg-gray-50 text-gray-500" : ""}`}>
                <td className="py-1.5 px-3 font-mono">{r.accountCode}</td>
                <td className="px-3">{r.accountName}</td>
                <td className="px-3">{r.accountType}</td>
                <td className="px-3"><DanaBadge dana={r.danaKode} /></td>
                <td className="px-3 text-xs">{r.kelompok}</td>
                <td className="px-3">{r.postable === false ? "induk" : "ya"}</td>
                <td className="px-3 text-xs">{r.asnaf || r.bidang || ""}</td>
                <td className="px-3 text-xs">{r.namaLpd}</td>
                <td className="px-3 whitespace-nowrap">
                  <Btn color="amber" onClick={() => buka(r)}>Edit</Btn>{" "}
                  <Btn color="red" onClick={() => hapus(r)}>Hapus</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal wide title={form.id ? "Ubah akun" : "Akun baru"} onClose={() => setForm(null)}>
          <form onSubmit={simpan} className="grid md:grid-cols-2 gap-3">
            <Field label="Kode akun"><input required className={inputCls} value={form.accountCode} onChange={(e) => set("accountCode", e.target.value)} /></Field>
            <Field label="Tipe akun"><select className={inputCls} value={form.accountType} onChange={(e) => set("accountType", e.target.value)}>{TIPE.map((t) => <option key={t}>{t}</option>)}</select></Field>
            <div className="md:col-span-2"><Field label="Nama akun"><input required className={inputCls} value={form.accountName} onChange={(e) => set("accountName", e.target.value)} /></Field></div>
            <Field label="Akun induk (opsional)">
              <select className={inputCls} value={form.parentId} onChange={(e) => set("parentId", e.target.value)}>
                <option value="">—</option>
                {rows.filter((r) => r.postable === false || !r.parentAccount).map((r) => <option key={r.id} value={r.id}>{r.accountCode} {r.accountName}</option>)}
              </select>
            </Field>
            <Field label="Dana" hint="Menentukan buku/ruang tempat akun ini tampil">
              <select className={inputCls} value={form.danaKode} onChange={(e) => set("danaKode", e.target.value)}><option value="">(otomatis dari kode)</option>{DANA.map((d) => <option key={d}>{d}</option>)}</select>
            </Field>
            <Field label="Kelompok laporan">
              <select className={inputCls} value={form.kelompok} onChange={(e) => set("kelompok", e.target.value)}><option value="">(otomatis dari tipe)</option>{KELOMPOK.map((d) => <option key={d}>{d}</option>)}</select>
            </Field>
            <Field label="Dapat diposting"><label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={form.postable} onChange={(e) => set("postable", e.target.checked)} /> Akun transaksi (bukan akun induk)</label></Field>
            {zakatPd && (
              <Field label="Asnaf (wajib untuk pendayagunaan Zakat)">
                <select required className={inputCls} value={form.asnaf} onChange={(e) => set("asnaf", e.target.value)}><option value="">—</option>{ASNAF.map((d) => <option key={d}>{d}</option>)}</select>
              </Field>
            )}
            {form.kelompok === "PENDAYAGUNAAN" && !zakatPd && (
              <Field label="Bidang program">
                <select className={inputCls} value={form.bidang} onChange={(e) => set("bidang", e.target.value)}><option value="">—</option>{BIDANG.map((d) => <option key={d}>{d}</option>)}</select>
              </Field>
            )}
            {form.kelompok === "PENERIMAAN" && (
              <Field label="Jenis penerimaan (untuk aplikasi mobile)">
                <select className={inputCls} value={form.jenisPenerimaan} onChange={(e) => set("jenisPenerimaan", e.target.value)}><option value="">—</option>{JENIS_PENERIMAAN.map((d) => <option key={d} value={d}>{LABEL_JENIS_PENERIMAAN[d] || d}</option>)}</select>
              </Field>
            )}
            <Field label="Nama pendek di LPD" hint="Tanpa awalan ‘Pendayagunaan Dana …’"><input className={inputCls} value={form.namaLpd} onChange={(e) => set("namaLpd", e.target.value)} /></Field>
            <Field label="Grup di LPD" hint="mis. 1. Khidmah Bidang Dakwah"><input className={inputCls} value={form.grupLpd} onChange={(e) => set("grupLpd", e.target.value)} /></Field>
            <Field label="Urutan di LPD"><input type="number" className={inputCls} value={form.urutLpd} onChange={(e) => set("urutLpd", e.target.value)} /></Field>
            <div className="md:col-span-2"><Btn color="green" type="submit" className="w-full">Simpan</Btn></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
