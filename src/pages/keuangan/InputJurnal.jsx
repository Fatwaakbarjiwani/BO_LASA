import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryZiswaf } from "../../redux/actions/ziswafAction";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Field, Judul, Modal, SearchSelect, inputCls, num, rp } from "./ui";
import { teksRentang } from "./alatJurnal";
import { barisKopCsv, simpanCsv } from "./kopLaporan";
import { cetakDaftarJurnal } from "./cetakJurnal";
import { unduhExcelJurnal } from "../../services/jurnalExport";

/** Tanggal hari ini menurut jam lokal (WIB). today() di ui.jsx memakai UTC sehingga sebelum 07.00 WIB
 *  menghasilkan tanggal kemarin. */
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const TEMPLATE = [
  { id: "PENERIMAAN", nama: "Penerimaan", info: "Zakat, Infaq, DSKL masuk · pengembalian dana" },
  { id: "PENYALURAN", nama: "Penyaluran", info: "Pendayagunaan ke mustahik / program" },
  { id: "BEBAN_OPERASIONAL", nama: "Beban Operasional", info: "Biaya kantor dari Dana Pengelola" },
  { id: "TRANSFER_DANA", nama: "Transfer Antar Dana", info: "Perpindahan kas antar dana" },
  { id: "MUTASI_REKENING", nama: "Mutasi Rekening", info: "Pindah buku antar rekening (tanpa dana)" },
];
/** Nama jenis jurnal untuk tampilan (termasuk jenis yang tidak punya tab sendiri). */
const NAMA_JENIS = {
  ...Object.fromEntries(TEMPLATE.map((t) => [t.id, t.nama])),
  PENGEMBALIAN: "Pengembalian Dana",
  ALOKASI_AMIL: "Alokasi Hak Amil",
  BAGI_HASIL_BANK: "Bagi Hasil Bank",
  PENYESUAIAN: "Penyesuaian",
};

/** Pilihan jenis dari /keuangan/meta berbentuk {kode, nama}; tetap menerima bentuk lama (string). */
/** Label tampilan untuk kode jenis, dipakai juga bila backend masih mengirim kode saja (versi lama). */
const LABEL_JENIS = {
  TUNAI: "Wakaf Tunai", ASET: "Wakaf Aset", UMUM: "Infaq Umum", TERIKAT: "Infaq Terikat",
  FITRAH: "Zakat Fitrah", MAAL: "Zakat Maal", PROFESI: "Zakat Profesi", PERDAGANGAN: "Zakat Perdagangan",
  PERTANIAN: "Zakat Pertanian", EMAS_PERAK: "Zakat Emas & Perak",
};
const opsiJenis = (list) =>
  (list || []).map((j) =>
    typeof j === "string" ? { kode: j, nama: LABEL_JENIS[j] || j.replace(/_/g, " ") } : { ...j, nama: j.nama || LABEL_JENIS[j.kode] || j.kode });
const TAMBAH_JENIS = "__TAMBAH__";

/**
 * "Campaign" tampil sebagai pilihan Dana di form, tetapi bukan dana tersendiri di buku besar: dana campaign
 * adalah Infaq Terikat (sama seperti pemetaan jurnal lama, lihat migrasi V13/V15: 'campaign' -> INFAQ).
 * Daftar campaign diambil dari endpoint yang sama dengan menu "Jurnal Umum (lama)": GET /campaign.
 */
const CAMPAIGN = "CAMPAIGN";
const OPSI_CAMPAIGN = { kode: CAMPAIGN, nama: "Campaign" };
const danaPosting = (dana) => (dana === CAMPAIGN ? "INFAQ" : dana);
const opsiCampaign = (list) =>
  (list || []).map((c) => ({
    kode: String(c.campaignId),
    nama: `${c.campaignId}. ${c.campaignName}${c.active === false ? " (nonaktif)" : ""}`,
  }));

const akunDana = (meta, dana, kelompok) =>
  meta.akun.filter((a) => a.dana === dana && a.kelompok === kelompok && a.postable);
// Dipakai form Transfer Antar Dana (tetap seperti semula): rekening berdana pokok sama & akun Rekening Antar Dana.
const rekDana = (meta, dana) => meta.rekening.filter((r) => r.dana === dana);
const antarDana = (meta, dana) =>
  meta.akun.find((a) => a.kelompok === "ANTAR_DANA" && a.dana === dana);

/**
 * Rekening dinamis: semua rekening bisa dipakai dana apa pun (dana ditentukan oleh jurnal, bukan rekening).
 * `r.dana` hanya dana pokok rekening — dipakai untuk memilih rekening bawaan, bukan pembatas.
 */
const labelRekening = (r) =>
  `${r.kas ? "Kas: " : ""}${r.namaBank || ""} ${r.noRek || ""}`.trim() + (r.namaAkun ? ` — ${r.namaAkun}` : "");
const opsiRekening = (list) =>
  list.map((r) => ({ value: r.coaId, label: labelRekening(r), grup: r.kas ? "Kas tunai" : "Rekening bank" }));
/** Rekening bawaan: rekening bank berdana pokok sama, lalu kas berdana pokok sama, lalu rekening pertama. */
const rekBawaan = (list, dana) =>
  (list.find((r) => r.dana === dana && !r.kas) || list.find((r) => r.dana === dana) || list.find((r) => !r.kas) || list[0])?.coaId || "";
const HINT_REKENING = "Semua rekening bisa dipakai untuk dana apa pun. Ketik nama bank / nomor rekening untuk mencari.";

