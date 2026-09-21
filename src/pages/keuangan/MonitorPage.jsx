import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Field, Judul, Tabel, inputCls, rp } from "./ui";

const TAB = [
  ["ringkas", "Sinkron Mobile"],
  ["kontaminasi", "Kontaminasi Dana"],
  ["timpang", "Jurnal Timpang"],
  ["netral", "Akun Netral"],
  ["pelanggaran", "Pelanggaran"],
  ["audit", "Audit"],
  ["pengaturan", "Pengaturan"],
];

export default function MonitorPage() {
  const [tab, setTab] = useState("ringkas");
  const [data, setData] = useState(null);
  const [konfig, setKonfig] = useState([]);
  const [alokasi, setAlokasi] = useState([]);
  const [al, setAl] = useState({ dana: "ZAKAT", jenis: "", persen: "12.5", berlakuSejak: "" });

  const muat = useCallback(async () => {
    try {
      setData(null);
      if (tab === "ringkas") setData({ ...(await keuangan.versi()), mobile: await keuangan.versiMobile() });
      else if (tab === "kontaminasi") setData(await keuangan.kontaminasi());
      else if (tab === "timpang") setData(await keuangan.timpang());
      else if (tab === "netral") setData(await keuangan.netral());
      else if (tab === "pelanggaran") setData(await keuangan.pelanggaran());
      else if (tab === "audit") setData(await keuangan.audit());
      else if (tab === "pengaturan") { setKonfig(await keuangan.konfigurasi()); setAlokasi(await keuangan.alokasi()); setData([]); }
    } catch (e) { Swal.fire("Gagal", errMsg(e), "error"); }
  }, [tab]);
  useEffect(() => { muat(); }, [muat]);

  const ubahKonfig = async (kunci, nilai) => {
    try { await keuangan.konfigurasiUbah(kunci, nilai); Swal.fire("Tersimpan", "", "success"); muat(); }
    catch (e) { Swal.fire("Ditolak", errMsg(e), "error"); }
  };
  const simpanAlokasi = async () => {
    try { await keuangan.alokasiSimpan({ ...al, persen: Number(al.persen), berlakuSejak: al.berlakuSejak || undefined }); muat(); }
    catch (e) { Swal.fire("Ditolak", errMsg(e), "error"); }
  };

  return (
    <div>
      <Judul aksi={<Btn color="gray" onClick={muat}>Muat ulang</Btn>}>Monitor & Pengaturan</Judul>
      <div className="flex flex-wrap gap-1 mb-4">
        {TAB.map(([id, nama]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-3 py-1.5 rounded-lg text-sm ${tab === id ? "bg-slate-800 text-white" : "bg-white border hover:bg-gray-50"}`}>{nama}</button>
        ))}
      </div>

      {tab === "ringkas" && data && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white shadow rounded p-4">
            <h3 className="font-semibold mb-2">Versi data per ruang</h3>
            <p className="text-xs text-gray-500 mb-2">Naik setiap ada perubahan; aplikasi mobile memuat ulang layar ruang yang versinya berubah.</p>
            <Tabel kolom={[{ judul: "Ruang", kunci: "ruang" }, { judul: "Versi", kanan: true, kunci: "versi" }, { judul: "Terakhir berubah", tampil: (r) => String(r.diubahAt).replace("T", " ").slice(0, 19) }]} baris={data.perubahanTerakhir.map((r) => ({ ...r, id: r.ruang }))} />
          </div>
          <div className="bg-white shadow rounded p-4">
            <h3 className="font-semibold mb-2">Yang diterima aplikasi saat ini</h3>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(data.mobile, null, 2)}</pre>
          </div>
        </div>
      )}

      {tab === "kontaminasi" && data && (
        <>
          <p className="text-sm text-gray-500 mb-2">Baris jurnal yang dananya berbeda dari dana akun. Selesaikan dengan jurnal <b>Transfer Antar Dana</b>; targetnya nol.</p>
          <Tabel kolom={[{ judul: "No. bukti", kunci: "nomorBukti" }, { judul: "Tanggal", tampil: (r) => String(r.tanggal).slice(0, 10) }, { judul: "Jenis", kunci: "jenis" }, { judul: "Dana baris", tampil: (r) => <DanaBadge dana={r.danaBaris} /> }, { judul: "Dana akun", tampil: (r) => <DanaBadge dana={r.danaAkun} /> }, { judul: "Akun", tampil: (r) => `${r.kodeAkun} ${r.namaAkun}` }, { judul: "Nilai", kanan: true, tampil: (r) => rp(Number(r.debit) || Number(r.kredit)) }]} baris={data} kosong="Tidak ada kebocoran antar-dana 🎉" />
        </>
      )}
      {tab === "timpang" && data && <Tabel kolom={[{ judul: "No. bukti", kunci: "nomorBukti" }, { judul: "Dana", tampil: (r) => <DanaBadge dana={r.dana} /> }, { judul: "Debit", kanan: true, tampil: (r) => rp(r.debit) }, { judul: "Kredit", kanan: true, tampil: (r) => rp(r.kredit) }]} baris={data} kosong="Semua jurnal seimbang di setiap dana" />}
      {tab === "netral" && data && (
        <>
          <p className="text-sm text-gray-500 mb-2">Akun yang belum punya dana tetapi masih dipakai transaksi. Pecah per dana (mis. Kas Kecil), lalu reklasifikasi.</p>
          <Tabel kolom={[{ judul: "Akun", tampil: (r) => `${r.kode} ${r.nama}` }, { judul: "Jurnal", kanan: true, kunci: "jurnal" }, { judul: "Debit", kanan: true, tampil: (r) => rp(r.debit) }, { judul: "Kredit", kanan: true, tampil: (r) => rp(r.kredit) }]} baris={data} kosong="Tidak ada akun netral terpakai" />
        </>
      )}
      {tab === "pelanggaran" && data && <Tabel kolom={[{ judul: "Waktu", tampil: (r) => String(r.waktu).replace("T", " ").slice(0, 19) }, { judul: "No. bukti", kunci: "nomorBukti" }, { judul: "Detail", tampil: (r) => <code className="text-xs">{typeof r.detail === "string" ? r.detail : JSON.stringify(r.detail)}</code> }]} baris={data} kosong="Belum ada pelanggaran tercatat (mode PANTAU)" />}
      {tab === "audit" && data && <Tabel kolom={[{ judul: "Waktu", tampil: (r) => String(r.waktu).replace("T", " ").slice(0, 19) }, { judul: "Aksi", kunci: "aksi" }, { judul: "Entitas", tampil: (r) => `${r.entitas} ${r.entitasId ?? ""}` }, { judul: "Pengguna", kunci: "pengguna" }, { judul: "Detail", tampil: (r) => <code className="text-xs">{typeof r.detail === "string" ? r.detail : JSON.stringify(r.detail)}</code> }]} baris={data} />}

      {tab === "pengaturan" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white shadow rounded p-4 space-y-3">
            <h3 className="font-semibold">Konfigurasi akuntansi</h3>
            {konfig.map((k) => (
              <div key={k.kunci}>
                <Field label={k.kunci} hint={k.keterangan}>
                  {k.kunci === "mode_penegakan" ? (
                    <select className={inputCls} value={k.nilai} onChange={(e) => ubahKonfig(k.kunci, e.target.value)}>
                      <option>PANTAU</option><option>TEGAS</option>
                    </select>
                  ) : (
                    <input type="date" className={inputCls} defaultValue={k.nilai} onBlur={(e) => e.target.value !== k.nilai && ubahKonfig(k.kunci, e.target.value)} />
                  )}
                </Field>
              </div>
            ))}
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">Tanggal cut-over adalah tanggal efektif saldo awal (D-1). Mengubahnya langsung mengubah saldo berantai di seluruh laporan dan aplikasi.</p>
          </div>
          <div className="bg-white shadow rounded p-4 space-y-3">
            <h3 className="font-semibold">Kebijakan hak amil (alokasi otomatis)</h3>
            <Tabel kolom={[{ judul: "Dana", tampil: (r) => <DanaBadge dana={r.dana} /> }, { judul: "Jenis", tampil: (r) => r.jenis || "semua" }, { judul: "Persen", kanan: true, kunci: "persen" }, { judul: "Berlaku sejak", tampil: (r) => String(r.berlakuSejak).slice(0, 10) }, { judul: "Aktif", tampil: (r) => (r.aktif ? "ya" : "tidak") }]} baris={alokasi} kosong="Belum ada kebijakan; penerimaan dicatat bruto tanpa alokasi amil" />
            <div className="grid grid-cols-4 gap-2">
              <select className={inputCls} value={al.dana} onChange={(e) => setAl({ ...al, dana: e.target.value })}>{["ZAKAT", "INFAQ", "DSKL", "WAKAF"].map((d) => <option key={d}>{d}</option>)}</select>
              <input className={inputCls} placeholder="jenis (opsional)" value={al.jenis} onChange={(e) => setAl({ ...al, jenis: e.target.value })} />
              <input className={inputCls} placeholder="%" value={al.persen} onChange={(e) => setAl({ ...al, persen: e.target.value })} />
              <input type="date" className={inputCls} value={al.berlakuSejak} onChange={(e) => setAl({ ...al, berlakuSejak: e.target.value })} />
            </div>
            <Btn onClick={simpanAlokasi}>Tambah kebijakan</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
