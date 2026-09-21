import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Field, Judul, inputCls, num, rp, today } from "./ui";

const TEMPLATE = [
  { id: "PENERIMAAN", nama: "Penerimaan", info: "Zakat, Infaq, DSKL, Wakaf masuk" },
  { id: "PENYALURAN", nama: "Penyaluran", info: "Pendayagunaan ke mustahik / program" },
  { id: "BEBAN_OPERASIONAL", nama: "Beban Operasional", info: "Biaya kantor dari Dana Pengelola" },
  { id: "TRANSFER_DANA", nama: "Transfer Antar Dana", info: "Perpindahan kas antar dana" },
];

const akunDana = (meta, dana, kelompok) =>
  meta.akun.filter((a) => a.dana === dana && a.kelompok === kelompok && a.postable);
const rekDana = (meta, dana) => meta.rekening.filter((r) => r.dana === dana);
const antarDana = (meta, dana) =>
  meta.akun.find((a) => a.kelompok === "ANTAR_DANA" && a.dana === dana);

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

function Pratinjau({ baris }) {
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
      <div className="text-sm font-semibold text-gray-600 mb-2">
        Pratinjau jurnal (per dana)
      </div>
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
Pratinjau.propTypes = { baris: PropTypes.array };

async function kirim(cmd, reset) {
  try {
    const r = await keuangan.postJurnal(cmd);
    const extra = [
      ...(r.alokasi?.length ? [`Alokasi hak amil: ${r.alokasi.join(", ")}`] : []),
      ...(r.peringatan || []),
    ];
    await Swal.fire({
      icon: extra.length ? "info" : "success",
      title: "Jurnal tersimpan",
      html: `<b>${r.nomorBukti}</b>${extra.length ? "<br/><small>" + extra.join("<br/>") + "</small>" : ""}`,
    });
    reset();
  } catch (e) {
    Swal.fire({ icon: "error", title: "Jurnal ditolak", text: errMsg(e) });
  }
}

// ----------------------------------------------------------------------------------------------
function FormPenerimaan({ meta, alokasi }) {
  const danaOpsi = meta.dana.filter((d) => d.kode !== "PENGELOLA");
  const kosong = {
    tanggal: today(), dana: "ZAKAT", jenis: "FITRAH", akunId: "", rekId: "", donatur: "", donaturId: null,
    anonim: false, samarkan: false, metode: "TRANSFER_BANK", nominal: 0, campaignId: "", ket: "", bukti: "",
  };
  const [f, setF] = useState(kosong);
  const [saran, setSaran] = useState([]);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const akunList = akunDana(meta, f.dana, "PENERIMAAN");
  const rekList = rekDana(meta, f.dana);
  const jenisList = f.dana === "ZAKAT" ? meta.jenisZakat : f.dana === "WAKAF" ? meta.jenisWakaf : f.dana === "INFAQ" ? meta.jenisInfaq : [];

  useEffect(() => {
    const cocok = akunList.find((a) => (a.jenisPenerimaan || "") === (f.dana === "INFAQ" ? (f.jenis === "TERIKAT" ? "TERIKAT" : "TIDAK_TERIKAT") : f.jenis));
    setF((s) => ({
      ...s,
      jenis: jenisList.includes(s.jenis) ? s.jenis : jenisList[0] || "",
      akunId: cocok ? cocok.id : akunList[0]?.id || "",
      rekId: rekList.some((r) => String(r.coaId) === String(s.rekId)) ? s.rekId : rekList.find((r) => !r.kas)?.coaId || rekList[0]?.coaId || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.dana, f.jenis]);

  useEffect(() => {
    if (f.donatur.length < 2) return setSaran([]);
    const t = setTimeout(() => keuangan.donatur(f.donatur).then(setSaran).catch(() => {}), 250);
    return () => clearTimeout(t);
  }, [f.donatur]);

  const akun = meta.akun.find((a) => String(a.id) === String(f.akunId));
  const rek = meta.rekening.find((r) => String(r.coaId) === String(f.rekId));
  const persen = alokasi.find((a) => a.dana === f.dana && a.aktif && (!a.jenis || a.jenis === f.jenis));

  const baris = [
    { dana: f.dana, akun: rek?.namaAkun, debit: f.nominal },
    { dana: f.dana, akun: akun ? `${akun.kode} ${akun.nama}` : null, kredit: f.nominal },
  ];
  const siap = f.nominal > 0 && akun && rek && f.donatur.trim();

  const simpan = () =>
    kirim(
      {
        jenis: "PENERIMAAN", tanggal: f.tanggal, danaKode: f.dana, keterangan: f.ket || null,
        lines: [
          { coaId: rek.coaId, debit: f.nominal },
          { coaId: akun.id, kredit: f.nominal },
        ],
        penerimaan: {
          donaturId: f.donaturId, donaturNama: f.donatur.trim(), donaturTipe: "INDIVIDU",
          anonim: f.anonim, samarkan: f.samarkan,
          jenisZakat: f.dana === "ZAKAT" ? f.jenis : null, jenisWakaf: f.dana === "WAKAF" ? f.jenis : null,
          jenisInfaq: f.dana === "INFAQ" ? f.jenis : null, metodeBayar: f.metode,
          campaignId: f.campaignId ? Number(f.campaignId) : null, buktiUrl: f.bukti || null,
        },
      },
      () => setF({ ...kosong, tanggal: f.tanggal, dana: f.dana }),
    );

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
        {jenisList.length > 0 && (
          <Field label={f.dana === "ZAKAT" ? "Jenis zakat" : f.dana === "WAKAF" ? "Jenis wakaf" : "Jenis infaq"}>
            <select className={inputCls} value={f.jenis} onChange={(e) => set("jenis", e.target.value)}>
              {jenisList.map((j) => <option key={j} value={j}>{j.replace("_", " & ")}</option>)}
            </select>
          </Field>
        )}
        <Field label="Akun penerimaan">
          <select className={inputCls} value={f.akunId} onChange={(e) => set("akunId", e.target.value)}>
            {akunList.map((a) => <option key={a.id} value={a.id}>{a.kode} {a.nama}</option>)}
          </select>
        </Field>
        <Field label="Masuk ke rekening" hint="Hanya rekening milik dana terpilih yang ditampilkan">
          <select className={inputCls} value={f.rekId} onChange={(e) => set("rekId", e.target.value)}>
            {rekList.map((r) => <option key={r.coaId} value={r.coaId}>{r.kas ? "Kas: " : ""}{r.namaBank} {r.noRek}</option>)}
          </select>
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
          {f.dana === "INFAQ" && (
            <Field label="Campaign (opsional)">
              <select className={inputCls} value={f.campaignId} onChange={(e) => set("campaignId", e.target.value)}>
                <option value="">—</option>
                {meta.campaign.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
              </select>
            </Field>
          )}
        </div>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
        <Pratinjau baris={baris} />
        {persen && f.nominal > 0 && (
          <div className="text-sm bg-amber-50 border border-amber-200 rounded p-2 text-amber-800">
            Hak amil {persen.persen}% ({rp(Math.round((f.nominal * persen.persen) / 100))}) akan dijurnalkan otomatis
            dari {f.dana} ke Dana Pengelola.
          </div>
        )}
        <Btn color="green" disabled={!siap} onClick={simpan} className="w-full">Simpan penerimaan</Btn>
      </div>
    </div>
  );
}
FormPenerimaan.propTypes = { meta: PropTypes.object, alokasi: PropTypes.array };

// ----------------------------------------------------------------------------------------------
function FormPenyaluran({ meta }) {
  const danaOpsi = meta.dana.filter((d) => d.kode !== "PENGELOLA");
  const kosong = { tanggal: today(), dana: "ZAKAT", akunId: "", rekId: "", ket: "" };
  const [f, setF] = useState(kosong);
  const [rows, setRows] = useState([{ mustahikId: "", nama: "", asnaf: "", jumlah: 0, jml: 1 }]);
  const [mustahik, setMustahik] = useState([]);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => { keuangan.mustahik({}).then(setMustahik).catch(() => {}); }, []);

  const akunList = akunDana(meta, f.dana, "PENDAYAGUNAAN");
  const rekList = rekDana(meta, f.dana);
  useEffect(() => {
    setF((s) => ({
      ...s,
      akunId: akunList.some((a) => String(a.id) === String(s.akunId)) ? s.akunId : akunList[0]?.id || "",
      rekId: rekList.some((r) => String(r.coaId) === String(s.rekId)) ? s.rekId : rekList.find((r) => !r.kas)?.coaId || rekList[0]?.coaId || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.dana]);

  const akun = meta.akun.find((a) => String(a.id) === String(f.akunId));
  const rek = meta.rekening.find((r) => String(r.coaId) === String(f.rekId));
  const total = rows.reduce((s, r) => s + (r.jumlah || 0), 0);
  const ubah = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const pilihMustahik = (i, id) => {
    const m = mustahik.find((x) => String(x.id) === String(id));
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, mustahikId: id, nama: m ? m.nama : r.nama, asnaf: m?.asnaf || r.asnaf } : r)));
  };

  const baris = [
    { dana: f.dana, akun: akun ? `${akun.kode} ${akun.nama}` : null, debit: total },
    { dana: f.dana, akun: rek?.namaAkun, kredit: total },
  ];
  const zakat = f.dana === "ZAKAT";
  const siap = total > 0 && akun && rek && rows.every((r) => r.jumlah > 0 && (r.mustahikId || r.nama.trim()));

  const simpan = () =>
    kirim(
      {
        jenis: "PENYALURAN", tanggal: f.tanggal, danaKode: f.dana, keterangan: f.ket || null,
        lines: [{ coaId: akun.id, debit: total }, { coaId: rek.coaId, kredit: total }],
        penyaluran: rows.map((r) => ({
          mustahikId: r.mustahikId ? Number(r.mustahikId) : null, namaPenerima: r.nama || null,
          asnaf: r.asnaf || null, coaId: akun.id, jumlah: r.jumlah, jmlPenerima: r.jml || 1, keterangan: null,
        })),
      },
      () => { setF({ ...kosong, tanggal: f.tanggal, dana: f.dana }); setRows([{ mustahikId: "", nama: "", asnaf: "", jumlah: 0, jml: 1 }]); },
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
        <Field label="Program / akun pendayagunaan" hint={zakat && akun ? `Asnaf akun ini: ${akun.asnaf || "belum ditentukan (lengkapi di COA)"}` : akun?.bidang ? `Bidang: ${akun.bidang}` : undefined}>
          <select className={inputCls} value={f.akunId} onChange={(e) => set("akunId", e.target.value)}>
            {akunList.map((a) => <option key={a.id} value={a.id}>{a.kode} {a.nama}</option>)}
          </select>
        </Field>
        <Field label="Dibayar dari rekening">
          <select className={inputCls} value={f.rekId} onChange={(e) => set("rekId", e.target.value)}>
            {rekList.map((r) => <option key={r.coaId} value={r.coaId}>{r.kas ? "Kas: " : ""}{r.namaBank} {r.noRek}</option>)}
          </select>
        </Field>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
        <div className="text-sm text-gray-600">Total penyaluran: <b>{rp(total)}</b></div>
        <Pratinjau baris={baris} />
        <Btn color="green" disabled={!siap} onClick={simpan} className="w-full">Simpan penyaluran</Btn>
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-600 mb-2">Rincian penerima {zakat && "(asnaf wajib)"}</div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="border rounded-lg p-2 grid grid-cols-6 gap-2 bg-white">
              <select className={`${inputCls} col-span-3`} value={r.mustahikId} onChange={(e) => pilihMustahik(i, e.target.value)}>
                <option value="">— mustahik terdaftar —</option>
                {mustahik.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)}
              </select>
              <input className={`${inputCls} col-span-3`} placeholder="atau ketik nama / lembaga" value={r.nama} onChange={(e) => ubah(i, "nama", e.target.value)} />
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
FormPenyaluran.propTypes = { meta: PropTypes.object };

// ----------------------------------------------------------------------------------------------
function FormBeban({ meta }) {
  const kosong = { tanggal: today(), akunId: "", rekId: "", nominal: 0, ket: "" };
  const [f, setF] = useState(kosong);
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
    );
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <Field label="Tanggal"><input type="date" max={today()} className={inputCls} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} /></Field>
        <Field label="Akun beban">
          <select className={inputCls} value={f.akunId} onChange={(e) => set("akunId", e.target.value)}>
            {akunList.map((a) => <option key={a.id} value={a.id}>{a.kode} {a.nama}</option>)}
          </select>
        </Field>
        <Field label="Dibayar dari rekening (Dana Pengelola)">
          <select className={inputCls} value={f.rekId} onChange={(e) => set("rekId", e.target.value)}>
            {rekList.map((r) => <option key={r.coaId} value={r.coaId}>{r.kas ? "Kas: " : ""}{r.namaBank} {r.noRek}</option>)}
          </select>
        </Field>
        <Field label="Nominal (rupiah)"><Nominal value={f.nominal} onChange={(v) => set("nominal", v)} /></Field>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
      </div>
      <div className="space-y-3">
        <Pratinjau baris={baris} />
        <Btn color="green" disabled={!(f.nominal > 0 && akun && rek)} onClick={simpan} className="w-full">Simpan beban</Btn>
      </div>
    </div>
  );
}
FormBeban.propTypes = { meta: PropTypes.object };

