import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { errMsg, pendaftarMobile } from "../../../services/keuanganApi";
import { Btn, Field, Modal, Tabel, inputCls } from "../../keuangan/ui";

const STATUS = [
  ["MENUNGGU", "Menunggu Verifikasi"],
  ["DISETUJUI", "Disetujui"],
  ["DITOLAK", "Ditolak"],
  ["SEMUA", "Semua"],
];

const PERAN = {
  KEUANGAN: "Finance / Admin Keuangan",
  DIREKTUR: "Direktur / Manajemen",
};

const WARNA_STATUS = {
  MENUNGGU: "bg-yellow-100 text-yellow-800",
  DISETUJUI: "bg-green-100 text-green-700",
  DITOLAK: "bg-red-100 text-red-700",
};

const tgl = (v) => (v ? String(v).replace("T", " ").slice(0, 16) : "-");

/**
 * Submenu Pengguna > Pendaftar Aplikasi: akun yang mendaftar lewat aplikasi mobile LAZIS SA.
 * Akun baru bisa login ke aplikasi setelah disetujui di sini (peran + akses ruang dipilih admin).
 */
export default function PendaftarMobile({ onJumlahBerubah }) {
  const [status, setStatus] = useState("MENUNGGU");
  const [data, setData] = useState(null);
  const [pilih, setPilih] = useState(null);

  const muat = useCallback(async () => {
    try {
      setData(null);
      setData(await pendaftarMobile.list(status));
      onJumlahBerubah?.();
    } catch (e) {
      setData([]);
      Swal.fire("Gagal memuat pendaftar", errMsg(e), "error");
    }
  }, [status, onJumlahBerubah]);

  useEffect(() => {
    muat();
  }, [muat]);

  const tolak = async (row) => {
    const res = await Swal.fire({
      title: `Tolak pendaftaran ${row.nama}?`,
      input: "text",
      inputLabel: "Alasan (opsional, ditampilkan saat pendaftar mencoba masuk)",
      showCancelButton: true,
      confirmButtonText: "Tolak",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });
    if (!res.isConfirmed) return;
    try {
      const r = await pendaftarMobile.tolak(row.id, res.value || null);
      Swal.fire("Ditolak", r?.message || "", "success");
      muat();
    } catch (e) {
      Swal.fire("Gagal", errMsg(e), "error");
    }
  };

  const kolom = [
    { judul: "No", tampil: (r) => data.indexOf(r) + 1 },
    { judul: "Nama", tampil: (r) => <span className="font-medium">{r.nama}</span> },
    { judul: "Email", kunci: "email" },
    { judul: "Handphone", kunci: "phoneNumber" },
    { judul: "Peran Diminta", tampil: (r) => PERAN[r.peranDiminta] || r.peranDiminta || "-" },
    { judul: "Tgl Daftar", tampil: (r) => tgl(r.didaftarAt) },
    {
      judul: "Status",
      tampil: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${WARNA_STATUS[r.status] || ""}`}>
          {r.status}
        </span>
      ),
    },
    {
      judul: "Keterangan",
      tampil: (r) =>
        r.status === "MENUNGGU" ? (
          "-"
        ) : (
          <div className="text-xs text-gray-500">
            {r.status === "DISETUJUI" && (
              <div>
                {PERAN[r.peran] || r.peran} · Ruang: {(r.ruang || []).join(", ") || "-"}
              </div>
            )}
            <div>
              oleh {r.diverifikasiOleh || "-"}, {tgl(r.diverifikasiAt)}
            </div>
            {r.catatan && <div>Catatan: {r.catatan}</div>}
          </div>
        ),
    },
    {
      judul: "Aksi",
      tampil: (r) =>
        r.status === "MENUNGGU" ? (
          <div className="flex gap-2">
            <Btn color="green" onClick={() => setPilih(r)}>
              Setujui
            </Btn>
            <Btn color="red" onClick={() => tolak(r)}>
              Tolak
            </Btn>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
        <div>
          <h1 className="text-start text-3xl font-bold">Pendaftar Aplikasi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Akun yang mendaftar lewat aplikasi mobile LAZIS SA. Akun baru dapat masuk ke aplikasi setelah
            disetujui.
          </p>
        </div>
        <div className="flex flex-wrap gap-1 items-center">
          {STATUS.map(([id, nama]) => (
            <button
              key={id}
              onClick={() => setStatus(id)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                status === id ? "bg-slate-800 text-white" : "bg-white border hover:bg-gray-50"
              }`}
            >
              {nama}
            </button>
          ))}
          <Btn color="gray" onClick={muat}>
            Muat ulang
          </Btn>
        </div>
      </div>

      {data === null ? (
        <p className="text-gray-400 py-6 text-center">Memuat…</p>
      ) : (
        <Tabel
          kolom={kolom}
          baris={data}
          kosong={status === "MENUNGGU" ? "Tidak ada pendaftar yang menunggu verifikasi" : "Tidak ada data"}
        />
      )}

      {pilih && (
        <ModalSetujui
          row={pilih}
          onClose={() => setPilih(null)}
          onSelesai={() => {
            setPilih(null);
            muat();
          }}
        />
      )}
    </div>
  );
}
PendaftarMobile.propTypes = { onJumlahBerubah: PropTypes.func };

