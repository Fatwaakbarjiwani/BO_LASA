import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Judul, SearchSelect } from "./ui";
import { RentangTanggal } from "./alatJurnal";
import { ModalJurnal, TabelBukuBesar, cetakBukuBesar, unduhBukuBesarCsv } from "./telusur";

const MODE = [
  ["single", "Single akun"],
  ["multiple", "Multiple akun"],
  ["all", "Semua akun"],
];
const hariIni = () => new Date().toISOString().slice(0, 10);
const awalBulan = () => `${hariIni().slice(0, 7)}-01`;

/** Buku Besar dari jurnal POSTED + saldo awal (LaporanService.bukuBesar). Nomor bukti bisa diklik untuk melihat jurnal. */
export default function BukuBesarPage() {
  const [coa, setCoa] = useState([]);
  const [mode, setMode] = useState("single");
  const [akun1, setAkun1] = useState("");
  const [akun2, setAkun2] = useState("");
  const [dari, setDari] = useState(awalBulan());
  const [sampai, setSampai] = useState(hariIni());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jurnal, setJurnal] = useState(null);

  useEffect(() => { keuangan.coaAll().then(setCoa).catch(() => {}); }, []);

  const opsi = coa.map((c) => ({ value: c.id, label: `${c.accountCode} ${c.accountName}` }));
  const terpilih = () => (mode === "single" ? [akun1] : mode === "multiple" ? [akun1, akun2] : []).filter(Boolean);
  const keterangan = () => {
    if (mode === "all") return "Semua akun (yang memiliki saldo atau mutasi)";
    return terpilih().map((id) => opsi.find((o) => String(o.value) === String(id))?.label).filter(Boolean).join(", ");
  };

  const tampilkan = async () => {
    if (!dari || !sampai) return Swal.fire("Tanggal belum lengkap", "Isi tanggal awal dan tanggal akhir.", "info");
    if (dari > sampai) return Swal.fire("Rentang salah", "Tanggal akhir harus sama atau sesudah tanggal awal.", "info");
    const ids = [...new Set(terpilih())];
    if (mode === "single" && !ids.length) return Swal.fire("Pilih akun", "Pilih satu akun COA.", "info");
    if (mode === "multiple" && (!akun1 || !akun2)) return Swal.fire("Pilih akun", "Pilih dua akun COA.", "info");
    setLoading(true);
    try {
      setData(await keuangan.bukuBesarTelusur({ coa: ids.join(",") || undefined, from: dari, to: sampai }));
    } catch (e) {
      Swal.fire("Gagal", errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  const adaData = () => {
    if (data && data.akun.length) return true;
    Swal.fire("Tidak ada data", "Klik Tampilkan dulu, atau tidak ada mutasi pada filter ini.", "info");
    return false;
  };
  const gantiMode = (m) => { setMode(m); setData(null); };

  return (
    <div>
      <Judul
        aksi={
          <>
            <Btn color="gray" onClick={() => adaData() && unduhBukuBesarCsv(data, keterangan())}>Unduh CSV</Btn>
            <Btn color="gray" onClick={async () => { if (adaData()) { try { await cetakBukuBesar(data, keterangan()); } catch (e) { Swal.fire("Gagal", e.message, "error"); } } }}>Cetak</Btn>
          </>
        }
      >
        Buku Besar
      </Judul>
      <div className="bg-white shadow rounded-lg p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          {MODE.map(([k, n]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="modeBukuBesar" value={k} checked={mode === k} onChange={() => gantiMode(k)} /> {n}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {mode !== "all" && (
            <div className="w-80">
              <div className="text-xs text-gray-500 mb-1">{mode === "multiple" ? "Akun pertama" : "Akun"}</div>
              <SearchSelect value={akun1} onChange={(v) => { setAkun1(v); setData(null); }} options={opsi} placeholder="Cari akun COA…" />
            </div>
          )}
          {mode === "multiple" && (
            <div className="w-80">
              <div className="text-xs text-gray-500 mb-1">Akun kedua</div>
              <SearchSelect value={akun2} onChange={(v) => { setAkun2(v); setData(null); }} options={opsi} placeholder="Cari akun COA…" />
            </div>
          )}
          <RentangTanggal dari={dari} sampai={sampai} onChange={(a, b) => { setDari(a); setSampai(b); }} />
          <Btn color="green" onClick={tampilkan} disabled={loading}>{loading ? "Memuat…" : "Tampilkan"}</Btn>
        </div>
        <p className="text-xs text-gray-500">
          Sumber: jurnal berstatus POSTED dan Saldo Awal, gabungan seluruh dana kecuali Wakaf. Mode <b>Semua akun</b> hanya menampilkan akun yang
          punya saldo atau mutasi. Klik <b>No. Bukti</b> untuk melihat jurnalnya.
        </p>
      </div>
      <TabelBukuBesar data={data} onJurnal={setJurnal} />
      {jurnal && <ModalJurnal id={jurnal} onClose={() => setJurnal(null)} />}
    </div>
  );
}
