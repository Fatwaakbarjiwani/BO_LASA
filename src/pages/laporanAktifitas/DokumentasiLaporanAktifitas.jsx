import { useSelector } from "react-redux";
import logo from "../../assets/logo2.png";
import PropTypes from "prop-types";

export default function DokumentasiLaporanAktifitas({
  m1,
  m2,
  y1,
  y2,
  dateTime,
  jenis,
}) {
  const { laporanAktivitas } = useSelector((state) => state.summary);
  const months = [
    { id: 1, name: "Januari", name2: "JANUARY" },
    { id: 2, name: "Februari", name2: "FEBRUARY" },
    { id: 3, name: "Maret", name2: "MARCH" },
    { id: 4, name: "April", name2: "APRIL" },
    { id: 5, name: "Mei", name2: "MAY" },
    { id: 6, name: "Juni", name2: "JUNE" },
    { id: 7, name: "Juli", name2: "JULY" },
    { id: 8, name: "Agustus", name2: "AUGUST" },
    { id: 9, name: "September", name2: "SEPTEMBER" },
    { id: 10, name: "Oktober", name2: "OCTOBER" },
    { id: 11, name: "November", name2: "NOVEMBER" },
    { id: 12, name: "Desember", name2: "DECEMBER" },
  ];

  return (
    <div
      className="relative"
      style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <img
          src={logo}
          alt="LAZIS SULTAN AGUNG Logo"
          style={{ width: "150px", position: "absolute", left: 0 }}
        />
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "5px 0" }}>
            LAZIS SULTAN AGUNG
          </h1>
          <p style={{ margin: "2px 0", fontSize: "14px" }}>
            Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah
          </p>
          <p style={{ margin: "2px 0", fontSize: "14px" }}>
            Info : Telp. +62 24 6583584
          </p>
          <p
            className="text-blue-600"
            style={{ margin: "2px 0", fontSize: "14px" }}
          >
            <a href="https://lazis-sa.org/" target="_blank" rel="noreferrer">
              https://lazis-sa.org/
            </a>
          </p>
        </div>
      </div>
      <hr style={{ border: "1px solid black" }} />
      <div
        className="mt-8"
        style={{
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        LAPORAN AKTIVITAS
      </div>
      <div
        className="uppercase"
        style={{
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        PER AKHIR BULAN {months[m1 - 1]?.name} {y1}
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        Dengan Angka Perbandingan Untuk Bulan {months[m2 - 1]?.name} {y2}
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        (Dinyatakan Dalam Rupiah Kecuali Dinyatakan Lain)
      </div>
      {dateTime && <p className="mt-2 text-right mb-[-2vh]">{dateTime}</p>}
      {/* Table 1: Aset */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={headerStyle} className="uppercase">
              DANA {jenis}
            </th>
            <th style={headerStyle}>
              {months[m1 - 1]?.name} {y1}
            </th>
            <th style={headerStyle}>
              {months[m2 - 1]?.name} {y2}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellStyle}>
              <h1 className="font-bold uppercase">PENERIMAAN DANA {jenis}</h1>
            </td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
          </tr>
          {Object.keys(laporanAktivitas["Penerimaan Dana"] || {})
            .filter(
              (key) =>
                key !== `Total Bulan ${months[m1 - 1]?.name2} ${y1}` &&
                key !== `Total Bulan ${months[m2 - 1]?.name2} ${y2}`
            )
            .map((key, index) => (
              <tr key={index}>
                <td style={cellStyle}>
                  <p className="pl-4">{key}</p>
                </td>
                <td style={cellStyle}>
                  <p className=" text-center">
                    {laporanAktivitas["Penerimaan Dana"]?.[`${key}`]?.[
                      `${months[m1 - 1]?.name2} ${y1}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {laporanAktivitas["Penerimaan Dana"]?.[`${key}`]?.[
                      `${months[m2 - 1]?.name2} ${y2}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
              </tr>
            ))}
          <tr>
            <td style={cellStyle}>
              <p className="pl-10 font-bold capitalize">
                Jumlah Penerimaan Dana {jenis}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {laporanAktivitas[`Penerimaan Dana`]?.[
                  `Total Bulan ${months[m1 - 1]?.name2} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {laporanAktivitas[`Penerimaan Dana`]?.[
                  `Total Bulan ${months[m2 - 1]?.name2} ${y2}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <h1 className="font-bold uppercase">PENDAYAAN DANA {jenis}</h1>
            </td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
          </tr>
          {Object.keys(laporanAktivitas["Pendayagunaan Dana"] || {})
            .filter(
              (key) =>
                key !== `Total Bulan ${months[m1 - 1]?.name2} ${y1}` &&
                key !== `Total Bulan ${months[m2 - 1]?.name2} ${y2}`
            ) // Menghilangkan 'total'
            .map((key, index) => (
              <tr key={index}>
                <td style={cellStyle}>
                  <p className="pl-4">{key}</p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {laporanAktivitas["Pendayagunaan Dana"]?.[`${key}`]?.[
                      `${months[m1 - 1]?.name2} ${y1}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {laporanAktivitas["Pendayagunaan Dana"]?.[`${key}`]?.[
                      `${months[m2 - 1]?.name2} ${y2}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
              </tr>
            ))}
          <tr>
            <td style={cellStyle}>
              <p className="pl-10 font-bold capitalize">
                Jumlah Pendayagunaan Dana {jenis}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {laporanAktivitas[`Pendayagunaan Dana`]?.[
                  `Total Bulan ${months[m1 - 1]?.name2} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {laporanAktivitas[`Pendayagunaan Dana`]?.[
                  `Total Bulan ${months[m2 - 1]?.name2} ${y2}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <h1 className="font-bold uppercase">
                SURPLUS (DEFISIT) DANA {jenis}
              </h1>
            </td>
            <td style={cellStyle}>
              <p className="text-center font-bold">
                {laporanAktivitas[
                  `Surplus (Defisit) Dana ${months[m1 - 1]?.name2} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="text-center font-bold">
                {laporanAktivitas[
                  `Surplus (Defisit) Dana ${months[m2 - 1]?.name2} ${y2}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <h1 className="uppercase">SALDO AWAL DANA {jenis}</h1>
            </td>
            <td style={cellStyle}>
              <p className="text-center">
                {laporanAktivitas[
                  `Saldo Awal Dana ${months[m1 - 1]?.name2} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="text-center">
                {laporanAktivitas[
                  `Saldo Awal Dana ${months[m2 - 1]?.name2} ${y2}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
          </tr>
          <tr>
            <td style={cellStyle} className="bg-gray-200 font-bold">
              <h1 className="uppercase">SALDO AKHIR DANA {jenis}</h1>
            </td>
            <td style={cellStyle} className="bg-gray-200 font-bold">
              <p className="text-center">
                {laporanAktivitas[
                  `Saldo Akhir Dana ${months[m1 - 1]?.name2} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle} className="bg-gray-200 font-bold">
              <p className="text-center">
                {laporanAktivitas[
                  `Saldo Akhir Dana ${months[m2 - 1]?.name2} ${y2}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const headerStyle = {
  border: "1px solid black",
  padding: "8px",
  textAlign: "center",
  backgroundColor: "#f2f2f2",
  fontSize: "14px",
};

const cellStyle = {
  border: "1px solid black",
  padding: "8px",
  textAlign: "left",
  fontSize: "14px",
};

DokumentasiLaporanAktifitas.propTypes = {
  m1: PropTypes.string,
  m2: PropTypes.string,
  y1: PropTypes.string,
  y2: PropTypes.string,
  dateTime: PropTypes.string.isRequired,
  jenis: PropTypes.string.isRequired,
};
