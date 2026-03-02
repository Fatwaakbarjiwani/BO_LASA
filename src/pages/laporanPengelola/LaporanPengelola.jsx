import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { getLaporanPengelola } from "../../redux/actions/transaksiAction";
import logo from "../../assets/logo2.png";
import { OrbitProgress } from "react-loading-indicators";

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

const MONTH_LABELS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getMonthKey(month, year) {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function getLastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function formatRupiah(val) {
  if (val == null || val === "") return "-";
  const n = Number(val);
  if (isNaN(n)) return "-";
  const s = Math.abs(n).toFixed(2).replace(".", ",");
  const parts = s.split(",");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const result = parts.join(".");
  return n < 0 ? `(${result})` : result;
}

function stripLabelCode(label) {
  if (!label || typeof label !== "string") return label;
  return label.replace(/^\d+\s+/, "").trim();
}

const KopSurat = ({ logoSrc }) => (
  <div className="flex items-center gap-6 mb-6">
    <img
      src={logoSrc}
      alt="LAZIS SULTAN AGUNG"
      className="w-28 h-auto shrink-0"
    />
    <div className="flex-1 text-center">
      <h1 className="text-xl font-bold text-black">LAZIS SULTAN AGUNG</h1>
      <p className="text-sm text-black mt-1">Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah</p>
      <p className="text-sm text-black">Info : Telp. +62 24 6583584</p>
      <a
        href="https://lazis-sa.org/"
        target="_blank"
        rel="noreferrer"
        className="text-sm text-blue-600 underline hover:text-blue-800"
      >
        https://lazis-sa.org/
      </a>
    </div>
  </div>
);
KopSurat.propTypes = { logoSrc: PropTypes.string.isRequired };

export default function LaporanPengelola() {
  const dispatch = useDispatch();
  const { laporanPengelola } = useSelector((state) => state.summary);
  const [month1, setMonth1] = useState("");
  const [year1, setYear1] = useState("");
  const [month2, setMonth2] = useState("");
  const [year2, setYear2] = useState("");
  const [isLoading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 2021 + 1 },
    (_, i) => 2021 + i
  );

  const hasData = month1 && month2 && year1 && year2 && !isLoading;
  const canDownload = hasData && Object.keys(laporanPengelola || {}).length > 0;

  const handleDownload = () => {
    if (!canDownload) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Perubahan Dana Pengelola</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; }
            .kop { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
            .kop img { width: 112px; height: auto; }
            .kop-text { flex: 1; text-align: center; }
            .kop-text h1 { font-size: 20px; font-weight: bold; margin: 0 0 4px 0; }
            .kop-text p { font-size: 14px; margin: 2px 0; }
            .kop-text a { color: #2563eb; text-decoration: underline; font-size: 14px; }
            hr { border: 1px solid #000; margin: 16px 0; }
            .title { text-align: center; font-size: 16px; font-weight: bold; margin: 16px 0; }
            .subtitle { text-align: center; font-size: 14px; margin: 4px 0; }
            .note { text-align: center; font-size: 12px; color: #666; margin: 16px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #333; padding: 6px 12px; }
            th { background: #e2e8f0; font-weight: 600; }
            .pl-6 { padding-left: 24px; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .underline { text-decoration: underline; }
            .bg-slate-50 { background: #f8fafc; }
            .bg-slate-100 { background: #e2e8f0; }
            .bg-slate-200 { background: #cbd5e1; }
          </style>
        </head>
        <body>
          <div class="kop">
            <img src="${logo}" alt="LAZIS SULTAN AGUNG" />
            <div class="kop-text">
              <h1>LAZIS SULTAN AGUNG</h1>
              <p>Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah</p>
              <p>Info : Telp. +62 24 6583584</p>
              <a href="https://lazis-sa.org/" target="_blank">https://lazis-sa.org/</a>
            </div>
          </div>
          <hr />
          <div class="title">LAPORAN PERUBAHAN DANA PENGELOLA</div>
          <div class="subtitle">UNTUK BULAN YANG BERAKHIR PER ${date1.toUpperCase()}</div>
          <div class="subtitle">Dengan Angka Perbandingan Untuk Bulan ${date2}</div>
          <div class="note">(Dinyatakan Dalam Rupiah Kecuali Dinyatakan Lain)</div>
          <table>
            <thead><tr><th>DANA OPERASIONAL</th><th>CATATAN</th><th>${date1}</th><th>${date2}</th></tr></thead>
            <tbody id="tbody"></tbody>
          </table>
          <p class="note" style="margin-top: 24px;">(Catatan Atas Laporan Keuangan yang merupakan bagian yang tidak terpisahkan dari laporan secara keseluruhan)</p>
        </body>
      </html>
    `);
    const tbody = win.document.getElementById("tbody");
    if (!tbody) {
      win.document.close();
      return;
    }
    const rows = [
      { label: "I. PENERIMAAN DANA PENGELOLA", section: true },
      ...penerimaanItems.map(([label, data]) => ({
        label: stripLabelCode(label),
        v1: typeof data === "object" ? data?.[key1] : null,
        v2: typeof data === "object" ? data?.[key2] : null,
      })),
      {
        label: "Jumlah Penerimaan Dana Pengelola",
        v1: getPenerimaanTotal(key1),
        v2: getPenerimaanTotal(key2),
        bold: true,
        underline: true,
      },
      { label: "II. PENDAYAGUNAAN DANA PENGELOLA", section: true },
      ...pendayagunaanItems.map(([label, data]) => ({
        label: stripLabelCode(label),
        v1: typeof data === "object" ? -Math.abs(Number(data?.[key1] ?? 0)) : null,
        v2: typeof data === "object" ? -Math.abs(Number(data?.[key2] ?? 0)) : null,
      })),
      {
        label: "Jumlah Pendayagunaan Dana Pengelola",
        v1: (() => {
          const v = pendayagunaan[`Total Bulan ${key1}`];
          return v != null ? -Math.abs(Number(v)) : null;
        })(),
        v2: (() => {
          const v = pendayagunaan[`Total Bulan ${key2}`];
          return v != null ? -Math.abs(Number(v)) : null;
        })(),
        bold: true,
        underline: true,
      },
      {
        label: "III. SURPLUS (DEFISIT) DANA PENGELOLA",
        v1: laporanPengelola?.[`Surplus (Defisit) Dana ${key1}`],
        v2: laporanPengelola?.[`Surplus (Defisit) Dana ${key2}`],
        bold: true,
        underline: true,
      },
      {
        label: "IV. SALDO AWAL DANA PENGELOLA",
        v1: laporanPengelola?.[`Saldo Awal Dana ${key1}`],
        v2: laporanPengelola?.[`Saldo Awal Dana ${key2}`],
      },
      { label: "V. KOREKSI DANA PENGELOLA", v1: null, v2: null },
      {
        label: "VI. SALDO AKHIR DANA PENGELOLA",
        v1: laporanPengelola?.[`Saldo Akhir Dana ${key1}`],
        v2: laporanPengelola?.[`Saldo Akhir Dana ${key2}`],
        bold: true,
        underline: true,
        double: true,
      },
    ];
    rows.forEach((r) => {
      const tr = win.document.createElement("tr");
      const cls = r.section ? "bg-slate-50 font-bold" : r.bold ? "bg-slate-100 font-bold" : "";
      tr.className = cls;
      const tdLabel = win.document.createElement("td");
      tdLabel.innerHTML = r.label;
      if (r.section) tdLabel.colSpan = 4;
      else {
        tdLabel.className = r.label.startsWith("  ") ? "pl-6" : "";
        if (r.underline) tdLabel.classList.add("underline");
        if (r.double) tdLabel.classList.add("underline");
      }
      tr.appendChild(tdLabel);
      if (!r.section) {
        const tdCatatan = win.document.createElement("td");
        tdCatatan.textContent = "-";
        tdCatatan.style.textAlign = "center";
        tr.appendChild(tdCatatan);
        [r.v1, r.v2].forEach((v) => {
          const td = win.document.createElement("td");
          td.className = "text-right";
          td.textContent = formatRupiah(v);
          if (r.underline) td.classList.add("underline");
          tr.appendChild(td);
        });
      }
      tbody.appendChild(tr);
    });
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  useEffect(() => {
    if (month1 && month2 && year1 && year2) {
      setLoading(true);
      dispatch(
        getLaporanPengelola(Number(month1), Number(month2), year1, year2)
      ).finally(() => setLoading(false));
    }
  }, [dispatch, month1, month2, year1, year2]);

  const key1 = month1 && year1 ? getMonthKey(Number(month1), year1) : null;
  const key2 = month2 && year2 ? getMonthKey(Number(month2), year2) : null;

  const date1 =
    month1 && year1
      ? `${getLastDayOfMonth(Number(year1), Number(month1))} ${MONTH_LABELS[Number(month1) - 1]} ${year1}`
      : "";
  const date2 =
    month2 && year2
      ? `${getLastDayOfMonth(Number(year2), Number(month2))} ${MONTH_LABELS[Number(month2) - 1]} ${year2}`
      : "";

  const root = laporanPengelola || {};
  const pendayagunaan = root["Pendayagunaan Pengelola"] || {};

  const penerimaan = (() => {
    const nested = root["Penerimaan Dana Pengelola"];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return nested;
    }
    const collected = {};
    Object.entries(root).forEach(([k, v]) => {
      if (
        k.startsWith("Penerimaan") &&
        k !== "Penerimaan Dana Pengelola" &&
        typeof v === "object" &&
        v !== null &&
        !Array.isArray(v)
      ) {
        collected[k] = v;
      }
    });
    return collected;
  })();

  const PENERIMAAN_STANDAR = [
    "Penerimaan Dana Amil",
    "Penerimaan Bagi Hasil Bank",
  ];
  const penerimaanDariApi = Object.entries(penerimaan).filter(
    ([k, v]) =>
      !k.startsWith("Total Bulan ") &&
      k !== "Total Periode" &&
      typeof v === "object" &&
      v !== null &&
      !Array.isArray(v)
  );
  const penerimaanMap = new Map(penerimaanDariApi);
  const penerimaanItems = [
    ...PENERIMAAN_STANDAR.map((label) => [
      label,
      penerimaanMap.get(label) || { [key1]: null, [key2]: null },
    ]),
    ...penerimaanDariApi.filter(([k]) => !PENERIMAAN_STANDAR.includes(k)),
  ];
  const pendayagunaanItems = Object.entries(pendayagunaan).filter(
    ([k, v]) =>
      !k.startsWith("Total Bulan ") &&
      typeof v === "object" &&
      v !== null
  );

  const getPenerimaanTotal = (key) => {
    const direct = penerimaan[`Total Bulan ${key}`];
    if (direct != null) return Number(direct);
    return penerimaanItems.reduce(
      (sum, [, data]) => sum + Number(data?.[key] ?? 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Laporan Pengelola</h2>

      <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Filter Periode</h3>
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Bulan Pertama (Periode Utama)
            </label>
            <div className="flex gap-2">
              <select
                value={month1}
                onChange={(e) => setMonth1(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm min-w-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Bulan</option>
                {MONTH_LABELS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={year1}
                onChange={(e) => setYear1(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm min-w-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Tahun</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Bulan Kedua (Perbandingan)
            </label>
            <div className="flex gap-2">
              <select
                value={month2}
                onChange={(e) => setMonth2(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm min-w-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Bulan</option>
                {MONTH_LABELS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={year2}
                onChange={(e) => setYear2(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm min-w-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Tahun</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!canDownload}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <span>⬇</span> Download Laporan Pengelola
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Pilih bulan dan tahun untuk kedua periode. Tombol Download akan aktif setelah data ditampilkan.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <OrbitProgress variant="dotted" color="#69c53e" />
        </div>
      ) : !month1 || !month2 || !year1 || !year2 ? (
        <p className="text-gray-500 py-8 text-center">
          Pilih bulan dan tahun untuk menampilkan laporan.
        </p>
      ) : (
        <div
          className="bg-white border border-gray-200 rounded-lg overflow-x-auto"
          style={{ fontFamily: "Arial, sans-serif" }}
        >
          <div className="p-6 min-w-[700px]">
            <KopSurat logoSrc={logo} />
            <hr className="border border-black my-4" />

            <h2 className="text-center text-base font-bold uppercase my-4">
              LAPORAN PERUBAHAN DANA PENGELOLA
            </h2>
            <p className="text-center text-sm mb-1">
              UNTUK BULAN YANG BERAKHIR PER {date1.toUpperCase()}
            </p>
            <p className="text-center text-sm mb-4">
              Dengan Angka Perbandingan Untuk Bulan {date2}
            </p>
            <p className="text-center text-xs text-gray-600 mb-6">
              (Dinyatakan Dalam Rupiah Kecuali Dinyatakan Lain)
            </p>

            {/* Table */}
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                    DANA OPERASIONAL
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center w-20 font-semibold">
                    CATATAN
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                    {date1}
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-semibold">
                    {date2}
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* I. PENERIMAAN DANA PENGELOLA */}
                <tr className="bg-slate-50">
                  <td
                    colSpan={4}
                    className="border border-gray-300 px-3 py-2 font-bold"
                  >
                    I. PENERIMAAN DANA PENGELOLA
                  </td>
                </tr>
                {penerimaanItems.map(([label, data]) => (
                  <tr key={label}>
                    <td className="border border-gray-300 px-3 py-1.5 pl-6">
                      {stripLabelCode(label)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      -
                    </td>
                    <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums">
                      {formatRupiah(
                        typeof data === "object" ? data?.[key1] : null
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums">
                      {formatRupiah(
                        typeof data === "object" ? data?.[key2] : null
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-semibold">
                  <td className="border border-gray-300 px-3 py-1.5 underline">
                    Jumlah Penerimaan Dana Pengelola
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5"></td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums underline">
                    {formatRupiah(getPenerimaanTotal(key1))}
                  </td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums underline">
                    {formatRupiah(getPenerimaanTotal(key2))}
                  </td>
                </tr>

                {/* II. PENDAYAGUNAAN DANA PENGELOLA */}
                <tr className="bg-slate-50">
                  <td
                    colSpan={4}
                    className="border border-gray-300 px-3 py-2 font-bold"
                  >
                    II. PENDAYAGUNAAN DANA PENGELOLA
                  </td>
                </tr>
                {pendayagunaanItems.map(([label, data]) => (
                  <tr key={label}>
                    <td className="border border-gray-300 px-3 py-1.5 pl-6">
                      {stripLabelCode(label)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 text-center">
                      -
                    </td>
                    <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums">
                      {formatRupiah(
                        typeof data === "object"
                          ? -Math.abs(Number(data?.[key1] ?? 0))
                          : null
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums">
                      {formatRupiah(
                        typeof data === "object"
                          ? -Math.abs(Number(data?.[key2] ?? 0))
                          : null
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-semibold">
                  <td className="border border-gray-300 px-3 py-1.5 underline">
                    Jumlah Pendayagunaan Dana Pengelola
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5"></td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums underline">
                    {formatRupiah(
                      (() => {
                        const v = pendayagunaan[`Total Bulan ${key1}`];
                        return v != null ? -Math.abs(Number(v)) : null;
                      })()
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums underline">
                    {formatRupiah(
                      (() => {
                        const v = pendayagunaan[`Total Bulan ${key2}`];
                        return v != null ? -Math.abs(Number(v)) : null;
                      })()
                    )}
                  </td>
                </tr>

                {/* III. SURPLUS (DEFISIT) DANA PENGELOLA */}
                <tr className="bg-slate-100 font-semibold">
                  <td className="border border-gray-300 px-3 py-1.5 underline">
                    III. SURPLUS (DEFISIT) DANA PENGELOLA
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5"></td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums underline">
                    {formatRupiah(
                      laporanPengelola?.[`Surplus (Defisit) Dana ${key1}`]
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums underline">
                    {formatRupiah(
                      laporanPengelola?.[`Surplus (Defisit) Dana ${key2}`]
                    )}
                  </td>
                </tr>

                {/* IV. SALDO AWAL DANA PENGELOLA */}
                <tr>
                  <td className="border border-gray-300 px-3 py-1.5">
                    IV. SALDO AWAL DANA PENGELOLA
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5"></td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums">
                    {formatRupiah(
                      laporanPengelola?.[`Saldo Awal Dana ${key1}`]
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums">
                    {formatRupiah(
                      laporanPengelola?.[`Saldo Awal Dana ${key2}`]
                    )}
                  </td>
                </tr>

                {/* V. KOREKSI DANA PENGELOLA */}
                <tr>
                  <td className="border border-gray-300 px-3 py-1.5">
                    V. KOREKSI DANA PENGELOLA
                  </td>
                  <td className="border border-gray-300 px-2 py-1.5"></td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums">
                    -
                  </td>
                  <td className="border border-gray-300 px-3 py-1.5 text-right tabular-nums">
                    -
                  </td>
                </tr>

                {/* VI. SALDO AKHIR DANA PENGELOLA */}
                <tr className="bg-slate-200 font-bold">
                  <td className="border border-gray-300 px-3 py-2 underline decoration-double">
                    VI. SALDO AKHIR DANA PENGELOLA
                  </td>
                  <td className="border border-gray-300 px-2 py-2"></td>
                  <td className="border border-gray-300 px-3 py-2 text-right tabular-nums underline decoration-double">
                    {formatRupiah(
                      laporanPengelola?.[`Saldo Akhir Dana ${key1}`]
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right tabular-nums underline decoration-double">
                    {formatRupiah(
                      laporanPengelola?.[`Saldo Akhir Dana ${key2}`]
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="text-xs text-gray-600 mt-6">
              (Catatan Atas Laporan Keuangan yang merupakan bagian yang tidak
              terpisahkan dari laporan secara keseluruhan)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
