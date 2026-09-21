import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { keuangan, errMsg } from "../../services/keuanganApi";
import { Btn, Judul, Tabel } from "./ui";

export default function PeriodePage() {
  const [rows, setRows] = useState([]);
  const muat = useCallback(() => keuangan.periode().then(setRows).catch((e) => Swal.fire("Gagal", errMsg(e), "error")), []);
  useEffect(() => { muat(); }, [muat]);

  const periksa = async (p) => {
    try {
      const r = await keuangan.periksa(p);
      if (r.siapTutup) return Swal.fire("Siap ditutup", `Seluruh pemeriksaan periode ${p} lulus.`, "success");
      Swal.fire({ icon: "warning", title: `Periode ${p} belum siap`, html: `<ul style="text-align:left">${r.masalah.map((m) => `<li>• ${m}</li>`).join("")}</ul>` });
    } catch (e) { Swal.fire("Gagal", errMsg(e), "error"); }
  };

  const tutup = async (p) => {
    const ok = await Swal.fire({ title: `Tutup buku ${p}?`, text: "Setelah ditutup, jurnal pada periode ini tidak dapat ditambah/diubah. Koreksi dicatat di periode berjalan.", icon: "question", showCancelButton: true, confirmButtonText: "Tutup buku" });
    if (!ok.isConfirmed) return;
    try {
      const r = await keuangan.tutup(p);
      if (r.sukses) Swal.fire("Berhasil", `Periode ${p} ditutup dan saldo dana tersimpan.`, "success");
      else Swal.fire({ icon: "warning", title: "Tidak dapat ditutup", html: `<ul style="text-align:left">${r.masalah.map((m) => `<li>• ${m}</li>`).join("")}</ul>` });
      muat();
    } catch (e) { Swal.fire("Ditolak", errMsg(e), "error"); }
  };

  const buka = async (p) => {
    const { value: alasan, isConfirmed } = await Swal.fire({ title: `Buka kembali ${p}?`, text: "Periode setelahnya juga dibuka kembali. Tindakan ini dicatat di audit.", input: "text", inputLabel: "Alasan (wajib)", showCancelButton: true, confirmButtonText: "Buka kembali" });
    if (!isConfirmed) return;
    try { await keuangan.buka(p, alasan); muat(); } catch (e) { Swal.fire("Ditolak", errMsg(e), "error"); }
  };

  return (
    <div>
      <Judul>Periode & Tutup Buku</Judul>
      <p className="text-sm text-gray-500 mb-3">
        Tutup buku memeriksa: semua jurnal seimbang per dana, neraca tiap dana seimbang, lalu menyimpan saldo dana per
        periode. Periode harus ditutup berurutan.
      </p>
      <Tabel
        kolom={[
          { judul: "Periode", kunci: "periode" },
          { judul: "Jurnal", kanan: true, kunci: "jurnal" },
          { judul: "Status", tampil: (p) => <span className={`px-2 py-0.5 rounded text-xs ${p.status === "CLOSED" ? "bg-gray-800 text-white" : "bg-green-100 text-green-800"}`}>{p.status}</span> },
          { judul: "Ditutup", tampil: (p) => (p.closed_at ? String(p.closed_at).replace("T", " ").slice(0, 16) : "") },
          { judul: "Aksi", tampil: (p) => (
            <div className="flex gap-1">
              <Btn color="gray" onClick={() => periksa(p.periode)}>Periksa</Btn>
              {p.status === "OPEN" ? <Btn color="slate" onClick={() => tutup(p.periode)}>Tutup buku</Btn> : <Btn color="amber" onClick={() => buka(p.periode)}>Buka kembali</Btn>}
            </div>
          ) },
        ]}
        baris={rows}
      />
    </div>
  );
}
