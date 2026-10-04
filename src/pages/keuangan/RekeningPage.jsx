import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Field, Judul, Modal, SearchSelect, Tabel, inputCls, num, rp } from "./ui";

const RUANG = [
  { id: "ZAKAT", nama: "Ruang Zakat" },
  { id: "UMUM", nama: "Ruang Umum (Infaq & DSKL)" },
  { id: "WAKAF", nama: "Ruang Wakaf" },
];

const DANA_POKOK = ["ZAKAT", "INFAQ_SHODAQOH", "DSKL", "AMIL", "MPZIS"];
const REKENING_KOSONG = { coaId: "", kodeBank: "", namaBank: "", noRek: "", isKas: false, danaPokok: "ZAKAT" };

export default function RekeningPage() {
  const [ruang, setRuang] = useState("ZAKAT");
  const [h, setH] = useState(null);
  const [master, setMaster] = useState([]);
  const [coa, setCoa] = useState([]);
  const [edit, setEdit] = useState({});
  const [form, setForm] = useState(null);

  const muat = useCallback(() => {
    keuangan.harian(ruang).then(setH).catch((e) => Swal.fire("Gagal", errMsg(e), "error"));
    keuangan.rekening().then(setMaster).catch(() => {});
    keuangan.coaAll().then(setCoa).catch(() => {});
  }, [ruang]);
  useEffect(() => { muat(); }, [muat]);

  const akunBelumTerdaftar = coa.filter((c) => c.kelompok === "KAS_BANK" && !master.some((m) => String(m.coaId) === String(c.id)));

  const bukaTambah = () => setForm({ ...REKENING_KOSONG, coaId: akunBelumTerdaftar[0]?.id || "" });
  const bukaEdit = (m) => setForm({
    coaId: m.coaId, kodeBank: m.kodeBank, namaBank: m.namaBank, noRek: m.noRek || "",
    isKas: !!m.kas, danaPokok: m.danaPokok, editId: m.coaId,
  });

  const simpanRekening = async (e) => {
    e.preventDefault();
    try {
      if (form.editId) await keuangan.rekeningUbah(form.editId, form);
      else await keuangan.rekeningBaru(form);
      setForm(null);
      muat();
    } catch (err) { Swal.fire("Ditolak", errMsg(err), "error"); }
  };

  const simpanSaldo = async (id) => {
    const v = edit[id];
    if (v === undefined || v === "") return;
    try {
      const r = await keuangan.saldoBank(ruang, id, parseInt(String(v).replace(/\D/g, ""), 10) || 0);
      setH(r);
      setEdit((s) => ({ ...s, [id]: undefined }));
    } catch (e) { Swal.fire("Ditolak", errMsg(e), "error"); }
  };

  const totalBank = h ? h.bankAccounts.reduce((s, b) => s + b.balance, 0) : 0;
  const totalDana = h ? h.fundPockets.reduce((s, p) => s + p.amount, 0) : 0;

  return (
    <div>
      <Judul aksi={
        <select className={inputCls} value={ruang} onChange={(e) => setRuang(e.target.value)}>
          {RUANG.map((r) => <option key={r.id} value={r.id}>{r.nama}</option>)}
        </select>
      }>Rekening & Rekonsiliasi Harian</Judul>
      <div className="bg-blue-50 border border-blue-200 text-blue-900 text-sm rounded-lg p-3 mb-4 space-y-1">
        <div className="font-semibold">Untuk apa halaman ini?</div>
        <p>
          Mencocokkan <b>uang yang tercatat di sistem</b> dengan <b>uang yang sebenarnya ada di rekening bank/kas</b>, sehingga
          kesalahan pencatatan cepat ketahuan. Hasilnya juga tampil di Laporan Harian pada aplikasi mobile.
        </p>
        <ol className="list-decimal ml-5">
          <li><b>Langkah 1 — Saldo bank:</b> isi saldo riil tiap rekening dari mutasi/m-banking. Bila belum diisi, dipakai saldo buku besar.</li>
          <li><b>Langkah 2 — Sumber dana:</b> saldo tiap dana (Zakat, Infaq, DSKL, Pengelola) dihitung otomatis dari jurnal; tidak diinput manual.</li>
          <li><b>Selisih</b> berarti total rekening tidak sama dengan saldo dana, mis. uang satu dana tercatat di rekening dana lain atau ada transaksi yang belum dijurnal.</li>
          <li><b>Master rekening:</b> daftar rekening bank/kas yang dipakai sebagai sumber kas pada Input Jurnal.</li>
        </ol>
      </div>
      {h && (
        <>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white shadow rounded p-3"><div className="text-xs text-gray-500">Total saldo bank/kas</div><div className="text-xl font-bold">{rp(totalBank)}</div></div>
            <div className="bg-white shadow rounded p-3"><div className="text-xs text-gray-500">Total saldo dana (buku besar)</div><div className="text-xl font-bold">{rp(totalDana)}</div></div>
            <div className={`shadow rounded p-3 ${totalBank === totalDana ? "bg-green-50" : "bg-red-50"}`}>
              <div className="text-xs text-gray-500">Selisih</div>
              <div className={`text-xl font-bold ${totalBank === totalDana ? "text-green-700" : "text-red-600"}`}>{totalBank === totalDana ? "Seimbang" : rp(totalBank - totalDana)}</div>
            </div>
          </div>
          <h2 className="font-semibold mb-2">Langkah 1 — Saldo bank per rekening</h2>
          <Tabel
            kolom={[
              { judul: "Rekening", tampil: (b) => `${b.bankName} ${b.accountNumberMasked}` },
              { judul: "Dana", tampil: (b) => <DanaBadge dana={b.danaPokok === "INFAQ_SHODAQOH" ? "INFAQ" : b.danaPokok === "AMIL" ? "PENGELOLA" : b.danaPokok} /> },
              { judul: "Saldo", kanan: true, tampil: (b) => rp(b.balance) },
              { judul: "Perbarui (dari mutasi)", tampil: (b) => {
                const id = b.id.replace("bank-", "");
                return (
                  <div className="flex gap-1">
                    <input className={`${inputCls} w-40 text-right`} inputMode="numeric" placeholder="saldo baru"
                      value={edit[id] === undefined ? "" : num(String(edit[id]).replace(/\D/g, ""))}
                      onChange={(e) => setEdit((s) => ({ ...s, [id]: e.target.value }))} />
                    <Btn color="blue" disabled={edit[id] === undefined || edit[id] === ""} onClick={() => simpanSaldo(id)}>Simpan</Btn>
                  </div>
                );
              } },
            ]}
            baris={h.bankAccounts}
          />
          <h2 className="font-semibold mt-5 mb-2">Langkah 2 — Sumber dana (dihitung)</h2>
          <Tabel
            kolom={[
              { judul: "Dana pokok", kunci: "danaPokok" },
              { judul: "Saldo dana", kanan: true, tampil: (p) => rp(p.amount) },
              { judul: "Status", tampil: (p) => (p.matchesBank ? <span className="text-green-700">sama dengan rekening ✔</span> : <span className="text-red-600 text-xs">{p.note}</span>) },
            ]}
            baris={h.fundPockets.map((p, i) => ({ ...p, id: i }))}
          />
          <h2 className="font-semibold mt-5 mb-2 flex items-center justify-between">
            Master rekening (sumber kas)
            <Btn onClick={bukaTambah} disabled={!akunBelumTerdaftar.length}>+ Tambah rekening</Btn>
          </h2>
          {!akunBelumTerdaftar.length && (
            <p className="text-xs text-gray-400 mb-2">
              Semua akun berkelompok KAS_BANK sudah terdaftar. Buat dulu akun barunya di Daftar Akun (COA) bila perlu rekening baru.
            </p>
          )}
          <Tabel
            kolom={[
              { judul: "Kode", kunci: "kode" },
              { judul: "Akun", kunci: "namaAkun" },
              { judul: "Bank", tampil: (m) => `${m.kodeBank} · ${m.namaBank}` },
              { judul: "No. (tersamar)", kunci: "noRek" },
              { judul: "Dana", tampil: (m) => <DanaBadge dana={m.dana} /> },
              { judul: "Kas", tampil: (m) => (m.kas ? "ya" : "") },
              { judul: "Status", tampil: (m) => (m.aktif ? "aktif" : "nonaktif") },
              { judul: "", tampil: (m) => <Btn color="amber" onClick={() => bukaEdit(m)}>Edit</Btn> },
            ]}
            baris={master.map((m) => ({ ...m, id: m.coaId }))}
          />
        </>
      )}
      {form && (
        <Modal title={form.editId ? "Ubah rekening" : "Tambah rekening baru"} onClose={() => setForm(null)}>
          <form onSubmit={simpanRekening} className="space-y-3">
            <Field label="Akun COA (kelompok KAS_BANK)">
              {form.editId ? (
                <input className={inputCls} disabled value={coa.find((c) => String(c.id) === String(form.coaId))?.accountName || ""} />
              ) : (
                <SearchSelect
                  value={form.coaId}
                  onChange={(v) => setForm({ ...form, coaId: v })}
                  options={akunBelumTerdaftar.map((c) => ({ value: c.id, label: `${c.accountCode} ${c.accountName}` }))}
                  placeholder="Cari akun kas/bank…"
                />
              )}
            </Field>
            <Field label="Kode bank" hint="Kode singkat, sama dengan yang dipakai aplikasi mobile (mis. BSI, MDR)">
              <input required className={inputCls} value={form.kodeBank} onChange={(e) => setForm({ ...form, kodeBank: e.target.value })} />
            </Field>
            <Field label="Nama bank / rekening">
              <input required className={inputCls} value={form.namaBank} onChange={(e) => setForm({ ...form, namaBank: e.target.value })} />
            </Field>
            <Field label="No. rekening (tersamar)"><input className={inputCls} value={form.noRek} onChange={(e) => setForm({ ...form, noRek: e.target.value })} /></Field>
            <Field label="Dana pokok">
              <select className={inputCls} value={form.danaPokok} onChange={(e) => setForm({ ...form, danaPokok: e.target.value })}>
                {DANA_POKOK.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isKas} onChange={(e) => setForm({ ...form, isKas: e.target.checked })} /> Kas tunai (bukan rekening bank)</label>
            <Btn className="w-full" color="green" type="submit" disabled={!form.coaId}>Simpan</Btn>
          </form>
        </Modal>
      )}
    </div>
  );
}