// ----------------------------------------------------------------------------------------------
function FormTransfer({ meta }) {
  const danaOpsi = meta.dana;
  const kosong = { tanggal: today(), asal: "ZAKAT", tujuan: "PENGELOLA", rekAsal: "", rekTujuan: "", nominal: 0, ket: "" };
  const [f, setF] = useState(kosong);
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
            <select className={inputCls} value={f.rekAsal} onChange={(e) => set("rekAsal", e.target.value)}>
              {rekA.map((r) => <option key={r.coaId} value={r.coaId}>{r.kas ? "Kas: " : ""}{r.namaBank} {r.noRek}</option>)}
            </select>
          </Field>
          <Field label="Rekening tujuan">
            <select className={inputCls} value={f.rekTujuan} onChange={(e) => set("rekTujuan", e.target.value)}>
              {rekT.map((r) => <option key={r.coaId} value={r.coaId}>{r.kas ? "Kas: " : ""}{r.namaBank} {r.noRek}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Nominal (rupiah)"><Nominal value={f.nominal} onChange={(v) => set("nominal", v)} /></Field>
        <Field label="Keterangan"><input className={inputCls} value={f.ket} onChange={(e) => set("ket", e.target.value)} /></Field>
      </div>
      <div className="space-y-3">
        <Pratinjau baris={baris} />
        {f.asal === f.tujuan && <div className="text-sm text-red-600">Dana asal dan tujuan harus berbeda.</div>}
        <Btn color="green" disabled={!siap} onClick={simpan} className="w-full">Simpan transfer</Btn>
      </div>
    </div>
  );
}
FormTransfer.propTypes = { meta: PropTypes.object };

// ----------------------------------------------------------------------------------------------
export default function InputJurnal() {
  const [meta, setMeta] = useState(null);
  const [alokasi, setAlokasi] = useState([]);
  const [tpl, setTpl] = useState("PENERIMAAN");
  const [err, setErr] = useState("");

  useEffect(() => {
    keuangan.meta().then(setMeta).catch((e) => setErr(errMsg(e)));
    keuangan.alokasi().then(setAlokasi).catch(() => {});
  }, []);

  const form = useMemo(() => {
    if (!meta) return null;
    if (tpl === "PENERIMAAN") return <FormPenerimaan key={tpl} meta={meta} alokasi={alokasi} />;
    if (tpl === "PENYALURAN") return <FormPenyaluran key={tpl} meta={meta} />;
    if (tpl === "BEBAN_OPERASIONAL") return <FormBeban key={tpl} meta={meta} />;
    return <FormTransfer key={tpl} meta={meta} />;
  }, [meta, tpl, alokasi]);

  return (
    <div>
      <Judul>Input Jurnal</Judul>
      {err && <div className="bg-red-50 text-red-700 p-3 rounded mb-3">{err}</div>}
      <div className="flex flex-wrap gap-2 mb-4">
        {TEMPLATE.map((t) => (
          <button key={t.id} onClick={() => setTpl(t.id)}
            className={`text-left px-4 py-2 rounded-lg border transition ${tpl === t.id ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-blue-50"}`}>
            <div className="font-semibold text-sm">{t.nama}</div>
            <div className={`text-xs ${tpl === t.id ? "text-blue-100" : "text-gray-500"}`}>{t.info}</div>
          </button>
        ))}
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        {form || <div className="text-gray-400">Memuat data referensi…</div>}
      </div>
    </div>
  );
}