function ModalSetujui({ row, onClose, onSelesai }) {
  const [peran, setPeran] = useState(row.peranDiminta === "DIREKTUR" ? "DIREKTUR" : "KEUANGAN");
  const [ruang, setRuang] = useState({
    UMUM: { aktif: true, input: row.peranDiminta !== "DIREKTUR" },
    WAKAF: { aktif: false, input: false },
  });
  const [catatan, setCatatan] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const direktur = peran === "DIREKTUR";

  const ubahRuang = (r, kunci, nilai) =>
    setRuang((s) => ({ ...s, [r]: { ...s[r], [kunci]: nilai } }));

  const simpan = async () => {
    const pilihan = Object.entries(ruang)
      .filter(([, v]) => v.aktif)
      .map(([r, v]) => ({ ruang: r, bolehInput: !direktur && v.input }));
    if (pilihan.length === 0) {
      Swal.fire("Belum lengkap", "Pilih minimal satu ruang untuk akun ini.", "warning");
      return;
    }
    try {
      setSibuk(true);
      const r = await pendaftarMobile.setujui(row.id, { peran, ruang: pilihan, catatan: catatan || null });
      Swal.fire("Disetujui", r?.message || "", "success");
      onSelesai();
    } catch (e) {
      Swal.fire("Gagal", errMsg(e), "error");
    } finally {
      setSibuk(false);
    }
  };

  return (
    <Modal title={`Setujui akun ${row.nama}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <div>{row.email}</div>
          <div>{row.phoneNumber}</div>
          <div>Peran yang diminta: {PERAN[row.peranDiminta] || row.peranDiminta}</div>
        </div>

        <Field label="Peran">
          <select className={inputCls} value={peran} onChange={(e) => setPeran(e.target.value)}>
            <option value="KEUANGAN">{PERAN.KEUANGAN}</option>
            <option value="DIREKTUR">{PERAN.DIREKTUR}</option>
          </select>
        </Field>

        <Field
          label="Akses ruang di aplikasi"
          hint={direktur ? "Direktur hanya dapat melihat (tanpa input)." : "Centang 'boleh input' bila akun boleh mencatat transaksi."}
        >
          <div className="space-y-2">
            {[
              ["UMUM", "Zakat, Infaq & DSKL"],
              ["WAKAF", "Wakaf"],
            ].map(([r, nama]) => (
              <div key={r} className="flex items-center justify-between border rounded-lg p-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={ruang[r].aktif}
                    onChange={(e) => ubahRuang(r, "aktif", e.target.checked)}
                  />
                  {nama}
                </label>
                <label className={`flex items-center gap-2 text-xs ${direktur || !ruang[r].aktif ? "text-gray-300" : "text-gray-600"}`}>
                  <input
                    type="checkbox"
                    disabled={direktur || !ruang[r].aktif}
                    checked={!direktur && ruang[r].aktif && ruang[r].input}
                    onChange={(e) => ubahRuang(r, "input", e.target.checked)}
                  />
                  boleh input
                </label>
              </div>
            ))}
          </div>
        </Field>

        <Field label="Catatan (opsional)">
          <input className={inputCls} value={catatan} onChange={(e) => setCatatan(e.target.value)} />
        </Field>

        <div className="flex justify-end gap-2">
          <Btn color="gray" onClick={onClose}>
            Batal
          </Btn>
          <Btn color="green" onClick={simpan} disabled={sibuk}>
            {sibuk ? "Menyimpan…" : "Setujui"}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
ModalSetujui.propTypes = {
  row: PropTypes.object,
  onClose: PropTypes.func,
  onSelesai: PropTypes.func,
};
