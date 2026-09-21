import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, DanaBadge, Judul, Tabel, inputCls, num, rp } from "./ui";

const RUANG = [
  { id: "ZAKAT", nama: "Ruang Zakat" },
  { id: "UMUM", nama: "Ruang Umum (Infaq & DSKL)" },
  { id: "WAKAF", nama: "Ruang Wakaf" },
];

export default function RekeningPage() {
  const [ruang, setRuang] = useState("ZAKAT");
  const [h, setH] = useState(null);
  const [master, setMaster] = useState([]);
  const [edit, setEdit] = useState({});

  const muat = useCallback(() => {
    keuangan.harian(ruang).then(setH).catch((e) => Swal.fire("Gagal", errMsg(e), "error"));
    keuangan.rekening().then(setMaster).catch(() => {});
  }, [ruang]);
  useEffect(() => { muat(); }, [muat]);

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
      <p className="text-sm text-gray-500 mb-3">
        Saldo bank diisi dari mutasi/m-banking (bila belum diisi, dipakai saldo buku besar). Saldo dana dihitung dari buku
        besar dan tidak diinput manual. Selisih menandakan dana yang tercatat di rekening/kas dana lain.
      </p>
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
          <h2 className="font-semibold mt-5 mb-2">Master rekening</h2>
          <Tabel
            kolom={[
              { judul: "Kode", kunci: "kode" },
              { judul: "Akun", kunci: "namaAkun" },
              { judul: "Bank", tampil: (m) => `${m.kodeBank} · ${m.namaBank}` },
              { judul: "No. (tersamar)", kunci: "noRek" },
              { judul: "Dana", tampil: (m) => <DanaBadge dana={m.dana} /> },
              { judul: "Kas", tampil: (m) => (m.kas ? "ya" : "") },
            ]}
            baris={master.map((m) => ({ ...m, id: m.coaId }))}
          />
        </>
      )}
    </div>
  );
}
