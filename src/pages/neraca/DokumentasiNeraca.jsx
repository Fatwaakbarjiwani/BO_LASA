import { useSelector } from "react-redux";
import logo from "../../assets/logo2.png";
import PropTypes from "prop-types";

export default function DokumentasiNeraca({ m1, m2, y1, y2, dateTime }) {
  const { posisiKeuangan } = useSelector((state) => state.summary);
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

  // Menghitung total
  // const hitungTotal = (name, m, y) => {
  //   const hasil = Object.keys(posisiKeuangan[name] || {})
  //     .filter((key) => key.toLowerCase() !== "total") // Menghindari key "total"
  //     .reduce((acc, key) => {
  //       const value =
  //         posisiKeuangan[name]?.[key]?.[`${months[m - 1]?.name} ${y}`];
  //       // Pastikan value adalah angka, jika bukan angka maka abaikan
  //       return acc + (typeof value === "number" ? value : 0);
  //     }, 0);
  //   return hasil.toLocaleString("id-ID");
  // };

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
        LAPORAN POSISI KEUANGAN
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
            <th style={headerStyle} className="w-4/6">ASET</th>
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
              <h1 className="font-bold">ASET LANCAR</h1>
            </td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
          </tr>
          {Object.keys(posisiKeuangan["Aset Lancar"] || {})
            .filter(
              (key) =>
                key !== `Total ${months[m1 - 1]?.name} ${y1}` &&
                key !== `Total ${months[m2 - 1]?.name} ${y2}`
            )
            .map((key, index) => (
              <tr key={index}>
                <td style={cellStyle}>
                  <p className="pl-4">{key}</p>
                </td>
                <td style={cellStyle}>
                  <p className=" text-center">
                    {posisiKeuangan["Aset Lancar"]?.[`${key}`]?.[
                      `${months[m1 - 1]?.name} ${y1}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {posisiKeuangan["Aset Lancar"]?.[`${key}`]?.[
                      `${months[m2 - 1]?.name} ${y2}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
              </tr>
            ))}
          <tr>
            <td style={cellStyle}>
              <p className="uppercase pl-10 font-bold">Jumlah Aset Lancar</p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {posisiKeuangan[`Aset Lancar`]?.[
                  `Total ${months[m1 - 1]?.name} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {posisiKeuangan[`Aset Lancar`]?.[
                  `Total ${months[m2 - 1]?.name} ${y2}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <h1 className="font-bold">ASET TETAP</h1>
            </td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
          </tr>
          {Object.keys(posisiKeuangan["Aset Tetap"] || {})
            .filter(
              (key) =>
                key !== `Total ${months[m1 - 1]?.name} ${y1}` &&
                key !== `Total ${months[m2 - 1]?.name} ${y2}`
            ) // Menghilangkan 'total'
            .map((key, index) => (
              <tr key={index}>
                <td style={cellStyle}>
                  <p className="pl-4">{key}</p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {posisiKeuangan["Aset Tetap"]?.[`${key}`]?.[
                      `${months[m1 - 1]?.name} ${y1}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {posisiKeuangan["Aset Tetap"]?.[`${key}`]?.[
                      `${months[m2 - 1]?.name} ${y2}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
              </tr>
            ))}
          <tr>
            <td style={cellStyle}>
              <p className="uppercase pl-10 font-bold">Jumlah Aset Tetap</p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {posisiKeuangan[`Aset Tetap`]?.[
                  `Total ${months[m1 - 1]?.name} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {posisiKeuangan[`Aset Tetap`]?.[
                  `Total ${months[m2 - 1]?.name} ${y2}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <h1 className="font-bold">ASET LAIN-LAIN</h1>
            </td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
          </tr>
          {Object.keys(posisiKeuangan["Aset Lain-Lain"] || {})
            .filter(
              (key) =>
                key !== `Total ${months[m1 - 1]?.name} ${y1}` &&
                key !== `Total ${months[m2 - 1]?.name} ${y2}`
            ) // Menghilangkan 'total'
            .map((key, index) => (
              <tr key={index}>
                <td style={cellStyle}>
                  <p className="pl-4">{key}</p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {posisiKeuangan["Aset Lain-Lain"]?.[`${key}`]?.[
                      `${months[m1 - 1]?.name} ${y1}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {posisiKeuangan["Aset Lain-Lain"]?.[`${key}`]?.[
                      `${months[m2 - 1]?.name} ${y2}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
              </tr>
            ))}
          <tr>
            <td style={cellStyle}>
              <p className="uppercase pl-10 font-bold">Jumlah Aset Lain-Lain</p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {posisiKeuangan[`Aset Lain-Lain`]?.[
                  `Total ${months[m1 - 1]?.name} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {posisiKeuangan[`Aset Lain-Lain`]?.[
                  `Total ${months[m2 - 1]?.name} ${y2}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
          </tr>
          <tr>
            <td style={cellStyle} className="bg-gray-100">
              <p className="text-center font-bold">JUMLAH ASET</p>
            </td>
            <td style={cellStyle} className="bg-gray-100">
              <p className="text-center font-bold">
                {posisiKeuangan[
                  `Jumlah Aset ${months[m1 - 1]?.name} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle} className="bg-gray-100">
              <p className="text-center font-bold">
                <p className="text-center font-bold">
                  {posisiKeuangan[
                    `Jumlah Aset ${months[m2 - 1]?.name} ${y2}`
                  ]?.toLocaleString("id-ID")}
                </p>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Table 2: Kewajiban dan Dana */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={headerStyle} className="w-4/6">KEWAJIBAN DAN DANA-DANA ZIS</th>
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
              <h1 className="font-bold">KEWAJIBAN LANCAR</h1>
            </td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
          </tr>
          {Object.keys(posisiKeuangan["Kewajiban Lancar"] || {})
            .filter(
              (key) =>
                key !== `Total ${months[m1 - 1]?.name} ${y1}` &&
                key !== `Total ${months[m2 - 1]?.name} ${y2}`
            ) // Menghilangkan 'total'
            .map((key, index) => (
              <tr key={index}>
                <td style={cellStyle}>
                  <p className="pl-4">{key}</p>
                </td>
                <td style={cellStyle}>
                  <p className=" text-center">
                    {posisiKeuangan["Kewajiban Lancar"]?.[`${key}`]?.[
                      `${months[m1 - 1]?.name} ${y1}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {posisiKeuangan["Kewajiban Lancar"]?.[`${key}`]?.[
                      `${months[m2 - 1]?.name} ${y2}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
              </tr>
            ))}
          <tr>
            <td style={cellStyle}>
              <p className="uppercase pl-10 font-bold">Jumlah Kewajiban Lancar</p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {posisiKeuangan[`Kewajiban Lancar`]?.[
                  `Total ${months[m1 - 1]?.name} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {posisiKeuangan[`Kewajiban Lancar`]?.[
                  `Total ${months[m2 - 1]?.name} ${y2}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
          </tr>
          <tr>
            <td style={cellStyle}>
              <h1 className="font-bold">DANA-DANA ZIS</h1>
            </td>
            <td style={cellStyle}></td>
            <td style={cellStyle}></td>
          </tr>
          {Object.keys(posisiKeuangan["Dana ZIS"] || {})
            .filter(
              (key) =>
                key !== `Total ${months[m1 - 1]?.name} ${y1}` &&
                key !== `Total ${months[m2 - 1]?.name} ${y2}`
            ) // Menghilangkan 'total'
            .map((key, index) => (
              <tr key={index}>
                <td style={cellStyle}>
                  <p className="pl-4">{key}</p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {posisiKeuangan["Dana ZIS"]?.[`${key}`]?.[
                      `${months[m1 - 1]?.name} ${y1}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
                <td style={cellStyle}>
                  <p className="text-center">
                    {posisiKeuangan["Dana ZIS"]?.[`${key}`]?.[
                      `${months[m2 - 1]?.name} ${y2}`
                    ]?.toLocaleString("id-ID")}
                  </p>
                </td>
              </tr>
            ))}
          <tr>
            <td style={cellStyle}>
              <p className="uppercase pl-10 font-bold">Jumlah Dana-Dana Zis</p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {posisiKeuangan[`Dana ZIS`]?.[
                  `Total ${months[m1 - 1]?.name} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle}>
              <p className="font-bold text-center">
                {posisiKeuangan[`Dana ZIS`]?.[
                  `Total ${months[m2 - 1]?.name} ${y2}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
          </tr>
          <tr>
            <td style={cellStyle} className="bg-gray-100">
              <p className="text-center font-bold">
                JUMLAH KEWAJIBAN DAN DANA-DANA ZIS
              </p>
            </td>
            <td style={cellStyle} className="bg-gray-100">
              <p className="text-center font-bold">
                {posisiKeuangan[
                  `Jumlah Kewajiban dan Dana ZIS ${months[m1 - 1]?.name} ${y1}`
                ]?.toLocaleString("id-ID")}
              </p>
            </td>
            <td style={cellStyle} className="bg-gray-100">
              <p className="text-center font-bold">
                {posisiKeuangan[
                  `Jumlah Kewajiban dan Dana ZIS ${months[m2 - 1]?.name} ${y2}`
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

DokumentasiNeraca.propTypes = {
  m1: PropTypes.number.isRequired,
  m2: PropTypes.number.isRequired,
  y1: PropTypes.number.isRequired,
  y2: PropTypes.number.isRequired,
  dateTime: PropTypes.string.isRequired,
};
