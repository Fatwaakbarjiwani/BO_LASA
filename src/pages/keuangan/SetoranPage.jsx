import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Judul, inputCls, num } from "./ui";

const angka = (v) => parseInt(String(v).replace(/\D/g, ""), 10) || 0;

export default function SetoranPage() {
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState([]);
  const [unitBaru, setUnitBaru] = useState("");

  const muat = useCallback(() => keuangan.setoran(periode).then(setRows).catch((e) => Swal.fire("Gagal", errMsg(e), "error")), [periode]);
  useEffect(() => { muat(); }, [muat]);

  const ubah = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const simpan = async (r) => {
    try {
      await keuangan.setoranSimpan(periode, r.unitId, { zakat: angka(r.zakat), infaq: angka(r.infaq), hakAmil: angka(r.hakAmil), sudahSetor: !!r.sudahSetor });
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: `${r.nama} tersimpan`, showConfirmButton: false, timer: 1500 });
    } catch (e) { Swal.fire("Ditolak", errMsg(e), "error"); }
  };
  const tambah = async () => {
    if (!unitBaru.trim()) return;
    await keuangan.unitBaru(unitBaru.trim());
    setUnitBaru("");
    muat();
  };

  const tot = (k) => rows.reduce((s, r) => s + angka(r[k]), 0);
  return (
    <div>
      <Judul aksi={<input type="month" className={inputCls} value={periode} onChange={(e) => setPeriode(e.target.value)} />}>Setoran Internal (Rekap ZIS DSKL)</Judul>
      <p className="text-sm text-gray-500 mb-3">Setoran ZIS dari unit-unit YBWSA per periode (langkah 3 Laporan Harian di aplikasi mobile).</p>
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-xs uppercase text-gray-600">
            <tr><th className="text-left p-2">Unit</th><th className="text-right p-2">Zakat</th><th className="text-right p-2">Infaq</th><th className="text-right p-2">Hak amil</th><th className="p-2">Sudah setor</th><th /></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-400">Belum ada unit. Tambahkan unit di bawah.</td></tr>}
            {rows.map((r, i) => (
              <tr key={r.unitId} className="border-t">
                <td className="p-2">{r.nama}</td>
                {["zakat", "infaq", "hakAmil"].map((k) => (
                  <td key={k} className="p-1"><input inputMode="numeric" className={`${inputCls} text-right`} value={num(angka(r[k]))} onChange={(e) => ubah(i, k, e.target.value)} /></td>
                ))}
                <td className="text-center"><input type="checkbox" checked={!!Number(r.sudahSetor) || r.sudahSetor === true} onChange={(e) => ubah(i, "sudahSetor", e.target.checked)} /></td>
                <td className="p-1"><Btn onClick={() => simpan(r)}>Simpan</Btn></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold">
            <tr><td className="p-2">Total</td><td className="p-2 text-right">{num(tot("zakat"))}</td><td className="p-2 text-right">{num(tot("infaq"))}</td><td className="p-2 text-right">{num(tot("hakAmil"))}</td><td colSpan={2} /></tr>
          </tfoot>
        </table>
      </div>
      <div className="flex gap-2 mt-3">
        <input className={inputCls} placeholder="Nama unit baru (mis. Unissula)" value={unitBaru} onChange={(e) => setUnitBaru(e.target.value)} />
        <Btn color="gray" onClick={tambah}>+ Unit</Btn>
      </div>
    </div>
  );
}
