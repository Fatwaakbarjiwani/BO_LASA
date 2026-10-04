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
  { id: "PENERIMAAN", nama: "Penerimaan", info: "Zakat, Infaq, DSKL, Wakaf masuk" },
  { id: "PENYALURAN", nama: "Penyaluran", info: "Pendayagunaan ke mustahik / program" },
  { id: "BEBAN_OPERASIONAL", nama: "Beban Operasional", info: "Biaya kantor dari Dana Pengelola" },
  { id: "TRANSFER_DANA", nama: "Transfer Antar Dana", info: "Perpindahan kas antar dana" },
];

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
const rekDana = (meta, dana) => meta.rekening.filter((r) => r.dana === dana);
const antarDana = (meta, dana) =>
  meta.akun.find((a) => a.kelompok === "ANTAR_DANA" && a.dana === dana);

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

/** Opsi rekening untuk dropdown yang bisa dicari. */
const opsiRekening = (list) =>
  list.map((r) => ({ value: r.coaId, label: `${r.kas ? "Kas: " : ""}${r.namaBank || ""} ${r.noRek || ""}`.trim() + (r.namaAkun ? ` — ${r.namaAkun}` : "") }));

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
  };
  const [f, setF] = useState(awal ? { ...kosong, ...awal } : kosong);
  const [saran, setSaran] = useState([]);
  // Akun penerimaan dipilih otomatis hanya saat dana/jenis benar-benar berubah, supaya akun hasil muat-edit
  // (atau pilihan manual) tidak tertimpa ketika daftar campaign selesai dimuat.
  const sebelum = useRef(awal ? { dana: awal.dana, jenis: awal.jenis } : null);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const isCampaign = f.dana === CAMPAIGN;
  const dana = danaPosting(f.dana);
  const akunList = akunDana(meta, dana, "PENERIMAAN");
  const rekList = rekDana(meta, dana);
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
      rekId: rekList.some((r) => String(r.coaId) === String(s.rekId)) ? s.rekId : rekList.find((r) => !r.kas)?.coaId || rekList[0]?.coaId || "",
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

  const baris = [
    { dana, akun: rek?.namaAkun, debit: f.nominal },
    { dana, akun: akun ? `${akun.kode} ${akun.nama}` : null, kredit: f.nominal },
  ];
  const siap = f.nominal > 0 && akun && rek && f.donatur.trim() && (!isCampaign || f.jenis);

  // Potongan hak amil (dibulatkan ke rupiah, sama dengan server) dan jurnal alokasinya.
  const amilPersen = persen && dana !== "PENGELOLA" ? Number(persen.persen) : 0;
  const amil = amilPersen > 0 && f.nominal > 0 ? Math.round((f.nominal * amilPersen) / 100) : 0;
  const akunAmil = amil > 0 ? akunAlokasiAmil(meta, dana) : null;
  const amilJalan = amil > 0 && akunAmil.kurang.length === 0;
  const barisAmil = amilJalan ? [
    { dana, akun: labelAkun(akunAmil.bagian), debit: amil },
    { dana, akun: labelAkun(akunAmil.antarSumber), kredit: amil },
    { dana: "PENGELOLA", akun: labelAkun(akunAmil.antarPengelola), debit: amil },
    { dana: "PENGELOLA", akun: labelAkun(akunAmil.penerimaanAmil), kredit: amil },
  ] : [];

  const simpan = async () => {
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
        <Field label="Masuk ke rekening" hint="Ketik nama bank / nomor rekening untuk mencari. Hanya rekening milik dana terpilih yang ditampilkan.">
          <SearchSelect
            value={f.rekId}
            onChange={(v) => set("rekId", v)}
            options={opsiRekening(rekList)}
            placeholder="Cari bank / no. rekening…"
          />
        </Field>
        <Field label="Nominal (rupiah)"><Nominal value={f.nominal} onChange={(v) => set("nominal", v)} /></Field>
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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Metode bayar">
            <select className={inputCls} value={f.metode} onChange={(e) => set("metode", e.target.value)}>
              {meta.metodeBayar.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
        <Pratinjau baris={baris} judul="Pratinjau jurnal penerimaan (per dana)" />
        {amil > 0 && (
          <div className="text-sm bg-amber-50 border border-amber-200 rounded p-3 text-amber-900 space-y-1">
            <div className="font-semibold">Potongan hak amil {amilPersen}%</div>
            <table className="w-full tabular-nums">
              <tbody>
                <tr><td>Penerimaan bruto</td><td className="text-right">{rp(f.nominal)}</td></tr>
                <tr><td>Hak amil {amilPersen}% × {rp(f.nominal)}</td><td className="text-right">− {rp(amil)}</td></tr>
                <tr className="border-t border-amber-200 font-semibold"><td>Bersih untuk Dana {dana}</td><td className="text-right">{rp(f.nominal - amil)}</td></tr>
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
        <TombolSimpan edit={edit} onBatalEdit={onBatalEdit} disabled={!siap} onClick={simpan}>Simpan penerimaan</TombolSimpan>
      </div>
    </div>
  );
}
FormPenerimaan.propTypes = {
  meta: PropTypes.object, alokasi: PropTypes.array, campaign: PropTypes.array, onJenisZakatBaru: PropTypes.func,
  awal: PropTypes.object, edit: PropTypes.object, onSelesai: PropTypes.func, onBatalEdit: PropTypes.func,
};

// ----------------------------------------------------------------------------------------------
function FormPenyaluran({ meta, campaign, awal, edit, onSelesai, onBatalEdit }) {
  const danaOpsi = [...meta.dana.filter((d) => d.kode !== "PENGELOLA"), OPSI_CAMPAIGN];
  const kosong = { tanggal: today(), dana: "ZAKAT", jenis: "", akunId: "", rekId: "", ket: "" };
  const [f, setF] = useState(awal ? { ...kosong, ...awal, rows: undefined } : kosong);
  const [rows, setRows] = useState(awal?.rows?.length ? awal.rows : [{ mustahikId: "", nama: "", asnaf: "", jumlah: 0, jml: 1 }]);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const isCampaign = f.dana === CAMPAIGN;
  const dana = danaPosting(f.dana);
  const campaignOpsi = opsiCampaign(campaign);
  const akunList = akunDana(meta, dana, "PENDAYAGUNAAN");
  const rekList = rekDana(meta, dana);
  useEffect(() => {
    setF((s) => ({
      ...s,
      jenis: !isCampaign ? "" : campaignOpsi.some((c) => c.kode === s.jenis) || campaignOpsi.length === 0 ? s.jenis : campaignOpsi[0]?.kode || "",
      akunId: akunList.some((a) => String(a.id) === String(s.akunId)) ? s.akunId : akunList[0]?.id || "",
      rekId: rekList.some((r) => String(r.coaId) === String(s.rekId)) ? s.rekId : rekList.find((r) => !r.kas)?.coaId || rekList[0]?.coaId || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.dana, campaign]);

  const akun = meta.akun.find((a) => String(a.id) === String(f.akunId));
  const rek = meta.rekening.find((r) => String(r.coaId) === String(f.rekId));
  // Wakaf disalurkan ke mauquf 'alaih; Zakat/Infaq/DSKL ke mustahik.
  const wakaf = f.dana === "WAKAF";
  const total = rows.reduce((s, r) => s + (r.jumlah || 0), 0);
  const ubah = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const baris = [
    { dana, akun: akun ? `${akun.kode} ${akun.nama}` : null, debit: total },
    { dana, akun: rek?.namaAkun, kredit: total },
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
      () => { setF({ ...kosong, tanggal: f.tanggal, dana: f.dana, jenis: f.jenis }); setRows([{ mustahikId: "", nama: "", asnaf: "", jumlah: 0, jml: 1 }]); },
      edit,
      onSelesai,
    );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal"><input type="date" max={today()} className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
          <Field label="Dana sumber">
            <select className={inputCls} value={f.dana} onChange={(e) => set("dana", e.target.value)}>
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
        <Field label="Program / akun pendayagunaan" hint={zakat && akun ? `Asnaf akun ini: ${akun.asnaf || "belum ditentukan (lengkapi di COA)"}` : akun?.bidang ? `Bidang: ${akun.bidang}` : undefined}>
          <SearchSelect
            value={f.akunId}
            onChange={(v) => set("akunId", v)}
            options={akunList.map((a) => ({ value: a.id, label: `${a.kode} ${a.nama}` }))}
            placeholder="Cari akun pendayagunaan…"
          />
        </Field>
        <Field label="Dibayar dari rekening">
          <SearchSelect
            value={f.rekId}
            onChange={(v) => set("rekId", v)}
            options={rekList.map((r) => ({ value: r.coaId, label: `${r.kas ? "Kas: " : ""}${r.namaBank} ${r.noRek || ""}` }))}
            placeholder="Cari rekening…"
          />
        </Field>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
        <div className="text-sm text-gray-600">Total penyaluran: <b>{rp(total)}</b></div>
        <Pratinjau baris={baris} />
        <TombolSimpan edit={edit} onBatalEdit={onBatalEdit} disabled={!siap} onClick={simpan}>Simpan penyaluran</TombolSimpan>
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-600 mb-2">
          {wakaf ? "Rincian mauquf 'alaih (penerima manfaat wakaf)" : "Rincian penerima"} {zakat && "(asnaf wajib)"}
        </div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="border rounded-lg p-2 grid grid-cols-6 gap-2 bg-white">
              <input className={`${inputCls} col-span-6`} placeholder={wakaf ? "Nama mauquf 'alaih / lembaga" : "Nama penerima / lembaga"}
                value={r.nama} onChange={(e) => ubah(i, "nama", e.target.value)} />
              <div className="col-span-3"><Nominal value={r.jumlah} onChange={(v) => ubah(i, "jumlah", v)} /></div>
              <input type="number" min="1" className={`${inputCls} col-span-1`} title="Jumlah penerima" value={r.jml} onChange={(e) => ubah(i, "jml", parseInt(e.target.value, 10) || 1)} />
              {zakat ? (
                <select className={`${inputCls} col-span-2`} value={r.asnaf} onChange={(e) => ubah(i, "asnaf", e.target.value)}>
                  <option value="">{akun?.asnaf ? `(ikut akun: ${akun.asnaf})` : "asnaf…"}</option>
                  {meta.asnaf.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : <span className="col-span-2" />}
              <button type="button" className="text-red-500 text-xs col-span-6 text-right" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} disabled={rows.length === 1}>hapus baris</button>
            </div>
          ))}
        </div>
        <Btn color="gray" className="mt-2" onClick={() => setRows((rs) => [...rs, { mustahikId: "", nama: "", asnaf: "", jumlah: 0, jml: 1 }])}>+ Tambah penerima</Btn>
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
  const rekList = rekDana(meta, "PENGELOLA");
  useEffect(() => {
    setF((s) => ({ ...s, akunId: s.akunId || akunList[0]?.id || "", rekId: s.rekId || rekList.find((r) => !r.kas)?.coaId || rekList[0]?.coaId || "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const akun = meta.akun.find((a) => String(a.id) === String(f.akunId));
  const rek = meta.rekening.find((r) => String(r.coaId) === String(f.rekId));
  const baris = [
    { dana: "PENGELOLA", akun: akun ? `${akun.kode} ${akun.nama}` : null, debit: f.nominal },
    { dana: "PENGELOLA", akun: rek?.namaAkun, kredit: f.nominal },
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
        <Field label="Dibayar dari rekening (Dana Pengelola)">
          <SearchSelect
            value={f.rekId}
            onChange={(v) => set("rekId", v)}
            options={rekList.map((r) => ({ value: r.coaId, label: `${r.kas ? "Kas: " : ""}${r.namaBank} ${r.noRek || ""}` }))}
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

function keFormAwal(tpl, d) {
  if (d.jenis !== tpl) return null;
  if (tpl === "PENERIMAAN") {
    const p2 = pasangan(d);
    if (!p2) return null;
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
    const dana = d.campaignId && d.dana === "INFAQ" ? CAMPAIGN : d.dana;
    const rows = (d.penyaluran || []).map((x) => ({
      mustahikId: x.mustahikId ? String(x.mustahikId) : "", nama: x.namaPenerima || x.penerima || "",
      asnaf: x.asnaf || "", jumlah: Number(x.jumlah) || 0, jml: x.jmlPenerima || 1,
    }));
    return {
      tanggal: tglIso(d.tanggal), dana, jenis: dana === CAMPAIGN ? String(d.campaignId) : "",
      akunId: p2.deb.coaId, rekId: p2.kre.coaId, ket: d.keterangan || "",
      rows: rows.length ? rows : [{ mustahikId: "", nama: "", asnaf: "", jumlah: debitDari(p2.deb), jml: 1 }],
    };
  }
  if (tpl === "BEBAN_OPERASIONAL") {
    const p2 = pasangan(d);
    if (!p2 || d.dana !== "PENGELOLA") return null;
    return { tanggal: tglIso(d.tanggal), akunId: p2.deb.coaId, rekId: p2.kre.coaId, nominal: debitDari(p2.deb), ket: d.keterangan || "" };
  }
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
            <div><div className="text-xs text-gray-500">Jenis</div>{TEMPLATE.find((t) => t.id === d.jenis)?.nama || d.jenis}</div>
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
          {d.status === "POSTED" && (
            <div className="flex justify-end gap-2 pt-2">
              {bisaEdit && <Btn color="blue" onClick={() => { onClose(); onEdit({ id: d.id }); }}>Edit</Btn>}
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
  const nama = TEMPLATE.find((t) => t.id === jenis)?.nama || jenis;
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
              <th className="text-left px-2">{jenis === "PENERIMAAN" ? "Donatur" : jenis === "PENYALURAN" ? "Penerima" : "Pihak"}</th>
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
                        <button type="button" className="text-blue-600 hover:underline" onClick={() => onEdit(j)}>Edit</button>
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

  const gantiTpl = (id) => { setEdit(null); setTpl(id); };
  const batalEdit = () => setEdit(null);
  const selesai = () => { setEdit(null); setVersi((v) => v + 1); };

  const mulaiEdit = async (j) => {
    try {
      const d = await keuangan.jurnalDetail(j.id);
      const awal = keFormAwal(tpl, d);
      if (!awal) {
        Swal.fire({
          icon: "info",
          title: "Tidak bisa diedit lewat form",
          text: `Susunan baris jurnal ${d.nomorBukti} tidak sesuai form ${TEMPLATE.find((t) => t.id === tpl)?.nama} (mis. jurnal impor/lama dengan banyak baris). Koreksi lewat Daftar Jurnal: batalkan lalu input ulang.`,
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
    if (tpl === "PENERIMAAN") return <FormPenerimaan key={k} {...umum} alokasi={alokasi} campaign={campaign} onJenisZakatBaru={muatUlangJenisZakat} />;
    if (tpl === "PENYALURAN") return <FormPenyaluran key={k} {...umum} campaign={campaign} />;
    if (tpl === "BEBAN_OPERASIONAL") return <FormBeban key={k} {...umum} />;
    return <FormTransfer key={k} {...umum} />;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, tpl, alokasi, campaign, edit]);

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
      <div className={`bg-white shadow rounded-lg p-4 ${edit ? "ring-2 ring-amber-300" : ""}`}>
        {form || <div className="text-gray-400">Memuat data referensi…</div>}
      </div>
      <RiwayatInput jenis={tpl} versi={versi} edit={edit} onEdit={mulaiEdit}
        onBatal={(id) => { if (edit?.id === id) setEdit(null); }} />
    </div>
  );
}
