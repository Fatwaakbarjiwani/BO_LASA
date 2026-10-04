import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Field, Judul, Tabel, inputCls, rp } from "./ui";

/**
 * Pilihan jenis per dana untuk kebijakan hak amil — kodenya sama dengan yang disimpan Input Jurnal, jadi kebijakan
 * pasti terbaca sistem. Zakat dari master jenis zakat (dinamis); DSKL tidak punya jenis.
 */
const DANA_KEBIJAKAN = [["ZAKAT", "Zakat"], ["INFAQ", "Infaq/Shodaqoh"], ["DSKL", "DSKL"], ["WAKAF", "Wakaf"]];
const opsiJenisDana = (ref, dana) =>
  dana === "ZAKAT" ? ref.zakat.filter((j) => Number(j.aktif ?? 1))
    : dana === "INFAQ" ? ref.infaq
      : dana === "WAKAF" ? ref.wakaf
        : [];

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
  const [data, setDataTab] = useState(null);
  const setData = setDataTab;
  const [konfig, setKonfig] = useState([]);
  const [alokasi, setAlokasi] = useState([]);
  const KOSONG_AL = { dana: "ZAKAT", jenis: "", persen: "12.5", berlakuSejak: "", aktif: true };
  const [al, setAl] = useState(KOSONG_AL);
  const [editId, setEditId] = useState(null); // id kebijakan yang sedang diedit; null = tambah baru
  const [aktifAwal, setAktifAwal] = useState(true); // status tersimpan saat mulai edit, untuk mendeteksi perubahan status
  const [refJenis, setRefJenis] = useState({ zakat: [], infaq: [], wakaf: [] });

  const tabAktif = useRef(tab);
  tabAktif.current = tab;
  const muat = useCallback(async () => {
    // Respons tab lama yang datang terlambat diabaikan agar tidak dirender di tab lain.
    const setData = (v) => { if (tabAktif.current === tab) setDataTab(v); };
    try {
      setDataTab(null);
      if (tab === "ringkas") setData({ ...(await keuangan.versi()), mobile: await keuangan.versiMobile() });
      else if (tab === "kontaminasi") setData(await keuangan.kontaminasi());
      else if (tab === "timpang") setData(await keuangan.timpang());
      else if (tab === "netral") setData(await keuangan.netral());
      else if (tab === "pelanggaran") setData(await keuangan.pelanggaran());
      else if (tab === "audit") setData(await keuangan.audit());
      else if (tab === "pengaturan") {
        setKonfig(await keuangan.konfigurasi());
        const [daftar, meta, zakat] = await Promise.all([keuangan.alokasi(), keuangan.meta(), keuangan.jenisZakat(true)]);
        setRefJenis({ zakat, infaq: meta.jenisInfaq || [], wakaf: meta.jenisWakaf || [] });
        setAlokasi(daftar);
        setData([]);
      }
    } catch (e) { Swal.fire("Gagal", errMsg(e), "error"); }
  }, [tab]);
  useEffect(() => { muat(); }, [muat]);

  const ubahKonfig = async (kunci, nilai) => {
    try { await keuangan.konfigurasiUbah(kunci, nilai); Swal.fire("Tersimpan", "", "success"); muat(); }
    catch (e) { Swal.fire("Ditolak", errMsg(e), "error"); }
  };
  // Semua perubahan (termasuk status aktif/nonaktif) baru dikirim saat tombol Simpan ditekan.
  const simpanAlokasi = async () => {
    const isi = al;
    const body = { ...isi, jenis: isi.jenis || null, persen: Number(isi.persen), berlakuSejak: isi.berlakuSejak || undefined };
    try {
      if (editId) {
        const ubahStatus = isi.aktif !== aktifAwal;
        const k = await Swal.fire({
          icon: ubahStatus && !isi.aktif ? "warning" : "question",
          title: ubahStatus ? (isi.aktif ? "Aktifkan kebijakan ini?" : "Nonaktifkan kebijakan ini?") : "Simpan perubahan kebijakan?",
          text: ubahStatus && !isi.aktif
            ? "Penerimaan yang disimpan atau diedit sesudah ini tidak lagi dipotong dengan kebijakan ini. Jurnal alokasi yang sudah tercatat tidak berubah."
            : "Berlaku untuk penerimaan yang disimpan atau diedit sesudah ini. Jurnal alokasi yang sudah tercatat tidak dihitung ulang.",
          showCancelButton: true, confirmButtonText: "Simpan", cancelButtonText: "Batal",
        });
        if (!k.isConfirmed) return;
        await keuangan.alokasiUbah(editId, body);
      } else {
        await keuangan.alokasiSimpan(body);
      }
      Swal.fire("Tersimpan", "", "success");
      setEditId(null);
      setAl(KOSONG_AL);
      muat();
    } catch (e) { Swal.fire("Ditolak", errMsg(e), "error"); }
  };
  const mulaiEditAlokasi = (r) => {
    const kode = r.jenis ? String(r.jenis).toUpperCase() : "";
    // Jenis lama hasil ketik manual yang tidak dikenal tidak bisa dipilih di dropdown: kosongkan dan minta dipilih ulang.
    const dikenal = !kode || opsiJenisDana(refJenis, r.dana).some((j) => String(j.kode).toUpperCase() === kode);
    if (!dikenal) {
      Swal.fire("Jenis perlu dipilih ulang", `Jenis "${r.jenis}" pada kebijakan ini tidak dikenal sistem. Pilih jenis yang benar dari daftar sebelum menyimpan.`, "info");
    }
    setEditId(r.id);
    setAktifAwal(!!Number(r.aktif));
    setAl({
      dana: r.dana, jenis: dikenal ? kode : "", persen: String(r.persen),
      berlakuSejak: String(r.berlakuSejak).slice(0, 10), aktif: !!Number(r.aktif),
    });
  };
  const batalEditAlokasi = () => { setEditId(null); setAl(KOSONG_AL); };

  return (
    <div>
      <Judul aksi={<Btn color="gray" onClick={muat}>Muat ulang</Btn>}>Monitor & Pengaturan</Judul>
      <div className="flex flex-wrap gap-1 mb-4">
        {TAB.map(([id, nama]) => (
          <button key={id} onClick={() => { if (id !== tab) { setData(null); setTab(id); } }} className={`px-3 py-1.5 rounded-lg text-sm ${tab === id ? "bg-slate-800 text-white" : "bg-white border hover:bg-gray-50"}`}>{nama}</button>
        ))}
      </div>

      {tab === "ringkas" && data?.perubahanTerakhir && (
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

      {tab === "kontaminasi" && Array.isArray(data) && (
        <>
          <p className="text-sm text-gray-500 mb-2">Baris jurnal yang dananya berbeda dari dana akun. Selesaikan dengan jurnal <b>Transfer Antar Dana</b>; targetnya nol.</p>
          <Tabel kolom={[{ judul: "No. bukti", kunci: "nomorBukti" }, { judul: "Tanggal", tampil: (r) => String(r.tanggal).slice(0, 10) }, { judul: "Jenis", kunci: "jenis" }, { judul: "Dana baris", tampil: (r) => <DanaBadge dana={r.danaBaris} /> }, { judul: "Dana akun", tampil: (r) => <DanaBadge dana={r.danaAkun} /> }, { judul: "Akun", tampil: (r) => `${r.kodeAkun} ${r.namaAkun}` }, { judul: "Nilai", kanan: true, tampil: (r) => rp(Number(r.debit) || Number(r.kredit)) }]} baris={data} kosong="Tidak ada kebocoran antar-dana 🎉" />
        </>
      )}
      {tab === "timpang" && Array.isArray(data) && <Tabel kolom={[{ judul: "No. bukti", kunci: "nomorBukti" }, { judul: "Dana", tampil: (r) => <DanaBadge dana={r.dana} /> }, { judul: "Debit", kanan: true, tampil: (r) => rp(r.debit) }, { judul: "Kredit", kanan: true, tampil: (r) => rp(r.kredit) }]} baris={data} kosong="Semua jurnal seimbang di setiap dana" />}
      {tab === "netral" && Array.isArray(data) && (
        <>
          <p className="text-sm text-gray-500 mb-2">Akun yang belum punya dana tetapi masih dipakai transaksi. Pecah per dana (mis. Kas Kecil), lalu reklasifikasi.</p>
          <Tabel kolom={[{ judul: "Akun", tampil: (r) => `${r.kode} ${r.nama}` }, { judul: "Jurnal", kanan: true, kunci: "jurnal" }, { judul: "Debit", kanan: true, tampil: (r) => rp(r.debit) }, { judul: "Kredit", kanan: true, tampil: (r) => rp(r.kredit) }]} baris={data} kosong="Tidak ada akun netral terpakai" />
        </>
      )}
      {tab === "pelanggaran" && Array.isArray(data) && <Tabel kolom={[{ judul: "Waktu", tampil: (r) => String(r.waktu).replace("T", " ").slice(0, 19) }, { judul: "No. bukti", kunci: "nomorBukti" }, { judul: "Detail", tampil: (r) => <code className="text-xs">{typeof r.detail === "string" ? r.detail : JSON.stringify(r.detail)}</code> }]} baris={data} kosong="Belum ada pelanggaran tercatat (mode PANTAU)" />}
      {tab === "audit" && Array.isArray(data) && <Tabel kolom={[{ judul: "Waktu", tampil: (r) => String(r.waktu).replace("T", " ").slice(0, 19) }, { judul: "Aksi", kunci: "aksi" }, { judul: "Entitas", tampil: (r) => `${r.entitas} ${r.entitasId ?? ""}` }, { judul: "Pengguna", kunci: "pengguna" }, { judul: "Detail", tampil: (r) => <code className="text-xs">{typeof r.detail === "string" ? r.detail : JSON.stringify(r.detail)}</code> }]} baris={data} />}

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
            {editId && <div className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded p-2">Mode edit — ubah isian di bawah tabel lalu klik Simpan perubahan.</div>}
            <Tabel kolom={[{ judul: "Dana", tampil: (r) => <DanaBadge dana={r.dana} /> }, { judul: "Jenis", tampil: (r) => labelJenisKebijakan(refJenis, r) }, { judul: "Persen", kanan: true, kunci: "persen" }, { judul: "Berlaku sejak", tampil: (r) => String(r.berlakuSejak).slice(0, 10) }, { judul: "Aktif", tampil: (r) => (Number(r.aktif) ? "ya" : "tidak") }, { judul: "Aksi", kanan: true, tampil: (r) => (editId === r.id ? <span className="text-xs text-amber-700">sedang diedit</span> : <button type="button" className="text-blue-600 hover:underline" onClick={() => mulaiEditAlokasi(r)}>Edit</button>) }]} baris={alokasi} kosong="Belum ada kebijakan; penerimaan dicatat bruto tanpa alokasi amil" />
            <div className={`grid grid-cols-2 gap-2 ${editId ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
              <Field label="Dana">
                <select className={inputCls} value={al.dana} onChange={(e) => setAl({ ...al, dana: e.target.value, jenis: "" })}>
                  {DANA_KEBIJAKAN.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
                </select>
              </Field>
              <Field label="Jenis">
                <select className={inputCls} value={al.jenis} onChange={(e) => setAl({ ...al, jenis: e.target.value })}
                  disabled={opsiJenisDana(refJenis, al.dana).length === 0}>
                  <option value="">Semua jenis</option>
                  {opsiJenisDana(refJenis, al.dana).map((j) => <option key={j.kode} value={j.kode}>{j.nama}</option>)}
                </select>
              </Field>
              <Field label="Persen (%)">
                <input className={inputCls} inputMode="decimal" placeholder={al.dana === "ZAKAT" ? "maks. 12,5" : al.dana === "WAKAF" ? "" : "maks. 20"} value={al.persen} onChange={(e) => setAl({ ...al, persen: e.target.value.replace(",", ".") })} />
              </Field>
              <Field label="Berlaku sejak">
                <input type="date" className={inputCls} value={al.berlakuSejak} onChange={(e) => setAl({ ...al, berlakuSejak: e.target.value })} />
              </Field>
              {editId && (
                <Field label="Status">
                  <select className={`${inputCls} ${al.aktif ? "" : "text-red-700"}`} value={al.aktif ? "1" : "0"}
                    onChange={(e) => setAl({ ...al, aktif: e.target.value === "1" })}>
                    <option value="1">Aktif</option>
                    <option value="0">Nonaktif</option>
                  </select>
                </Field>
              )}
            </div>
            <p className="text-xs text-gray-500">&quot;Semua jenis&quot; berlaku untuk jenis yang tidak punya kebijakan khusus. Kebijakan khusus jenis diutamakan. Kosongkan tanggal untuk mulai hari ini; tanggal dibandingkan dengan tanggal transaksi.</p>
            {editId && !al.aktif && (
              <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded p-2">
                Kebijakan ini akan dinonaktifkan setelah Anda menekan <b>Simpan perubahan</b>: penerimaan berikutnya tidak lagi dipotong dengan kebijakan ini.
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Btn color={editId ? "green" : "blue"} onClick={simpanAlokasi}>{editId ? "Simpan perubahan" : "Tambah kebijakan"}</Btn>
              {editId && (
                // Hanya mengubah status di form (sama dengan isian Status); tersimpan saat Simpan perubahan ditekan.
                <Btn color={al.aktif ? "red" : "slate"} onClick={() => setAl({ ...al, aktif: !al.aktif })}>
                  {al.aktif ? "Nonaktifkan kebijakan" : "Aktifkan kebijakan"}
                </Btn>
              )}
              {editId && <Btn color="gray" onClick={batalEditAlokasi}>Batal edit</Btn>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Label jenis di tabel kebijakan; kode yang tidak dikenal (mis. hasil ketik manual dulu) ditandai merah. */
function labelJenisKebijakan(ref, r) {
  if (!r.jenis) return "Semua jenis";
  const daftar = r.dana === "ZAKAT" ? ref.zakat : r.dana === "INFAQ" ? ref.infaq : r.dana === "WAKAF" ? ref.wakaf : [];
  const j = daftar.find((x) => String(x.kode).toUpperCase() === String(r.jenis).toUpperCase());
  if (j) return j.nama;
  return <span className="text-red-600" title="Tidak cocok dengan jenis mana pun, kebijakan ini tidak akan pernah terpakai">{r.jenis} (tidak dikenal)</span>;
}