/** Kuantitas barang dari isian teks (koma atau titik desimal, maks. 3 angka di belakang koma). */
const angkaQty = (v) => {
  const n = parseFloat(String(v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 1000) / 1000 : 0;
};
const teksQty = (n) => Number(n || 0).toLocaleString("id-ID", { maximumFractionDigits: 3 });
/** Akun persediaan barang per dana (akun lama COA): 1201 Zakat Fitrah Barang, 1401 Infaq Barang. Sama dengan InventoryService. */
const KODE_PERSEDIAAN = { ZAKAT: "1201", INFAQ: "1401" };
const akunPersediaan = (meta, dana) =>
  meta.akun.find((a) => a.dana === dana && a.kode === KODE_PERSEDIAAN[dana] && bisaPosting(a));
/** Tambah barang baru lewat dialog; mengembalikan id barang baru atau null bila dibatalkan. */
async function tambahBarangDialog() {
  const r = await Swal.fire({
    title: "Barang baru",
    html: `<input id="brg-nama" class="swal2-input" placeholder="Nama barang, mis. Beras">`
      + `<input id="brg-satuan" class="swal2-input" placeholder="Satuan, mis. kg / paket / dus">`
      + `<input id="brg-kategori" class="swal2-input" placeholder="Kategori (opsional), mis. Sembako">`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Simpan",
    cancelButtonText: "Batal",
    preConfirm: () => {
      const nama = document.getElementById("brg-nama").value.trim();
      const satuan = document.getElementById("brg-satuan").value.trim();
      const kategori = document.getElementById("brg-kategori").value.trim();
      if (!nama || !satuan) { Swal.showValidationMessage("Nama dan satuan wajib diisi"); return false; }
      return { nama, satuan, kategori: kategori || null };
    },
  });
  if (!r.isConfirmed) return null;
  try {
    const b = await keuangan.inventoryBarangBaru(r.value);
    return b.id;
  } catch (e) {
    Swal.fire({ icon: "error", title: "Gagal menambah barang", text: errMsg(e) });
    return null;
  }
}
const TAMBAH_BARANG = "__TAMBAH_BARANG__";

/** Nama program tanpa akhiran asnaf, mis. "Beasiswa YBWSA (Fisabilillah)" -> "Beasiswa YBWSA". */
const POLA_ASNAF = /\s*\(\s*(fakir\s*miskin|fakir|miskin|amil|mu'?all?af|riqab|gharim(in)?|fi+\s*sabilillah|fisabilillah|ibnu\s*sabil)\s*\)\s*$/i;
const namaProgram = (nama) => String(nama || "").replace(POLA_ASNAF, "").trim();

/**
 * Akun yang dipakai jurnal alokasi hak amil — aturan pemilihannya sama dengan PostingService.alokasiAmil di server:
 * Bagian Amil (pendayagunaan dana sumber, asnaf AMIL / bernama "Bagian Amil"), Rekening Antar Dana dana sumber,
 * Rekening Antar Dana Pengelola, dan 4401 Penerimaan Hak Amil (Dana Pengelola). Semua harus akun yang bisa diposting.
 */
const pertama = (list) => [...list].sort((a, b) => Number(a.id) - Number(b.id))[0];
const bisaPosting = (a) => !!a && !!Number(a.postable ?? 1);
function akunAlokasiAmil(meta, dana) {
  const bagian = pertama(meta.akun.filter((a) => a.dana === dana && a.kelompok === "PENDAYAGUNAAN" && bisaPosting(a)
    && (a.asnaf === "AMIL" || /bagian amil/i.test(a.nama || ""))));
  const antarSumber = pertama(meta.akun.filter((a) => a.kelompok === "ANTAR_DANA" && a.dana === dana && bisaPosting(a)));
  const antarPengelola = pertama(meta.akun.filter((a) => a.kelompok === "ANTAR_DANA" && a.dana === "PENGELOLA" && bisaPosting(a)));
  const penerimaanAmil = pertama(meta.akun.filter((a) => a.kode === "4401" && a.dana === "PENGELOLA" && bisaPosting(a)));
  const daftar = [
    ["bagian", bagian, `Bagian Amil — akun pendayagunaan Dana ${dana} dengan asnaf AMIL`],
    ["antarSumber", antarSumber, `Rekening Antar Dana (${dana})`],
    ["antarPengelola", antarPengelola, "Rekening Antar Dana (PENGELOLA)"],
    ["penerimaanAmil", penerimaanAmil, "4401 Penerimaan Hak Amil (Dana Pengelola)"],
  ];
  const kurang = daftar.filter(([, a]) => !a).map(([, , label]) => `${label} — belum ada (atau masih berupa akun induk)`);
  return { bagian, antarSumber, antarPengelola, penerimaanAmil, kurang };
}
const labelAkun = (a) => (a ? `${a.kode} ${a.nama}` : null);

/**
 * Pilih kebijakan hak amil dengan aturan yang sama dengan server (PostingService.alokasiAmil):
 * aktif, dana sama, berlaku_sejak <= tanggal transaksi, jenis kosong ("semua jenis") atau sama dengan jenis
 * penerimaan; kebijakan khusus jenis diutamakan atas "semua jenis", lalu yang berlaku_sejak paling baru.
 */
const tglStr = (v) => (v == null ? "" : typeof v === "number" ? new Date(v).toISOString().slice(0, 10) : String(v).slice(0, 10));
function pilihKebijakanAmil(alokasi, dana, jenis, tanggal) {
  const j = (jenis || "").toUpperCase();
  const cocok = (alokasi || []).filter((a) => a.dana === dana && Number(a.aktif ?? 1) && tglStr(a.berlakuSejak) <= tanggal
    && (!a.jenis || String(a.jenis).toUpperCase() === j));
  cocok.sort((a, b) => (a.jenis ? 0 : 1) - (b.jenis ? 0 : 1) || tglStr(b.berlakuSejak).localeCompare(tglStr(a.berlakuSejak)));
  return cocok[0];
}

function Nominal({ value, onChange, ...rest }) {
  return (
    <input
      {...rest}
      inputMode="numeric"
      className={inputCls}
      value={value ? num(value) : ""}
      placeholder="0"
      onChange={(e) => onChange(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0)}
    />
  );
}
Nominal.propTypes = { value: PropTypes.number, onChange: PropTypes.func };

function Pratinjau({ baris, judul = "Pratinjau jurnal (per dana)", catatan }) {
  const valid = baris.filter((b) => b.akun);
  const perDana = {};
  valid.forEach((b) => {
    perDana[b.dana] ||= { d: 0, k: 0 };
    perDana[b.dana].d += b.debit || 0;
    perDana[b.dana].k += b.kredit || 0;
  });
  const timpang = Object.entries(perDana).filter(([, v]) => v.d !== v.k);
  return (
    <div className="bg-gray-50 border rounded-lg p-3">
      <div className="text-sm font-semibold text-gray-600">{judul}</div>
      {catatan && <div className="text-xs text-gray-500">{catatan}</div>}
      <div className="mb-2" />
      <table className="w-full text-sm">
        <thead className="text-xs text-gray-500">
          <tr>
            <th className="text-left py-1">Dana</th>
            <th className="text-left">Akun</th>
            <th className="text-right">Debit</th>
            <th className="text-right">Kredit</th>
          </tr>
        </thead>
        <tbody>
          {valid.map((b, i) => (
            <tr key={i} className="border-t">
              <td className="py-1"><DanaBadge dana={b.dana} /></td>
              <td>{b.akun}</td>
              <td className="text-right tabular-nums">{b.debit ? rp(b.debit) : ""}</td>
              <td className="text-right tabular-nums">{b.kredit ? rp(b.kredit) : ""}</td>
            </tr>
          ))}
          {valid.length === 0 && (
            <tr><td colSpan={4} className="py-3 text-center text-gray-400">Lengkapi form untuk melihat jurnal</td></tr>
          )}
        </tbody>
      </table>
      <div className={`mt-2 text-sm font-medium ${timpang.length ? "text-red-600" : "text-green-700"}`}>
        {valid.length === 0
          ? ""
          : timpang.length
            ? `Tidak seimbang pada dana ${timpang.map(([d]) => d).join(", ")}`
            : "Seimbang di setiap dana"}
      </div>
    </div>
  );
}
Pratinjau.propTypes = { baris: PropTypes.array, judul: PropTypes.string, catatan: PropTypes.node };

/**
 * Simpan jurnal. Mode edit: minta konfirmasi + alasan (opsional), lalu PUT — nomor bukti tetap; baris lama
 * ditandai terhapus (tetap terlihat di Daftar Jurnal) dan isi sebelum edit dicatat di audit log.
 */
async function kirim(cmd, reset, edit, onSelesai) {
  try {
    let r;
    if (edit) {
      const k = await Swal.fire({
        icon: "question",
        title: `Simpan perubahan ${edit.nomorBukti}?`,
        html: "Nomor bukti tetap sama. Isi lama tetap tersimpan sebagai riwayat (baris terhapus di Daftar Jurnal).<br/><small>Alokasi hak amil otomatis ikut dihitung ulang.</small>",
        input: "text",
        inputLabel: "Alasan perubahan (opsional)",
        showCancelButton: true,
        confirmButtonText: "Simpan perubahan",
        cancelButtonText: "Batal",
      });
      if (!k.isConfirmed) return;
      r = await keuangan.editJurnal(edit.id, { ...cmd, alasan: k.value?.trim() || null });
    } else {
      r = await keuangan.postJurnal(cmd);
    }
    const extra = [
      ...(r.alokasi?.length ? [`Alokasi hak amil: ${r.alokasi.join(", ")}`] : []),
      ...(r.peringatan || []),
    ];
    await Swal.fire({
      icon: extra.length ? "info" : "success",
      title: edit ? "Perubahan tersimpan" : "Jurnal tersimpan",
      html: `<b>${r.nomorBukti}</b>${extra.length ? "<br/><small>" + extra.join("<br/>") + "</small>" : ""}`,
    });
    reset();
    onSelesai?.();
  } catch (e) {
    Swal.fire({ icon: "error", title: "Jurnal ditolak", text: errMsg(e) });
  }
}

function TombolSimpan({ edit, onBatalEdit, disabled, onClick, children }) {
  return (
    <div className="flex gap-2">
      <Btn color="green" disabled={disabled} onClick={onClick} className="flex-1">{edit ? `Simpan perubahan ${edit.nomorBukti}` : children}</Btn>
      {edit && <Btn color="gray" onClick={onBatalEdit}>Batal edit</Btn>}
    </div>
  );
}
TombolSimpan.propTypes = { edit: PropTypes.object, onBatalEdit: PropTypes.func, disabled: PropTypes.bool, onClick: PropTypes.func, children: PropTypes.node };

// ----------------------------------------------------------------------------------------------
function FormPenerimaan({ meta, alokasi, campaign, onJenisZakatBaru, awal, edit, onSelesai, onBatalEdit }) {
  const danaOpsi = [...meta.dana.filter((d) => d.kode !== "PENGELOLA"), OPSI_CAMPAIGN];
  const kosong = {
    tanggal: today(), dana: "ZAKAT", jenis: "FITRAH", akunId: "", rekId: "", donatur: "", donaturId: null,
    anonim: false, samarkan: false, metode: "TRANSFER_BANK", nominal: 0, ket: "", bukti: "",
    bentuk: "UANG", barangId: "", qty: "", nilaiSatuan: 0,
  };
  const [f, setF] = useState(awal ? { ...kosong, ...awal } : kosong);
  const [saran, setSaran] = useState([]);
  const [barangList, setBarangList] = useState(null);
  // Akun penerimaan dipilih otomatis hanya saat dana/jenis benar-benar berubah, supaya akun hasil muat-edit
  // (atau pilihan manual) tidak tertimpa ketika daftar campaign selesai dimuat.
  const sebelum = useRef(awal ? { dana: awal.dana, jenis: awal.jenis } : null);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const isCampaign = f.dana === CAMPAIGN;
  const dana = danaPosting(f.dana);
  const akunList = akunDana(meta, dana, "PENERIMAAN");
  const rekList = meta.rekening;
  const jenisOpsi = isCampaign
    ? opsiCampaign(campaign)
    : opsiJenis(f.dana === "ZAKAT" ? meta.jenisZakat : f.dana === "WAKAF" ? meta.jenisWakaf : f.dana === "INFAQ" ? meta.jenisInfaq : []);
  const jenisList = jenisOpsi.map((j) => j.kode);
  // Jenis penerimaan COA yang dicari: campaign selalu Infaq Terikat.
  const jenisCoa = isCampaign ? "TERIKAT" : f.dana === "INFAQ" ? (f.jenis === "TERIKAT" ? "TERIKAT" : "TIDAK_TERIKAT") : f.jenis;

  useEffect(() => {
    const cocok = akunList.find((a) => (a.jenisPenerimaan || "") === jenisCoa);
    const berubah = !sebelum.current || sebelum.current.dana !== f.dana || sebelum.current.jenis !== f.jenis;
    sebelum.current = { dana: f.dana, jenis: f.jenis };
    setF((s) => ({
      ...s,
      // Daftar campaign dimuat asinkron: selama masih kosong, jangan buang campaign yang sudah terpilih.
      jenis: jenisList.includes(s.jenis) || (isCampaign && jenisList.length === 0) ? s.jenis : jenisList[0] || "",
      akunId: !berubah && akunList.some((a) => String(a.id) === String(s.akunId)) ? s.akunId : cocok ? cocok.id : akunList[0]?.id || "",
      rekId: rekList.some((r) => String(r.coaId) === String(s.rekId)) ? s.rekId : rekBawaan(rekList, dana),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.dana, f.jenis, campaign]);

  useEffect(() => {
    if (f.donatur.length < 2) return setSaran([]);
    const t = setTimeout(() => keuangan.donatur(f.donatur).then(setSaran).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [f.donatur]);

  const akun = meta.akun.find((a) => String(a.id) === String(f.akunId));
  const rek = meta.rekening.find((r) => String(r.coaId) === String(f.rekId));
  const akunJenisCocok = f.dana !== "ZAKAT" || akunList.some((a) => a.jenisPenerimaan === f.jenis);

  // Jenis zakat dinamis: bila jenis belum ada, petugas bisa menambahkannya langsung dari form ini.
  const tambahJenisZakat = async () => {
    const r = await Swal.fire({
      title: "Tambah jenis zakat",
      input: "text",
      inputLabel: "Nama jenis zakat",
      inputPlaceholder: "mis. Zakat Saham",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      inputValidator: (v) => (!v || !v.trim() ? "Nama wajib diisi" : undefined),
    });
    if (!r.isConfirmed) return;
    try {
      const baru = await keuangan.jenisZakatBaru(r.value.trim());
      await onJenisZakatBaru();
      set("jenis", baru.kode);
      if (!baru.baru) Swal.fire({ icon: "info", title: "Sudah ada", text: `${baru.nama} sudah terdaftar dan dipilih.` });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Gagal menambah jenis zakat", text: errMsg(e) });
    }
  };
  const persen = pilihKebijakanAmil(alokasi, dana, isCampaign ? "TERIKAT" : f.jenis, f.tanggal);

  // Bentuk Barang (no. 13 & 14): zakat/infaq/campaign berupa barang -> stok inventory bertambah; tanpa hak amil.
  const bolehBarang = !edit && ["ZAKAT", "INFAQ", CAMPAIGN].includes(f.dana);
  const isBarang = bolehBarang && f.bentuk === "BARANG";
  useEffect(() => {
    if (!isBarang || barangList) return;
    keuangan.inventoryBarang().then(setBarangList).catch((e) => { setBarangList([]); Swal.fire({ icon: "error", title: "Gagal memuat barang", text: errMsg(e) }); });
  }, [isBarang, barangList]);
  const barang = (barangList || []).find((b) => String(b.id) === String(f.barangId));
  const qtyNum = angkaQty(f.qty);
  const nilaiBarang = Math.round(qtyNum * (f.nilaiSatuan || 0));
  const persediaan = isBarang ? akunPersediaan(meta, dana) : null;
  const nominal = isBarang ? nilaiBarang : f.nominal;
  const pilihBarang = async (v) => {
    if (v !== TAMBAH_BARANG) return set("barangId", v);
    const id = await tambahBarangDialog();
    if (!id) return;
    const list = await keuangan.inventoryBarang().catch(() => barangList || []);
    setBarangList(list);
    set("barangId", id);
  };

  const baris = [
    { dana, akun: isBarang ? (persediaan ? `${persediaan.kode} ${persediaan.nama}` : null) : rek ? labelRekening(rek) : null, debit: nominal },
    { dana, akun: akun ? `${akun.kode} ${akun.nama}` : null, kredit: nominal },
  ];
  const siap = nominal > 0 && akun && f.donatur.trim() && (!isCampaign || f.jenis)
    && (isBarang ? barang && qtyNum > 0 && persediaan : rek);

  // Potongan hak amil (dibulatkan ke rupiah, sama dengan server) dan jurnal alokasinya. Barang tidak dipotong.
  const amilPersen = persen && dana !== "PENGELOLA" && !isBarang ? Number(persen.persen) : 0;
  const amil = amilPersen > 0 && f.nominal > 0 ? Math.round((f.nominal * amilPersen) / 100) : 0;
  const akunAmil = amil > 0 ? akunAlokasiAmil(meta, dana) : null;
  const amilJalan = amil > 0 && akunAmil.kurang.length === 0;
  const barisAmil = amilJalan ? [
    { dana, akun: labelAkun(akunAmil.bagian), debit: amil },
    { dana, akun: labelAkun(akunAmil.antarSumber), kredit: amil },
    { dana: "PENGELOLA", akun: labelAkun(akunAmil.antarPengelola), debit: amil },
    { dana: "PENGELOLA", akun: labelAkun(akunAmil.penerimaanAmil), kredit: amil },
  ] : [];

  const simpanBarang = async () => {
    try {
      const r = await keuangan.inventoryMasuk({
        tanggal: f.tanggal, dana, akunPenerimaanId: akun.id,
        jenisZakat: f.dana === "ZAKAT" ? f.jenis : null, jenisInfaq: f.dana === "INFAQ" ? f.jenis : isCampaign ? "TERIKAT" : null,
        campaignId: isCampaign && f.jenis ? Number(f.jenis) : null,
        donaturId: f.donaturId, donaturNama: f.donatur.trim(), donaturTipe: "INDIVIDU", anonim: f.anonim, samarkan: f.samarkan,
        barangId: barang.id, qty: qtyNum, nilaiSatuan: f.nilaiSatuan, keterangan: f.ket || null, buktiUrl: f.bukti || null,
      });
      await Swal.fire({
        icon: "success", title: "Penerimaan barang tersimpan",
        html: `<b>${r.nomorBukti}</b>${r.peringatan?.length ? "<br/><small>" + r.peringatan.join("<br/>") + "</small>" : ""}`,
      });
      setF({ ...kosong, tanggal: f.tanggal, dana: f.dana, bentuk: "BARANG" });
      setBarangList(null);
      onSelesai?.();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Penerimaan barang ditolak", text: errMsg(e) });
    }
  };

  const simpan = async () => {
    if (isBarang) return simpanBarang();
    if (amil > 0 && !amilJalan) {
      const k = await Swal.fire({
        icon: "warning",
        title: "Hak amil tidak akan dipotong",
        html: `Kebijakan hak amil ${amilPersen}% berlaku, tetapi akun berikut belum siap di COA:<br/><small>${akunAmil.kurang.join("<br/>")}</small><br/><br/>Penerimaan tetap disimpan penuh tanpa jurnal alokasi. Lanjutkan?`,
        showCancelButton: true,
        confirmButtonText: "Simpan tanpa potongan",
        cancelButtonText: "Batal, lengkapi COA dulu",
      });
      if (!k.isConfirmed) return;
    }
    return kirim(
      {
        jenis: "PENERIMAAN", tanggal: f.tanggal, danaKode: dana, keterangan: f.ket || null,
        lines: [
          { coaId: rek.coaId, debit: f.nominal },
          { coaId: akun.id, kredit: f.nominal },
        ],
        penerimaan: {
          donaturId: f.donaturId, donaturNama: f.donatur.trim(), donaturTipe: "INDIVIDU",
          anonim: f.anonim, samarkan: f.samarkan,
          jenisZakat: f.dana === "ZAKAT" ? f.jenis : null, jenisWakaf: f.dana === "WAKAF" ? f.jenis : null,
          jenisInfaq: f.dana === "INFAQ" ? f.jenis : isCampaign ? "TERIKAT" : null, metodeBayar: f.metode,
          campaignId: isCampaign && f.jenis ? Number(f.jenis) : null, buktiUrl: f.bukti || null,
        },
      },
      () => setF({ ...kosong, tanggal: f.tanggal, dana: f.dana }),
      edit,
      onSelesai,
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal"><input type="date" max={today()} className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
          <Field label="Dana">
            <select className={inputCls} value={f.dana} onChange={(e) => set("dana", e.target.value)}>
              {danaOpsi.map((d) => <option key={d.kode} value={d.kode}>{d.nama}</option>)}
            </select>
          </Field>
        </div>
        {isCampaign && jenisList.length === 0 && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">Belum ada campaign.</div>
        )}
        {jenisList.length > 0 && (
          <Field label={isCampaign ? "Jenis (campaign)" : f.dana === "ZAKAT" ? "Jenis zakat" : f.dana === "WAKAF" ? "Jenis wakaf" : "Jenis infaq"}
            hint={isCampaign ? "Dicatat sebagai Dana Infaq Terikat untuk campaign terpilih" : undefined}>
            {isCampaign ? (
              // Campaign bisa banyak: dropdown yang bisa dicari (ketik nama / nomor campaign).
              <SearchSelect value={f.jenis} onChange={(v) => set("jenis", v)}
                options={jenisOpsi.map((j) => ({ value: j.kode, label: j.nama }))} placeholder="Cari campaign…" />
            ) : (
              <select className={inputCls} value={f.jenis}
                onChange={(e) => (e.target.value === TAMBAH_JENIS ? tambahJenisZakat() : set("jenis", e.target.value))}>
                {jenisOpsi.map((j) => <option key={j.kode} value={j.kode}>{j.nama}</option>)}
                {f.dana === "ZAKAT" && <option value={TAMBAH_JENIS}>+ Tambah jenis zakat…</option>}
              </select>
            )}
          </Field>
        )}
        <Field label="Akun penerimaan"
          hint={akunJenisCocok ? undefined : "Belum ada akun COA khusus untuk jenis zakat ini; pilih akun penerimaan zakat yang sesuai (atau buat akunnya di COA dengan jenis penerimaan yang sama)."}>
          <SearchSelect
            value={f.akunId}
            onChange={(v) => set("akunId", v)}
            options={akunList.map((a) => ({ value: a.id, label: `${a.kode} ${a.nama}` }))}
            placeholder="Cari akun penerimaan…"
          />
        </Field>
        {bolehBarang && (
          <Field label="Bentuk penerimaan">
            <div className="flex gap-2" role="radiogroup" aria-label="Bentuk penerimaan">
              {[["UANG", "Uang"], ["BARANG", "Barang"]].map(([v, n]) => (
                <button key={v} type="button" role="radio" aria-checked={f.bentuk === v} onClick={() => set("bentuk", v)}
                  className={`px-4 py-1.5 rounded-lg border text-sm ${f.bentuk === v ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-blue-50"}`}>
                  {n}
                </button>
              ))}
            </div>
          </Field>
        )}
        {isBarang ? (
          <>
            <Field label="Barang" hint="Stok barang ini (per dana) bertambah dan bisa disalurkan dari menu Inventory Barang.">
              <PilihGrup
                value={f.barangId}
                onChange={pilihBarang}
                options={[
                  ...(barangList || []).map((b) => ({ value: b.id, label: `${b.nama} (${b.satuan})`, grup: b.kategori || "Tanpa kategori", ket: `${b.kode} · stok total ${teksQty(b.stokTotal)} ${b.satuan}` })),
                  { value: TAMBAH_BARANG, label: "+ Tambah barang baru…", grup: "Lainnya" },
                ]}
                placeholder={barangList == null ? "Memuat…" : `Cari barang (${barangList.length})…`}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Kuantitas${barang ? ` (${barang.satuan})` : ""}`}>
                <input inputMode="decimal" className={inputCls} value={f.qty} placeholder="0" onChange={(e) => set("qty", e.target.value.replace(/[^0-9.,]/g, ""))} />
              </Field>
              <Field label={`Nilai per ${barang?.satuan || "satuan"}`} hint="Nilai wajar / harga pasar">
                <Nominal value={f.nilaiSatuan} onChange={(v) => set("nilaiSatuan", v)} />
              </Field>
            </div>
            <div className="text-sm text-gray-600">Nilai barang: <b>{rp(nilaiBarang)}</b>{qtyNum > 0 && barang ? ` (${teksQty(qtyNum)} ${barang.satuan} × ${rp(f.nilaiSatuan || 0)})` : ""}</div>
            {!persediaan && <div className="text-sm text-red-600">Akun barang {KODE_PERSEDIAAN[dana]} Dana {dana} tidak ditemukan di COA.</div>}
          </>
        ) : (
          <>
            <Field label="Masuk ke rekening" hint={HINT_REKENING}>
              <PilihGrup
                value={f.rekId}
                onChange={(v) => set("rekId", v)}
                options={opsiRekening(rekList)}
                placeholder={`Cari bank / no. rekening (${rekList.length} rekening)…`}
              />
            </Field>
            <Field label="Nominal (rupiah)"><Nominal value={f.nominal} onChange={(v) => set("nominal", v)} /></Field>
          </>
        )}
      </div>
      <div className="space-y-3">
        <Field label="Nama donatur / muzaki" hint="Ketik untuk mencari donatur terdaftar">
          <input list="donatur-saran" className={inputCls} value={f.donatur}
            onChange={(e) => {
              const v = e.target.value;
              const cocok = saran.find((s) => s.nama === v);
              setF((s) => ({ ...s, donatur: v, donaturId: cocok ? cocok.id : null }));
            }} />
          <datalist id="donatur-saran">{saran.map((s) => <option key={s.id} value={s.nama}>{s.email}</option>)}</datalist>
        </Field>
        <div className="flex gap-5 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.anonim} onChange={(e) => set("anonim", e.target.checked)} /> Tampil “Anonim”</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.samarkan} onChange={(e) => set("samarkan", e.target.checked)} /> Samarkan nama</label>
        </div>
        {!isBarang && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Metode bayar">
              <select className={inputCls} value={f.metode} onChange={(e) => set("metode", e.target.value)}>
                {meta.metodeBayar.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
              </select>
            </Field>
          </div>
        )}
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
        <Pratinjau baris={baris} judul={isBarang ? "Pratinjau jurnal penerimaan barang" : "Pratinjau jurnal penerimaan (per dana)"}
          catatan={isBarang ? "Penerimaan barang tidak dipotong hak amil." : undefined} />
        {amil > 0 && (
          <div className="text-sm bg-amber-50 border border-amber-200 rounded p-3 text-amber-900 space-y-1">
            <div className="font-semibold">Potongan hak amil {amilPersen}%</div>
            <table className="w-full tabular-nums">
              <tbody>
                <tr><td>Penerimaan bruto</td><td className="text-right">{rp(nominal)}</td></tr>
                <tr><td>Hak amil {amilPersen}% × {rp(nominal)}</td><td className="text-right">− {rp(amil)}</td></tr>
                <tr className="border-t border-amber-200 font-semibold"><td>Bersih untuk Dana {dana}</td><td className="text-right">{rp(nominal - amil)}</td></tr>
                <tr><td>Masuk ke Dana Pengelola</td><td className="text-right">{rp(amil)}</td></tr>
              </tbody>
            </table>
          </div>
        )}
        {amilJalan && (
          <Pratinjau baris={barisAmil} judul="Pratinjau jurnal alokasi hak amil (dibuat otomatis)"
            catatan={edit ? "Jurnal alokasi yang sudah ada ikut diperbarui; nomor buktinya tetap." : "Dicatat sebagai jurnal terpisah dengan nomor bukti sendiri."} />
        )}
        {amil > 0 && !amilJalan && (
          <div className="text-sm bg-red-50 border border-red-200 rounded p-3 text-red-800">
            <div className="font-semibold">Hak amil tidak akan dipotong — akun COA belum lengkap</div>
            <ul className="list-disc ml-5 mt-1">{akunAmil.kurang.map((k) => <li key={k}>{k}</li>)}</ul>
            <div className="mt-1 text-xs">Lengkapi di Administrasi → Daftar Akun (COA). Bila tetap disimpan, penerimaan dicatat penuh tanpa jurnal alokasi.</div>
          </div>
        )}
        <TombolSimpan edit={edit} onBatalEdit={onBatalEdit} disabled={!siap} onClick={simpan}>{isBarang ? "Simpan penerimaan barang" : "Simpan penerimaan"}</TombolSimpan>
      </div>
    </div>
  );
}
FormPenerimaan.propTypes = {
  meta: PropTypes.object, alokasi: PropTypes.array, campaign: PropTypes.array, onJenisZakatBaru: PropTypes.func,
  awal: PropTypes.object, edit: PropTypes.object, onSelesai: PropTypes.func, onBatalEdit: PropTypes.func,
};

// ----------------------------------------------------------------------------------------------
const URUT_BIDANG = ["PENDIDIKAN", "SOSIAL", "KEAGAMAAN", "DAKWAH", "KEMANUSIAAN", "EKONOMI_PEMBERDAYAAN", "LINGKUNGAN", "KESEHATAN"];
const labelBidang = (b) =>
  b ? b.toLowerCase().split("_").map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" / ") : "Belum ada bidang";

/**
 * Dropdown dengan pencarian yang menampilkan pilihan per grup (judul grup tidak bisa dipilih).
 * options: [{ value, label, grup, nonaktif?, ket? }] — urutan grup mengikuti urutan pertama kemunculannya.
 * buka: angka yang dinaikkan pemanggil untuk membuka daftar secara otomatis (mis. setelah memilih dana sumber).
 */
function PilihGrup({ value, onChange, options, placeholder = "Cari…", buka = 0 }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);
  useEffect(() => { if (buka > 0) { setOpen(true); setQ(""); } }, [buka]);

  const selected = options.find((o) => String(o.value) === String(value));
  const kata = q.trim().toLowerCase();
  const filtered = kata ? options.filter((o) => `${o.label} ${o.grup || ""}`.toLowerCase().includes(kata)) : options;
  const grup = [];
  filtered.forEach((o) => {
    const g = grup.find((x) => x.nama === (o.grup || ""));
    if (g) g.isi.push(o); else grup.push({ nama: o.grup || "", isi: [o] });
  });

  return (
    <div className="relative" ref={ref}>
      <input
        className={inputCls}
        value={open ? q : (selected?.label ?? "")}
        placeholder={placeholder}
        onFocus={() => { setOpen(true); setQ(""); }}
        onClick={() => setOpen(true)}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-72 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg"
          onMouseDown={(e) => e.preventDefault()} onClick={(e) => e.preventDefault()}>
          {filtered.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">Tidak ditemukan</div>}
          {grup.map((g) => (
            <div key={g.nama}>
              {g.nama && (
                <div className="sticky top-0 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 border-y border-gray-200">
                  {g.nama} <span className="font-normal normal-case">({g.isi.length})</span>
                </div>
              )}
              {g.isi.map((o) => (
                <div
                  key={o.value}
                  title={o.ket || undefined}
                  className={o.nonaktif
                    ? "px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                    : `px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${String(o.value) === String(value) ? "bg-blue-50 font-medium" : ""}`}
                  onMouseDown={() => { if (o.nonaktif) return; onChange(o.value); setOpen(false); setQ(""); }}
                >
                  {o.label}
                  {o.ket && <span className="block text-xs text-gray-400">{o.ket}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
PilihGrup.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    grup: PropTypes.string,
    nonaktif: PropTypes.bool,
    ket: PropTypes.string,
  })).isRequired,
  placeholder: PropTypes.string,
  buka: PropTypes.number,
};

/**
 * Penyaluran: Dana sumber dipilih lebih dulu (seperti semula), lalu Bidang menyaring Program milik dana itu.
 * Bidang "Semua bidang" = tampilkan semua program dana sumber; "Tanpa bidang" = program yang belum diberi bidang
 * di COA. Rekening dinamis: semua rekening bisa dipakai. Asnaf bisa diisi untuk semua dana (wajib untuk Zakat).
 */
const SEMUA_BIDANG = "";
const TANPA_BIDANG = "__TANPA__";
const barisKosong = () => ({ mustahikId: "", nama: "", asnaf: "", jumlah: 0, jml: 1 });

function FormPenyaluran({ meta, campaign, awal, edit, onSelesai, onBatalEdit }) {
  const danaOpsi = [...meta.dana.filter((d) => d.kode !== "PENGELOLA"), OPSI_CAMPAIGN];
  const kosong = { tanggal: today(), dana: "ZAKAT", jenis: "", bidang: SEMUA_BIDANG, akunId: "", rekId: "", ket: "" };
  const [f, setF] = useState(awal ? { ...kosong, ...awal, rows: undefined } : kosong);
  const [rows, setRows] = useState(awal?.rows?.length ? awal.rows : [barisKosong()]);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const isCampaign = f.dana === CAMPAIGN;
  const dana = danaPosting(f.dana);
  const campaignOpsi = opsiCampaign(campaign);
  const namaDana = (kode) => meta.dana.find((d) => d.kode === kode)?.nama || `Dana ${kode}`;
  // Semua program (akun pendayagunaan) milik dana sumber; akun tanpa dana (umum) ikut.
  const programDana = meta.akun
    .filter((a) => a.kelompok === "PENDAYAGUNAAN" && bisaPosting(a) && (a.dana === dana || !a.dana))
    .sort((a, b) => {
      const ua = a.bidang ? URUT_BIDANG.indexOf(a.bidang) : 99;
      const ub = b.bidang ? URUT_BIDANG.indexOf(b.bidang) : 99;
      return (ua < 0 ? 98 : ua) - (ub < 0 ? 98 : ub) || String(a.kode).localeCompare(String(b.kode));
    });
  // Semua bidang selalu ditampilkan; jumlah program menunjukkan berapa program dana sumber ini yang sudah dipetakan
  // ke bidang tersebut (pemetaan di COA, kolom Bidang program).
  const jumlahPerBidang = {};
  programDana.forEach((a) => { const b = a.bidang || TANPA_BIDANG; jumlahPerBidang[b] = (jumlahPerBidang[b] || 0) + 1; });
  const adaBidang = programDana.some((a) => a.bidang);
  const bidangOpsi = [
    { value: SEMUA_BIDANG, label: `Semua bidang (${programDana.length} program)` },
    ...URUT_BIDANG.map((b) => ({ value: b, label: `${labelBidang(b)} (${jumlahPerBidang[b] ? `${jumlahPerBidang[b]} program` : "belum ada program"})` })),
    ...(jumlahPerBidang[TANPA_BIDANG] ? [{ value: TANPA_BIDANG, label: `Tanpa bidang (${jumlahPerBidang[TANPA_BIDANG]} program)` }] : []),
  ];
  const akunList = programDana.filter((a) => f.bidang === SEMUA_BIDANG
    || (f.bidang === TANPA_BIDANG ? !a.bidang : a.bidang === f.bidang));
  const akunOpsi = akunList.map((a) => ({ value: a.id, label: `${a.kode} ${namaProgram(a.nama)}`, grup: `Bidang ${labelBidang(a.bidang)}` }));
  // Rekening dinamis: semua rekening bisa dipakai dana apa pun.
  const rekList = meta.rekening;
  // Buka otomatis: ganti Dana sumber -> daftar Bidang terbuka; pilih Bidang -> daftar Program terbuka.
  const [bukaBidang, setBukaBidang] = useState(0);
  const [bukaProgram, setBukaProgram] = useState(0);
  useEffect(() => {
    // Pilihan lama dipertahankan bila masih berlaku (mis. saat edit); selain itu dikosongkan agar pengguna memilih
    // sendiri. Bidang yang tidak dimiliki dana baru dikembalikan ke "Semua bidang".
    setF((s) => {
      const bidang = s.bidang === TANPA_BIDANG && !jumlahPerBidang[TANPA_BIDANG] ? SEMUA_BIDANG : s.bidang;
      const daftar = programDana.filter((a) => bidang === SEMUA_BIDANG || (bidang === TANPA_BIDANG ? !a.bidang : a.bidang === bidang));
      return {
        ...s,
        bidang,
        jenis: !isCampaign ? "" : campaignOpsi.some((c) => c.kode === s.jenis) || campaignOpsi.length === 0 ? s.jenis : campaignOpsi[0]?.kode || "",
        akunId: daftar.some((a) => String(a.id) === String(s.akunId)) ? s.akunId : daftar.length === 1 ? daftar[0].id : "",
        rekId: rekList.some((r) => String(r.coaId) === String(s.rekId)) ? s.rekId : rekBawaan(rekList, dana),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.dana, campaign]);
  const gantiDana = (v) => {
    // Bidang terpilih dipertahankan saat dana sumber diganti.
    setF((s) => ({ ...s, dana: v, akunId: "", rekId: "" }));
    setBukaBidang((n) => n + 1);
  };
  const gantiBidang = (v) => {
    setF((s) => ({ ...s, bidang: v, akunId: "" }));
    setBukaProgram((n) => n + 1);
  };

  const akun = meta.akun.find((a) => String(a.id) === String(f.akunId));
  const rek = meta.rekening.find((r) => String(r.coaId) === String(f.rekId));
  // Wakaf disalurkan ke mauquf 'alaih; Zakat/Infaq/DSKL ke mustahik.
  const wakaf = f.dana === "WAKAF";
  const total = rows.reduce((s, r) => s + (r.jumlah || 0), 0);
  const ubah = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const baris = [
    { dana, akun: akun ? `${akun.kode} ${namaProgram(akun.nama)}` : null, debit: total },
    { dana, akun: rek ? labelRekening(rek) : null, kredit: total },
  ];
  const zakat = f.dana === "ZAKAT";
  const siap = total > 0 && akun && rek && (!isCampaign || f.jenis) && rows.every((r) => r.jumlah > 0 && r.nama.trim());

  const simpan = () =>
    kirim(
      {
        jenis: "PENYALURAN", tanggal: f.tanggal, danaKode: dana, keterangan: f.ket || null,
        campaignId: isCampaign && f.jenis ? Number(f.jenis) : null,
        lines: [{ coaId: akun.id, debit: total }, { coaId: rek.coaId, kredit: total }],
        penyaluran: rows.map((r) => ({
          // Penerima diketik manual (tidak lagi memilih dari daftar mustahik terdaftar).
          mustahikId: null, namaPenerima: r.nama.trim() || null,
          asnaf: r.asnaf || null, coaId: akun.id, jumlah: r.jumlah, jmlPenerima: r.jml || 1, keterangan: null,
        })),
      },
      () => { setF({ ...kosong, tanggal: f.tanggal, dana: f.dana, jenis: f.jenis, bidang: f.bidang }); setRows([barisKosong()]); },
      edit,
      onSelesai,
    );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal"><input type="date" max={today()} className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
          <Field label="Dana sumber">
            <select className={inputCls} value={f.dana} onChange={(e) => gantiDana(e.target.value)}>
              {danaOpsi.map((d) => <option key={d.kode} value={d.kode}>{d.nama}</option>)}
            </select>
          </Field>
        </div>
        {isCampaign && (
          campaignOpsi.length > 0 ? (
            <Field label="Jenis (campaign)" hint="Dibayar dari Dana Infaq Terikat milik campaign terpilih">
              <SearchSelect value={f.jenis} onChange={(v) => set("jenis", v)}
                options={campaignOpsi.map((c) => ({ value: c.kode, label: c.nama }))} placeholder="Cari campaign…" />
            </Field>
          ) : (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">Belum ada campaign.</div>
          )
        )}
        <Field label="Bidang" hint={adaBidang
          ? `Menyaring program ${namaDana(dana)} menurut bidangnya (diatur di COA).`
          : `Program ${namaDana(dana)} belum dipetakan ke bidang mana pun. Isi kolom Bidang program di Daftar Akun (COA).`}>
          <PilihGrup
            value={f.bidang}
            onChange={gantiBidang}
            options={bidangOpsi}
            buka={bukaBidang}
            placeholder="Pilih bidang…"
          />
        </Field>
        <Field label="Program / akun pendayagunaan" hint={zakat && akun ? `Asnaf bawaan program: ${akun.asnaf || "belum ditentukan (isi di rincian penerima atau lengkapi di COA)"}` : akun?.bidang ? `Bidang: ${labelBidang(akun.bidang)}` : undefined}>
          <PilihGrup
            value={f.akunId}
            onChange={(v) => set("akunId", v)}
            options={akunOpsi}
            buka={bukaProgram}
            placeholder={`Pilih program (${akunList.length} program ${namaDana(dana)})…`}
          />
        </Field>
        <Field label="Dibayar dari rekening" hint={HINT_REKENING}>
          <PilihGrup
            value={f.rekId}
            onChange={(v) => set("rekId", v)}
            options={opsiRekening(rekList)}
            placeholder={`Pilih rekening (${rekList.length} rekening)…`}
          />
        </Field>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
        <div className="text-sm text-gray-600">Total penyaluran: <b>{rp(total)}</b></div>
        <Pratinjau baris={baris} />
        <TombolSimpan edit={edit} onBatalEdit={onBatalEdit} disabled={!siap} onClick={simpan}>Simpan penyaluran</TombolSimpan>
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-600 mb-2">
          {wakaf ? "Rincian mauquf 'alaih (penerima manfaat wakaf)" : "Rincian penerima"} {zakat ? "(asnaf wajib)" : wakaf ? "" : "(asnaf opsional)"}
        </div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="border rounded-lg p-2 grid grid-cols-6 gap-2 bg-white">
              <input className={`${inputCls} col-span-6`} placeholder={wakaf ? "Nama mauquf 'alaih / lembaga" : "Nama penerima / lembaga"}
                value={r.nama} onChange={(e) => ubah(i, "nama", e.target.value)} />
              <div className="col-span-3"><Nominal value={r.jumlah} onChange={(v) => ubah(i, "jumlah", v)} /></div>
              <input type="number" min="1" className={`${inputCls} col-span-1`} title="Jumlah penerima" value={r.jml} onChange={(e) => ubah(i, "jml", parseInt(e.target.value, 10) || 1)} />
              {!wakaf ? (
                <select className={`${inputCls} col-span-2`} value={r.asnaf} onChange={(e) => ubah(i, "asnaf", e.target.value)} title="Asnaf penerima">
                  <option value="">{akun?.asnaf ? `(ikut program: ${akun.asnaf})` : zakat ? "asnaf…" : "asnaf (opsional)"}</option>
                  {meta.asnaf.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : <span className="col-span-2" />}
              <button type="button" className="text-red-500 text-xs col-span-6 text-right" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} disabled={rows.length === 1}>hapus baris</button>
            </div>
          ))}
        </div>
        <Btn color="gray" className="mt-2" onClick={() => setRows((rs) => [...rs, barisKosong()])}>+ Tambah penerima</Btn>
      </div>
    </div>
  );
}
FormPenyaluran.propTypes = {
  meta: PropTypes.object, campaign: PropTypes.array, awal: PropTypes.object, edit: PropTypes.object,
  onSelesai: PropTypes.func, onBatalEdit: PropTypes.func,
};

// ----------------------------------------------------------------------------------------------
function FormBeban({ meta, awal, edit, onSelesai, onBatalEdit }) {
  const kosong = { tanggal: today(), akunId: "", rekId: "", nominal: 0, ket: "" };
  const [f, setF] = useState(awal ? { ...kosong, ...awal } : kosong);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const akunList = akunDana(meta, "PENGELOLA", "BEBAN_OPERASIONAL");
  const rekList = meta.rekening;
  useEffect(() => {
    setF((s) => ({ ...s, akunId: s.akunId || akunList[0]?.id || "", rekId: s.rekId || rekBawaan(rekList, "PENGELOLA") }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const akun = meta.akun.find((a) => String(a.id) === String(f.akunId));
  const rek = meta.rekening.find((r) => String(r.coaId) === String(f.rekId));
  const baris = [
    { dana: "PENGELOLA", akun: akun ? `${akun.kode} ${akun.nama}` : null, debit: f.nominal },
    { dana: "PENGELOLA", akun: rek ? labelRekening(rek) : null, kredit: f.nominal },
  ];
  const simpan = () =>
    kirim(
      { jenis: "BEBAN_OPERASIONAL", tanggal: f.tanggal, danaKode: "PENGELOLA", keterangan: f.ket || null,
        lines: [{ coaId: akun.id, debit: f.nominal }, { coaId: rek.coaId, kredit: f.nominal }] },
      () => setF({ ...kosong, tanggal: f.tanggal, akunId: f.akunId, rekId: f.rekId }),
      edit,
      onSelesai,
    );
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <Field label="Tanggal"><input type="date" max={today()} className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
        <Field label="Akun beban">
          <SearchSelect
            value={f.akunId}
            onChange={(v) => set("akunId", v)}
            options={akunList.map((a) => ({ value: a.id, label: `${a.kode} ${a.nama}` }))}
            placeholder="Cari akun beban…"
          />
        </Field>
        <Field label="Dibayar dari rekening" hint={`${HINT_REKENING} Dicatat sebagai kas Dana Pengelola.`}>
          <PilihGrup
            value={f.rekId}
            onChange={(v) => set("rekId", v)}
            options={opsiRekening(rekList)}
            placeholder="Cari rekening…"
          />
        </Field>
        <Field label="Nominal (rupiah)"><Nominal value={f.nominal} onChange={(v) => set("nominal", v)} /></Field>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
      </div>
      <div className="space-y-3">
        <Pratinjau baris={baris} />
        <TombolSimpan edit={edit} onBatalEdit={onBatalEdit} disabled={!(f.nominal > 0 && akun && rek)} onClick={simpan}>Simpan beban</TombolSimpan>
      </div>
    </div>
  );
}
FormBeban.propTypes = { meta: PropTypes.object, awal: PropTypes.object, edit: PropTypes.object, onSelesai: PropTypes.func, onBatalEdit: PropTypes.func };

// ----------------------------------------------------------------------------------------------
function FormTransfer({ meta, awal, edit, onSelesai, onBatalEdit }) {
  const danaOpsi = meta.dana;
  const kosong = { tanggal: today(), asal: "ZAKAT", tujuan: "PENGELOLA", rekAsal: "", rekTujuan: "", nominal: 0, ket: "" };
  const [f, setF] = useState(awal ? { ...kosong, ...awal } : kosong);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const rekA = rekDana(meta, f.asal);
  const rekT = rekDana(meta, f.tujuan);
  useEffect(() => {
    setF((s) => ({
      ...s,
      rekAsal: rekA.some((r) => String(r.coaId) === String(s.rekAsal)) ? s.rekAsal : rekA.find((r) => !r.kas)?.coaId || rekA[0]?.coaId || "",
      rekTujuan: rekT.some((r) => String(r.coaId) === String(s.rekTujuan)) ? s.rekTujuan : rekT.find((r) => !r.kas)?.coaId || rekT[0]?.coaId || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.asal, f.tujuan]);
  const adA = antarDana(meta, f.asal);
  const adT = antarDana(meta, f.tujuan);
  const ra = meta.rekening.find((r) => String(r.coaId) === String(f.rekAsal));
  const rt = meta.rekening.find((r) => String(r.coaId) === String(f.rekTujuan));
  const baris = [
    { dana: f.asal, akun: adA ? `${adA.kode} ${adA.nama}` : null, debit: f.nominal },
    { dana: f.asal, akun: ra?.namaAkun, kredit: f.nominal },
    { dana: f.tujuan, akun: rt?.namaAkun, debit: f.nominal },
    { dana: f.tujuan, akun: adT ? `${adT.kode} ${adT.nama}` : null, kredit: f.nominal },
  ];
  const siap = f.nominal > 0 && f.asal !== f.tujuan && adA && adT && ra && rt;
  const simpan = () =>
    kirim(
      { jenis: "TRANSFER_DANA", tanggal: f.tanggal, danaKode: f.asal, keterangan: f.ket || `Transfer ${f.asal} ke ${f.tujuan}`,
        lines: [
          { coaId: adA.id, danaKode: f.asal, debit: f.nominal },
          { coaId: ra.coaId, danaKode: f.asal, kredit: f.nominal },
          { coaId: rt.coaId, danaKode: f.tujuan, debit: f.nominal },
          { coaId: adT.id, danaKode: f.tujuan, kredit: f.nominal },
        ] },
      () => setF({ ...kosong, tanggal: f.tanggal, asal: f.asal, tujuan: f.tujuan }),
      edit,
      onSelesai,
    );
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="bg-blue-50 text-blue-800 text-sm rounded p-2">
          Dipakai saat uang benar-benar berpindah antar dana (mis. menyapu hak amil dari rekening Zakat ke rekening Amil)
          dan untuk mengoreksi kebocoran antar-dana. Tiap dana tetap seimbang lewat akun Rekening Antar Dana.
        </div>
        <Field label="Tanggal"><input type="date" max={today()} className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dana asal">
            <select className={inputCls} value={f.asal} onChange={(e) => set("asal", e.target.value)}>
              {danaOpsi.map((d) => <option key={d.kode} value={d.kode}>{d.nama}</option>)}
            </select>
          </Field>
          <Field label="Dana tujuan">
            <select className={inputCls} value={f.tujuan} onChange={(e) => set("tujuan", e.target.value)}>
              {danaOpsi.map((d) => <option key={d.kode} value={d.kode}>{d.nama}</option>)}
            </select>
          </Field>
          <Field label="Rekening asal">
            <SearchSelect
              value={f.rekAsal}
              onChange={(v) => set("rekAsal", v)}
              options={rekA.map((r) => ({ value: r.coaId, label: `${r.kas ? "Kas: " : ""}${r.namaBank} ${r.noRek || ""}` }))}
              placeholder="Cari rekening…"
            />
          </Field>
          <Field label="Rekening tujuan">
            <SearchSelect
              value={f.rekTujuan}
              onChange={(v) => set("rekTujuan", v)}
              options={rekT.map((r) => ({ value: r.coaId, label: `${r.kas ? "Kas: " : ""}${r.namaBank} ${r.noRek || ""}` }))}
              placeholder="Cari rekening…"
            />
          </Field>
        </div>
        <Field label="Nominal (rupiah)"><Nominal value={f.nominal} onChange={(v) => set("nominal", v)} /></Field>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
      </div>
      <div className="space-y-3">
        <Pratinjau baris={baris} />
        {f.asal === f.tujuan && <div className="text-sm text-red-600">Dana asal dan tujuan harus berbeda.</div>}
        <TombolSimpan edit={edit} onBatalEdit={onBatalEdit} disabled={!siap} onClick={simpan}>Simpan transfer</TombolSimpan>
      </div>
    </div>
  );
}
FormTransfer.propTypes = { meta: PropTypes.object, awal: PropTypes.object, edit: PropTypes.object, onSelesai: PropTypes.func, onBatalEdit: PropTypes.func };

// ----------------------------------------------------------------------------------------------
/**
 * Mutasi Rekening: pindah buku antar rekening (mis. setor kas ke bank, pindah dari BSI ke BRI). Tanpa dana —
 * dicatat pada dana teknis MUTASI sehingga saldo dana mana pun tidak berubah, tidak masuk LPD, dan tidak dihitung
 * sebagai masuk/keluar dana. Pengganti Transfer Antar Dana untuk input baru (transfer lama tetap ada sebagai riwayat).
 */
const DANA_MUTASI = "MUTASI";

function FormMutasi({ meta, awal, edit, onSelesai, onBatalEdit }) {
  const kosong = { tanggal: today(), rekAsal: "", rekTujuan: "", nominal: 0, ket: "" };
  const [f, setF] = useState(awal ? { ...kosong, ...awal } : kosong);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const ra = meta.rekening.find((r) => String(r.coaId) === String(f.rekAsal));
  const rt = meta.rekening.find((r) => String(r.coaId) === String(f.rekTujuan));
  const sama = ra && rt && ra.coaId === rt.coaId;
  const baris = [
    { dana: DANA_MUTASI, akun: rt ? labelRekening(rt) : null, debit: f.nominal },
    { dana: DANA_MUTASI, akun: ra ? labelRekening(ra) : null, kredit: f.nominal },
  ];
  const siap = f.nominal > 0 && ra && rt && !sama;
  const simpan = () =>
    kirim(
      {
        jenis: "MUTASI_REKENING", tanggal: f.tanggal, danaKode: DANA_MUTASI,
        keterangan: f.ket || `Mutasi ${ra.namaBank || ra.namaAkun} ke ${rt.namaBank || rt.namaAkun}`,
        lines: [
          { coaId: rt.coaId, danaKode: DANA_MUTASI, debit: f.nominal },
          { coaId: ra.coaId, danaKode: DANA_MUTASI, kredit: f.nominal },
        ],
      },
      () => setF({ ...kosong, tanggal: f.tanggal, rekAsal: f.rekAsal, rekTujuan: f.rekTujuan }),
      edit,
      onSelesai,
    );
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="bg-blue-50 text-blue-800 text-sm rounded p-2">
          Untuk uang yang berpindah antar rekening/kas. Tidak memilih dana: saldo setiap dana tetap, tidak masuk Laporan
          Perubahan Dana, dan tidak dihitung sebagai dana masuk/keluar. Saldo kedua rekening tetap berubah.
        </div>
        <Field label="Tanggal"><input type="date" max={today()} className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
        <Field label="Dari rekening">
          <PilihGrup value={f.rekAsal} onChange={(v) => set("rekAsal", v)} options={opsiRekening(meta.rekening)} placeholder="Cari rekening asal…" />
        </Field>
        <Field label="Ke rekening">
          <PilihGrup value={f.rekTujuan} onChange={(v) => set("rekTujuan", v)} options={opsiRekening(meta.rekening)} placeholder="Cari rekening tujuan…" />
        </Field>
        <Field label="Nominal (rupiah)"><Nominal value={f.nominal} onChange={(v) => set("nominal", v)} /></Field>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} placeholder="mis. setor kas ke bank" /></Field>
      </div>
      <div className="space-y-3">
        <Pratinjau baris={baris} judul="Pratinjau jurnal mutasi" catatan="Dana MUTASI = penanda teknis, bukan dana sungguhan." />
        {sama && <div className="text-sm text-red-600">Rekening asal dan tujuan harus berbeda.</div>}
        <TombolSimpan edit={edit} onBatalEdit={onBatalEdit} disabled={!siap} onClick={simpan}>Simpan mutasi</TombolSimpan>
      </div>
    </div>
  );
}
FormMutasi.propTypes = { meta: PropTypes.object, awal: PropTypes.object, edit: PropTypes.object, onSelesai: PropTypes.func, onBatalEdit: PropTypes.func };

// ----------------------------------------------------------------------------------------------
/**
 * Pengembalian dana: sisa uang penyaluran/operasional yang dikembalikan (mis. dicairkan Rp1.000.000, terpakai
 * Rp800.000, kembali Rp200.000). Bukan penerimaan baru: penyaluran asal dikurangi di BULAN PENYALURAN ASAL tanpa
 * mengedit jurnal asal, dan tidak masuk LPD sebagai penerimaan. Rekening tujuan boleh berbeda dari rekening pengirim.
 */
const bulanLabel = (p) => {
  const [y, m] = String(p || "").split("-");
  return m ? `${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][Number(m) - 1]} ${y}` : p;
};

function FormPengembalian({ meta, onSelesai }) {
  const kosong = { tanggal: today(), asalId: "", rekId: "", nominal: 0, ket: "", diBulanBerjalan: false };
  const [f, setF] = useState(kosong);
  const [sumber, setSumber] = useState(null);
  const [muat, setMuat] = useState(0);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    let batal = false;
    keuangan.pengembalianSumber({ limit: 300 })
      .then((d) => { if (!batal) setSumber(d); })
      .catch((e) => { if (!batal) { setSumber([]); Swal.fire({ icon: "error", title: "Gagal memuat penyaluran", text: errMsg(e) }); } });
    return () => { batal = true; };
  }, [muat]);

  const asal = (sumber || []).find((x) => String(x.id) === String(f.asalId));
  const rek = meta.rekening.find((r) => String(r.coaId) === String(f.rekId));
  const sisa = asal ? Number(asal.sisa) || 0 : 0;
  const tglAsal = asal ? tglIso(asal.tanggal) : "";
  const periodeKembali = f.tanggal.slice(0, 7);
  const bulanSama = asal && asal.periode === periodeKembali;
  const asalTutup = asal && !!Number(asal.periodeTutup);
  const duaJurnal = asal && !bulanSama && !asalTutup;
  const opsi = (sumber || []).map((x) => ({
    value: x.id,
    label: `${x.nomorBukti} · ${tglIso(x.tanggal)} · ${rp(x.nilai)}`,
    grup: `Penyaluran ${bulanLabel(x.periode)}`,
    ket: [x.dana, x.akun, x.pihak || x.keterangan, `sisa ${rp(x.sisa)}`].filter(Boolean).join(" · "),
  }));
  const akunProgram = asal?.akun || "akun program asal";
  const piutang = `Piutang Pengembalian Penyaluran (${asal?.dana || "dana"})`;
  const baris = !asal ? [] : duaJurnal ? [
    { dana: asal.dana, akun: `[${tglAsal}] ${piutang}`, debit: f.nominal },
    { dana: asal.dana, akun: `[${tglAsal}] ${akunProgram}`, kredit: f.nominal },
    { dana: asal.dana, akun: `[${f.tanggal}] ${rek ? labelRekening(rek) : "rekening tujuan"}`, debit: f.nominal },
    { dana: asal.dana, akun: `[${f.tanggal}] ${piutang}`, kredit: f.nominal },
  ] : [
    { dana: asal.dana, akun: rek ? labelRekening(rek) : null, debit: f.nominal },
    { dana: asal.dana, akun: akunProgram, kredit: f.nominal },
  ];
  const salahTanggal = asal && f.tanggal < tglAsal;
  const lebih = asal && f.nominal > sisa;
  const perluCentang = asal && !bulanSama && asalTutup && !f.diBulanBerjalan;
  const siap = asal && rek && f.nominal > 0 && !lebih && !salahTanggal && !perluCentang;

  const simpan = async () => {
    try {
      const r = await keuangan.pengembalian({
        jurnalAsalId: asal.id, tanggal: f.tanggal, rekeningCoaId: rek.coaId, nominal: f.nominal,
        keterangan: f.ket || null, diBulanBerjalan: f.diBulanBerjalan,
      });
      const nomor = [...(r.alokasi || []), r.nomorBukti].join(" & ");
      await Swal.fire({
        icon: "success", title: "Pengembalian tersimpan",
        html: `<b>${nomor}</b>${r.peringatan?.length ? "<br/><small>" + r.peringatan.join("<br/>") + "</small>" : ""}`,
      });
      setF({ ...kosong, tanggal: f.tanggal, rekId: f.rekId });
      setMuat((x) => x + 1);
      onSelesai?.();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Pengembalian ditolak", text: errMsg(e) });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded p-2">
          Sisa uang penyaluran/operasional yang dikembalikan. <b>Bukan penerimaan baru</b>: penyaluran asal berkurang di
          bulan penyaluran asal (jurnal asal tidak diedit) dan tidak tampil sebagai penerimaan di LPD.
        </div>
        <Field label="Penyaluran asal" hint="Hanya penyaluran/beban yang masih punya sisa. Ketik no. bukti, nama penerima, atau keterangan.">
          <PilihGrup value={f.asalId} onChange={(v) => setF((s) => ({ ...s, asalId: v, nominal: 0, diBulanBerjalan: false }))}
            options={opsi} placeholder={sumber == null ? "Memuat…" : `Cari penyaluran (${opsi.length})…`} />
        </Field>
        {asal && (
          <div className="text-sm bg-gray-50 border rounded p-2 grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="text-gray-500">Dana / akun</span><span><DanaBadge dana={asal.dana} /> {asal.akun}</span>
            <span className="text-gray-500">Nilai penyaluran</span><span className="tabular-nums">{rp(asal.nilai)}</span>
            <span className="text-gray-500">Sudah dikembalikan</span><span className="tabular-nums">{rp(asal.sudahKembali)}</span>
            <span className="text-gray-500">Sisa bisa dikembalikan</span><span className="tabular-nums font-semibold">{rp(sisa)}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal uang kembali"><input type="date" max={today()} min={tglAsal || undefined} className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
          <Field label="Nominal dikembalikan"><Nominal value={f.nominal} onChange={(v) => set("nominal", v)} /></Field>
        </div>
        <Field label="Masuk ke rekening" hint="Boleh berbeda dengan rekening pengirim penyaluran.">
          <PilihGrup value={f.rekId} onChange={(v) => set("rekId", v)} options={opsiRekening(meta.rekening)} placeholder="Cari rekening…" />
        </Field>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} placeholder="mis. sisa dana kegiatan" /></Field>
        {asal && !bulanSama && asalTutup && (
          <label className="flex items-start gap-2 text-sm bg-red-50 border border-red-200 text-red-800 rounded p-2">
            <input type="checkbox" className="mt-1" checked={f.diBulanBerjalan} onChange={(e) => set("diBulanBerjalan", e.target.checked)} />
            <span>Periode {bulanLabel(asal.periode)} sudah ditutup, jadi penyaluran tidak bisa dikurangi di bulan itu.
              Centang untuk mencatat pengurangannya di bulan {bulanLabel(periodeKembali)}, atau buka kembali periodenya dulu.</span>
          </label>
        )}
      </div>
      <div className="space-y-3">
        <Pratinjau baris={baris} judul={duaJurnal ? "Pratinjau 2 jurnal pengembalian" : "Pratinjau jurnal pengembalian"}
          catatan={!asal ? null : duaJurnal
            ? `Jurnal 1 bertanggal penyaluran asal (${tglAsal}) mengurangi penyaluran ${bulanLabel(asal.periode)}; jurnal 2 mencatat uang masuk ${f.tanggal}.`
            : `Penyaluran berkurang di bulan ${bulanLabel(periodeKembali)}.`} />
        {salahTanggal && <div className="text-sm text-red-600">Tanggal pengembalian tidak boleh sebelum tanggal penyaluran ({tglAsal}).</div>}
        {lebih && <div className="text-sm text-red-600">Nominal melebihi sisa yang bisa dikembalikan ({rp(sisa)}).</div>}
        <TombolSimpan disabled={!siap} onClick={simpan}>Simpan pengembalian</TombolSimpan>
      </div>
    </div>
  );
}
FormPengembalian.propTypes = { meta: PropTypes.object, onSelesai: PropTypes.func };

// ----------------------------------------------------------------------------------------------
// Edit: ubah detail jurnal (GET /keuangan/jurnal/{id}) menjadi isian awal form. Mengembalikan null bila struktur
// jurnal tidak cocok dengan form (mis. jurnal impor/lama berbaris banyak) — koreksinya lewat Daftar Jurnal.

const tglIso = (v) => {
  if (v == null) return today();
  if (typeof v === "number") {
    const d = new Date(v);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return String(v).slice(0, 10);
};
const barisAktif = (d) => (d.baris || []).filter((b) => !Number(b.dihapus));
const debitDari = (b) => Number(b.debit) || 0;
const kreditDari = (b) => Number(b.kredit) || 0;
const pasangan = (d) => {
  const bs = barisAktif(d);
  if (bs.length !== 2) return null;
  const deb = bs.find((b) => debitDari(b) > 0);
  const kre = bs.find((b) => kreditDari(b) > 0);
  return deb && kre && deb !== kre ? { deb, kre } : null;
};
const benar = (v) => !!Number(v);

function keFormAwal(tpl, d, meta) {
  if (d.jenis !== tpl) return null;
  if (tpl === "PENERIMAAN") {
    const p2 = pasangan(d);
    if (!p2) return null;
    // Penerimaan barang (debit Persediaan Barang, bukan rekening) tidak diedit lewat form: batalkan lalu input ulang.
    if (!meta.rekening.some((r) => String(r.coaId) === String(p2.deb.coaId))) return null;
    const p = (d.penerimaan || [])[0] || {};
    const campaignId = p.campaign_id ?? d.campaignId;
    const dana = campaignId && d.dana === "INFAQ" ? CAMPAIGN : d.dana;
    const jenis = dana === CAMPAIGN ? String(campaignId)
      : (d.dana === "ZAKAT" ? p.jenis_zakat : d.dana === "WAKAF" ? p.jenis_wakaf : d.dana === "INFAQ" ? p.jenis_infaq : "") || "";
    return {
      tanggal: tglIso(d.tanggal), dana, jenis, akunId: p2.kre.coaId, rekId: p2.deb.coaId,
      donatur: p.donatur_nama || "", donaturId: p.donatur_id ?? null, anonim: benar(p.anonim), samarkan: benar(p.samarkan),
      metode: p.metode_bayar || "TRANSFER_BANK", nominal: debitDari(p2.deb), ket: d.keterangan || "", bukti: p.bukti_url || "",
    };
  }
  if (tpl === "PENYALURAN") {
    const p2 = pasangan(d);
    if (!p2) return null;
    const akun = meta.akun.find((a) => String(a.id) === String(p2.deb.coaId));
    const rows = (d.penyaluran || []).map((x) => ({
      mustahikId: x.mustahikId ? String(x.mustahikId) : "", nama: x.namaPenerima || x.penerima || "",
      asnaf: x.asnaf || "", jumlah: Number(x.jumlah) || 0, jml: x.jmlPenerima || 1,
    }));
    const dana = d.campaignId && d.dana === "INFAQ" ? CAMPAIGN : d.dana;
    return {
      tanggal: tglIso(d.tanggal), dana, jenis: dana === CAMPAIGN ? String(d.campaignId) : "",
      // Bidang ikut bidang program yang tersimpan (supaya program langsung terlihat di dropdown).
      bidang: akun ? akun.bidang || TANPA_BIDANG : SEMUA_BIDANG,
      akunId: p2.deb.coaId, rekId: p2.kre.coaId, ket: d.keterangan || "",
      rows: rows.length ? rows : [{ mustahikId: "", nama: "", asnaf: "", jumlah: debitDari(p2.deb), jml: 1 }],
    };
  }
  if (tpl === "BEBAN_OPERASIONAL") {
    const p2 = pasangan(d);
    if (!p2 || d.dana !== "PENGELOLA") return null;
    return { tanggal: tglIso(d.tanggal), akunId: p2.deb.coaId, rekId: p2.kre.coaId, nominal: debitDari(p2.deb), ket: d.keterangan || "" };
  }
  if (tpl === "MUTASI_REKENING") {
    const p2 = pasangan(d);
    if (!p2) return null;
    return { tanggal: tglIso(d.tanggal), rekAsal: p2.kre.coaId, rekTujuan: p2.deb.coaId, nominal: kreditDari(p2.kre), ket: d.keterangan || "" };
  }
  if (tpl === "TRANSFER_DANA") {
    // TRANSFER_DANA: 4 baris — dana asal (antar dana D / rekening K) dan dana tujuan (rekening D / antar dana K).
    const bs = barisAktif(d);
    if (bs.length !== 4) return null;
    const asal = d.dana;
    const bA = bs.filter((b) => b.dana === asal);
    const bT = bs.filter((b) => b.dana !== asal);
    const rekA = bA.find((b) => kreditDari(b) > 0);
    const rekT = bT.find((b) => debitDari(b) > 0);
    if (bA.length !== 2 || bT.length !== 2 || !rekA || !rekT) return null;
    return {
      tanggal: tglIso(d.tanggal), asal, tujuan: rekT.dana, rekAsal: rekA.coaId, rekTujuan: rekT.coaId,
      nominal: kreditDari(rekA), ket: d.keterangan || "",
    };
  }
  return null;
}

// ----------------------------------------------------------------------------------------------
// Tabel data yang sudah diinput (tepat di bawah form), per jenis template.

// ----------------------------------------------------------------------------------------------
// Tabel data yang sudah diinput (tepat di bawah form), per jenis template. Dipakai bersama keempat tab:
// filter periode (tgl awal–akhir), pagination dari server, detail saat no. bukti diklik, edit, dan batal jurnal.

const STATUS_WARNA = { POSTED: "bg-green-100 text-green-800", VOID: "bg-gray-200 text-gray-600", DRAFT: "bg-amber-100 text-amber-800" };
const STATUS_LABEL = { POSTED: "Aktif", VOID: "Dibatalkan", DRAFT: "Draft" };
const UKURAN_HALAMAN = [20, 50, 100];
const awalBulanIni = () => `${today().slice(0, 8)}01`;

/** Minta alasan lalu batalkan jurnal. Mengembalikan true bila berhasil. */
async function batalkanJurnal(j) {
  const k = await Swal.fire({
    icon: "warning",
    title: `Batalkan jurnal ${j.nomorBukti}?`,
    html: "Jurnal tidak dihapus, tetapi tidak dihitung lagi di laporan mana pun. Bila periodenya sudah ditutup, sistem membuat jurnal balik di periode berjalan.<br/><small>Jurnal alokasi hak amil milik penerimaan ini ikut dibatalkan.</small>",
    input: "text",
    inputLabel: "Alasan pembatalan",
    inputPlaceholder: "mis. salah input nominal",
    inputValidator: (v) => (!v || !v.trim() ? "Alasan wajib diisi" : undefined),
    showCancelButton: true,
    confirmButtonText: "Batalkan jurnal",
    confirmButtonColor: "#dc2626",
    cancelButtonText: "Kembali",
  });
  if (!k.isConfirmed) return false;
  try {
    const r = await keuangan.voidJurnal(j.id, k.value.trim());
    await Swal.fire({ icon: "success", title: "Jurnal dibatalkan", text: r?.pesan || "" });
    return true;
  } catch (e) {
    Swal.fire({ icon: "error", title: "Gagal membatalkan", text: errMsg(e) });
    return false;
  }
}

/** Rincian jurnal: akun, debet, kredit (+ rincian donatur/penerima). Dibuka dengan klik no. bukti. */
function DetailJurnal({ id, onClose, onEdit, onBatal, bisaEdit }) {
  const [d, setD] = useState(null);
  const [tampilHapus, setTampilHapus] = useState(false);
  useEffect(() => {
    keuangan.jurnalDetail(id).then(setD).catch((e) => { Swal.fire({ icon: "error", title: "Gagal memuat jurnal", text: errMsg(e) }); onClose(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const baris = (d?.baris || []).filter((b) => tampilHapus || !Number(b.dihapus));
  const adaHapus = (d?.baris || []).some((b) => Number(b.dihapus));
  const totD = baris.filter((b) => !Number(b.dihapus)).reduce((x, b) => x + (Number(b.debit) || 0), 0);
  const totK = baris.filter((b) => !Number(b.dihapus)).reduce((x, b) => x + (Number(b.kredit) || 0), 0);
  const pen = (d?.penerimaan || [])[0];
  return (
    <Modal title={d ? `Jurnal ${d.nomorBukti}` : "Memuat…"} onClose={onClose} wide>
      {!d ? <div className="text-gray-400">Memuat…</div> : (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div><div className="text-xs text-gray-500">Tanggal</div>{tglIso(d.tanggal)}</div>
            <div><div className="text-xs text-gray-500">Jenis</div>{NAMA_JENIS[d.jenis] || d.jenis}</div>
            <div><div className="text-xs text-gray-500">Dana</div><DanaBadge dana={d.dana} /></div>
            <div><div className="text-xs text-gray-500">Status</div><span className={`px-2 py-0.5 rounded text-xs ${STATUS_WARNA[d.status] || "bg-gray-100"}`}>{STATUS_LABEL[d.status] || d.status}</span></div>
          </div>
          {d.keterangan && <div><span className="text-xs text-gray-500">Keterangan: </span>{d.keterangan}</div>}
          {pen && <div><span className="text-xs text-gray-500">Donatur: </span>{pen.donatur_nama}{pen.metode_bayar ? ` · ${String(pen.metode_bayar).replace(/_/g, " ")}` : ""}</div>}
          <table className="w-full">
            <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
              <tr><th className="text-left py-1.5 px-2">Akun</th><th className="text-left px-2">Dana</th><th className="text-right px-2">Debet</th><th className="text-right px-2">Kredit</th></tr>
            </thead>
            <tbody>
              {baris.map((b) => (
                <tr key={b.id} className={`border-t ${Number(b.dihapus) ? "text-gray-400 line-through" : ""}`}>
                  <td className="py-1.5 px-2">{b.kode} {b.akun}</td>
                  <td className="px-2"><DanaBadge dana={b.dana} /></td>
                  <td className="px-2 text-right tabular-nums">{Number(b.debit) ? rp(b.debit) : ""}</td>
                  <td className="px-2 text-right tabular-nums">{Number(b.kredit) ? rp(b.kredit) : ""}</td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="py-1.5 px-2" colSpan={2}>Total</td>
                <td className="px-2 text-right tabular-nums">{rp(totD)}</td>
                <td className="px-2 text-right tabular-nums">{rp(totK)}</td>
              </tr>
            </tbody>
          </table>
          {adaHapus && (
            <label className="flex items-center gap-2 text-xs text-gray-500">
              <input type="checkbox" checked={tampilHapus} onChange={(e) => setTampilHapus(e.target.checked)} />
              Tampilkan baris lama (sebelum diedit / dibatalkan)
            </label>
          )}
          {(d.penyaluran || []).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Rincian penerima</div>
              <table className="w-full">
                <tbody>
                  {d.penyaluran.map((x) => (
                    <tr key={x.id} className="border-t">
                      <td className="py-1 px-2">{x.penerima || "-"}{x.asnaf ? <span className="text-xs text-gray-500"> · {x.asnaf}</span> : null}</td>
                      <td className="px-2 text-right tabular-nums">{rp(x.jumlah)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(d.pengembalian || []).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Pengembalian dana</div>
              <table className="w-full">
                <tbody>
                  {d.pengembalian.map((x) => (
                    <tr key={x.id} className={`border-t ${x.status === "BATAL" ? "text-gray-400 line-through" : ""}`}>
                      <td className="py-1 px-2">
                        {tglIso(x.tanggal)} · asal {x.asalNomorBukti} · pengurang {x.kurangNomorBukti}
                        {x.kasNomorBukti ? ` · kas ${x.kasNomorBukti}` : ""}
                        <span className="text-xs text-gray-500"> · {x.rekening}{x.keterangan ? ` · ${x.keterangan}` : ""}</span>
                      </td>
                      <td className="px-2 text-right tabular-nums">{rp(x.nominal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-xs text-gray-500 mt-1">Membatalkan salah satu jurnal pengembalian (atau penyaluran asalnya) ikut membatalkan pasangannya.</div>
            </div>
          )}
          {d.status === "POSTED" && (
            <div className="flex justify-end gap-2 pt-2">
              {bisaEdit && d.jenis !== "PENGEMBALIAN" && <Btn color="blue" onClick={() => { onClose(); onEdit({ id: d.id }); }}>Edit</Btn>}
              <Btn color="red" onClick={async () => { if (await batalkanJurnal({ id: d.id, nomorBukti: d.nomorBukti })) { onClose(); onBatal(d.id); } }}>Batalkan jurnal</Btn>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
DetailJurnal.propTypes = { id: PropTypes.number, onClose: PropTypes.func, onEdit: PropTypes.func, onBatal: PropTypes.func, bisaEdit: PropTypes.bool };

function RiwayatInput({ jenis, versi, edit, onEdit, onBatal }) {
  const [hasil, setHasil] = useState({ data: [], total: 0, page: 1, totalHalaman: 1 });
  const [q, setQ] = useState("");
  const [dari, setDari] = useState(awalBulanIni());
  const [sampai, setSampai] = useState(today());
  const [status, setStatus] = useState("POSTED");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [memuat, setMemuat] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [muatUlang, setMuatUlang] = useState(0);

  // Filter berubah -> kembali ke halaman 1.
  useEffect(() => { setPage(1); }, [jenis, q, dari, sampai, status, size]);

  useEffect(() => {
    if (dari && sampai && dari > sampai) return;
    const t = setTimeout(() => {
      setMemuat(true);
      keuangan.jurnalHalaman({
        jenis, q: q.trim() || undefined, from: dari || undefined, to: sampai || undefined,
        status: status || undefined, page, size,
      })
        .then(setHasil)
        .catch((e) => Swal.fire({ icon: "error", title: "Gagal memuat data", text: errMsg(e) }))
        .finally(() => setMemuat(false));
    }, 250);
    return () => clearTimeout(t);
  }, [jenis, q, dari, sampai, status, page, size, versi, muatUlang]);

  const setelahBatal = (id) => { setMuatUlang((x) => x + 1); onBatal(id); };
  const list = hasil.data || [];
  const nama = NAMA_JENIS[jenis] || jenis;
  const bisaEdit = jenis !== "PENGEMBALIAN";
  const mulai = hasil.total ? (hasil.page - 1) * hasil.size + 1 : 0;
  const akhir = Math.min(hasil.total, hasil.page * hasil.size);

  // Cetak PDF / Excel / CSV mengikuti jenis tab ini + rentang tanggal awal s.d. akhir + status + pencarian yang dipilih.
  const filterUnduh = { jenis, from: dari, to: sampai, q: q.trim(), status };
  const ketFilter = [`Jenis ${jenis}`, status && `Status ${status}`, q.trim() && `Cari "${q.trim()}"`].filter(Boolean).join(", ");
  const BATAS = 1000;
  const ambil = async () => {
    const semua = await keuangan.jurnal({ jenis, q: q.trim() || undefined, from: dari || undefined, to: sampai || undefined, status: status || undefined, limit: BATAS });
    if (!semua.length) throw new Error("Tidak ada jurnal pada rentang tanggal/filter ini.");
    if (semua.length >= BATAS) await Swal.fire("Dibatasi", `Hanya ${BATAS} jurnal teratas yang dimasukkan. Gunakan "Excel" untuk hasil lengkap atau persempit rentang tanggal.`, "info");
    return semua;
  };
  const jalan = (aksi) => async () => {
    try { await aksi(); } catch (e) { Swal.fire({ icon: "error", title: "Gagal", text: e?.response ? errMsg(e) : e.message }); }
  };
  const cetakPdf = jalan(async () => cetakDaftarJurnal(await ambil(), { rentang: teksRentang(dari, sampai), filter: ketFilter }));
  const unduhExcel = jalan(() => unduhExcelJurnal(filterUnduh));
  const unduhCsv = jalan(async () => {
    const rows = await ambil();
    const total = rows.filter((j) => j.status === "POSTED").reduce((a, j) => a + (Number(j.total) || 0), 0);
    simpanCsv([
      ...barisKopCsv(`DAFTAR JURNAL ${nama.toUpperCase()}`, [teksRentang(dari, sampai), ketFilter].join(" | ")),
      ["No", "No. Bukti", "Tanggal", "Dana", "Pihak", "Keterangan", "Status", "Nilai"],
      ...rows.map((j, i) => [i + 1, j.nomorBukti, tglIso(j.tanggal), j.dana, j.pihak, j.keterangan, j.status, Math.round(Number(j.total) || 0)]),
      ["", "", "", "", "", "", "Total (POSTED)", Math.round(total)],
    ], `Jurnal-${jenis}-${dari || "awal"}_sd_${sampai || "sekarang"}.csv`);
  });
  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <div className="font-semibold text-gray-700">Data {nama.toLowerCase()} yang sudah diinput</div>
          <div className="text-xs text-gray-500">Klik no. bukti untuk melihat akun, debet, dan kredit.</div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-gray-500">Cari
            <input className={`${inputCls} w-56`} placeholder="No. bukti / keterangan / nama…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <label className="text-xs text-gray-500">Tanggal awal
            <input type="date" className={`${inputCls} w-40`} value={dari} max={sampai || undefined} onChange={(e) => setDari(e.target.value)} />
          </label>
          <label className="text-xs text-gray-500">Tanggal akhir
            <input type="date" className={`${inputCls} w-40`} value={sampai} min={dari || undefined} onChange={(e) => setSampai(e.target.value)} />
          </label>
          <label className="text-xs text-gray-500">Status
            <select className={`${inputCls} w-32`} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="POSTED">Aktif</option>
              <option value="VOID">Dibatalkan</option>
              <option value="">Semua</option>
            </select>
          </label>
          {(dari || sampai) && (
            <button type="button" className="text-xs text-blue-600 hover:underline pb-3" onClick={() => { setDari(""); setSampai(""); }}>Semua tanggal</button>
          )}
          <Btn color="gray" onClick={cetakPdf}>Cetak PDF</Btn>
          <Btn color="gray" onClick={unduhExcel}>Excel</Btn>
          <Btn color="gray" onClick={unduhCsv}>CSV</Btn>
        </div>
      </div>
      {dari && sampai && dari > sampai && (
        <div className="text-sm text-red-600 mb-2">Tanggal awal tidak boleh sesudah tanggal akhir.</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th className="text-left py-2 px-2">Tanggal</th>
              <th className="text-left px-2">No. bukti</th>
              <th className="text-left px-2">Dana</th>
              <th className="text-left px-2">{jenis === "PENERIMAAN" ? "Donatur" : jenis === "PENYALURAN" ? "Penerima" : jenis === "MUTASI_REKENING" ? "-" : "Pihak"}</th>
              <th className="text-left px-2">Keterangan</th>
              <th className="text-right px-2">Nominal</th>
              <th className="text-center px-2">Status</th>
              <th className="text-right px-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((j) => (
              <tr key={j.id} className={`border-t ${edit?.id === j.id ? "bg-amber-50" : "hover:bg-gray-50"}`}>
                <td className="py-1.5 px-2 whitespace-nowrap">{tglIso(j.tanggal)}</td>
                <td className="px-2 whitespace-nowrap">
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => setDetailId(j.id)} title="Lihat akun, debet, kredit">{j.nomorBukti}</button>
                </td>
                <td className="px-2"><DanaBadge dana={j.dana} /></td>
                <td className="px-2">{j.pihak || ""}</td>
                <td className="px-2 max-w-xs truncate" title={j.keterangan || ""}>{j.keterangan || ""}</td>
                <td className="px-2 text-right tabular-nums whitespace-nowrap">{rp(j.total)}</td>
                <td className="px-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${STATUS_WARNA[j.status] || "bg-gray-100"}`}>{STATUS_LABEL[j.status] || j.status}</span></td>
                <td className="px-2 text-right whitespace-nowrap space-x-3">
                  {j.status === "POSTED" && (
                    edit?.id === j.id
                      ? <span className="text-xs text-amber-700">sedang diedit</span>
                      : <>
                        {bisaEdit && <button type="button" className="text-blue-600 hover:underline" onClick={() => onEdit(j)}>Edit</button>}
                        <button type="button" className="text-red-600 hover:underline" onClick={async () => { if (await batalkanJurnal(j)) setelahBatal(j.id); }}>Batal</button>
                      </>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={8} className="py-4 text-center text-gray-400">{memuat ? "Memuat…" : "Tidak ada data pada filter ini"}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-sm text-gray-600">
        <div>
          {hasil.total ? `Menampilkan ${mulai}–${akhir} dari ${hasil.total} jurnal` : ""}
          {memuat && list.length > 0 && <span className="text-gray-400"> · memuat…</span>}
        </div>
        <div className="flex items-center gap-2">
          <select className="border rounded px-2 py-1 text-sm" value={size} onChange={(e) => setSize(Number(e.target.value))} title="Baris per halaman">
            {UKURAN_HALAMAN.map((u) => <option key={u} value={u}>{u} / halaman</option>)}
          </select>
          <Btn color="gray" disabled={page <= 1 || memuat} onClick={() => setPage((x) => Math.max(1, x - 1))}>‹ Sebelumnya</Btn>
          <span>Hal. {hasil.page} dari {hasil.totalHalaman}</span>
          <Btn color="gray" disabled={page >= hasil.totalHalaman || memuat} onClick={() => setPage((x) => x + 1)}>Berikutnya ›</Btn>
        </div>
      </div>
      {detailId && (
        <DetailJurnal id={detailId} onClose={() => setDetailId(null)} onEdit={onEdit} onBatal={setelahBatal}
          bisaEdit={edit?.id !== detailId} />
      )}
    </div>
  );
}
RiwayatInput.propTypes = { jenis: PropTypes.string, versi: PropTypes.number, edit: PropTypes.object, onEdit: PropTypes.func, onBatal: PropTypes.func };

// ----------------------------------------------------------------------------------------------
export default function InputJurnal() {
  const dispatch = useDispatch();
  // Daftar campaign: endpoint & state Redux yang sama dengan "Jurnal Umum (lama)".
  const campaign = useSelector((state) => state.campaign.campaign);
  const [meta, setMeta] = useState(null);
  const [alokasi, setAlokasi] = useState([]);
  const [tpl, setTpl] = useState("PENERIMAAN");
  // Di tab Penerimaan: false = penerimaan dana baru, true = pengembalian dana (sisa penyaluran).
  const [kembali, setKembali] = useState(false);
  const [err, setErr] = useState("");
  const [edit, setEdit] = useState(null); // { id, nomorBukti, awal }
  const [versi, setVersi] = useState(0);
  const atas = useRef(null);

  const muatUlangJenisZakat = () =>
    keuangan.jenisZakat().then((list) => setMeta((m) => ({ ...m, jenisZakat: list })));

  useEffect(() => {
    keuangan.meta().then(setMeta).catch((e) => setErr(errMsg(e)));
    keuangan.alokasi().then(setAlokasi).catch(() => {});
    // Kebijakan hak amil dimuat ulang tiap kali jendela kembali aktif, supaya kebijakan yang baru ditambah
    // (di tab lain / lewat SQL) langsung terpakai tanpa refresh halaman.
    const muatAlokasi = () => keuangan.alokasi().then(setAlokasi).catch(() => {});
    window.addEventListener("focus", muatAlokasi);
    dispatch(getCategoryZiswaf("campaign"));
    return () => window.removeEventListener("focus", muatAlokasi);
  }, [dispatch]);

  const gantiTpl = (id) => { setEdit(null); setTpl(id); if (id !== "PENERIMAAN") setKembali(false); };
  const modeKembali = tpl === "PENERIMAAN" && kembali;
  const jenisRiwayat = modeKembali ? "PENGEMBALIAN" : tpl;
  const batalEdit = () => setEdit(null);
  const selesai = () => { setEdit(null); setVersi((v) => v + 1); };

  const mulaiEdit = async (j) => {
    try {
      const d = await keuangan.jurnalDetail(j.id);
      const awal = keFormAwal(tpl, d, meta);
      if (!awal) {
        Swal.fire({
          icon: "info",
          title: "Tidak bisa diedit lewat form",
          text: `Susunan baris jurnal ${d.nomorBukti} tidak sesuai form ${NAMA_JENIS[tpl] || tpl} (mis. jurnal impor/lama dengan banyak baris, atau penerimaan berupa barang). Koreksi dengan membatalkan jurnalnya lalu input ulang.`,
        });
        return;
      }
      setEdit({ id: j.id, nomorBukti: d.nomorBukti, awal });
      atas.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Gagal memuat jurnal", text: errMsg(e) });
    }
  };

  const form = useMemo(() => {
    if (!meta) return null;
    const k = `${tpl}-${edit?.id || "baru"}`;
    const umum = { meta, awal: edit?.awal, edit, onSelesai: selesai, onBatalEdit: batalEdit };
    if (tpl === "PENERIMAAN" && kembali) return <FormPengembalian key="kembali" meta={meta} onSelesai={selesai} />;
    if (tpl === "PENERIMAAN") return <FormPenerimaan key={k} {...umum} alokasi={alokasi} campaign={campaign} onJenisZakatBaru={muatUlangJenisZakat} />;
    if (tpl === "PENYALURAN") return <FormPenyaluran key={k} {...umum} campaign={campaign} />;
    if (tpl === "BEBAN_OPERASIONAL") return <FormBeban key={k} {...umum} />;
    if (tpl === "TRANSFER_DANA") return <FormTransfer key={k} {...umum} />;
    return <FormMutasi key={k} {...umum} />;
  }, [meta, tpl, kembali, alokasi, campaign, edit]);

  return (
    <div ref={atas}>
      <Judul>Input Jurnal</Judul>
      {err && <div className="bg-red-50 text-red-700 p-3 rounded mb-3">{err}</div>}
      <div className="flex flex-wrap gap-2 mb-4">
        {TEMPLATE.map((t) => (
          <button key={t.id} onClick={() => gantiTpl(t.id)}
            className={`text-left px-4 py-2 rounded-lg border transition ${tpl === t.id ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-blue-50"}`}>
            <div className="font-semibold text-sm">{t.nama}</div>
            <div className={`text-xs ${tpl === t.id ? "text-blue-100" : "text-gray-500"}`}>{t.info}</div>
          </button>
        ))}
      </div>
      {edit && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2 text-sm">
          <span>Mode edit: <b>{edit.nomorBukti}</b> — nomor bukti tetap; isi lama disimpan sebagai riwayat.</span>
          <Btn color="gray" onClick={batalEdit}>Batal edit</Btn>
        </div>
      )}
      {tpl === "PENERIMAAN" && !edit && (
        <div className="flex flex-wrap gap-2 mb-3" role="radiogroup" aria-label="Jenis penerimaan">
          {[[false, "Penerimaan dana baru", "Zakat, infaq, DSKL, campaign"], [true, "Pengembalian dana", "Sisa penyaluran/operasional yang dikembalikan"]].map(([v, n, info]) => (
            <button key={n} type="button" role="radio" aria-checked={kembali === v} onClick={() => setKembali(v)}
              className={`text-left px-3 py-1.5 rounded-lg border text-sm ${kembali === v ? "bg-green-600 text-white border-green-600" : "bg-white hover:bg-green-50"}`}>
              <div className="font-semibold">{n}</div>
              <div className={`text-xs ${kembali === v ? "text-green-100" : "text-gray-500"}`}>{info}</div>
            </button>
          ))}
        </div>
      )}
      <div className={`bg-white shadow rounded-lg p-4 ${edit ? "ring-2 ring-amber-300" : ""}`}>
        {form || <div className="text-gray-400">Memuat data referensi…</div>}
      </div>
      <RiwayatInput jenis={jenisRiwayat} versi={versi} edit={edit} onEdit={mulaiEdit}
        onBatal={(id) => { if (edit?.id === id) setEdit(null); }} />
    </div>
  );
}
