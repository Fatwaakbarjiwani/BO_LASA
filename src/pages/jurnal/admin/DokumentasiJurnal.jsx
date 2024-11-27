import { useSelector } from "react-redux";
import logo from "../../../assets/logo2.png";
import PropTypes from "prop-types";

export default function DokumentasiJurnal({ startDate, endDate }) {
  const { jurnal } = useSelector((state) => state.summary);

  const formatNumber = (value) => {
    if (!value || isNaN(value)) return "0";
    return parseInt(value).toLocaleString("id-ID");
  };

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
        style={{
          textAlign: "center",
          margin: "20px 0",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        LAPORAN JURNAL
      </div>
      <p style={{ fontSize: "14px", margin: "10px 0" }}>
        Periode: {startDate} - {endDate}
      </p>
      <p style={{ fontSize: "14px", margin: "10px 0" }}>
        Unit : Lazis Sultan Agung
      </p>

      {/* Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={headerStyle}>TANGGAL</th>
            <th style={headerStyle}>UNIT</th>
            <th style={headerStyle}>NOMOR BUKTI</th>
            <th style={headerStyle}>URAIAN</th>
            <th style={headerStyle}>COA</th>
            <th style={headerStyle}>DEBET</th>
            <th style={headerStyle}>KREDIT</th>
          </tr>
        </thead>
        <tbody>
          {jurnal?.jurnalResponses?.map((item, index) => {
            const jumlahBaris = item?.coa?.length || 1;
            return (
              <>
                <tr key={`header-${index}`}>
                  <td rowSpan={jumlahBaris + 1} style={cellStyle}>
                    {item.tanggal}
                  </td>
                  <td rowSpan={jumlahBaris + 1} style={cellStyle}>
                    {item.unit}
                  </td>
                  <td rowSpan={jumlahBaris + 1} style={cellStyle}>
                    {item.nomorBukti}
                  </td>
                  <td rowSpan={jumlahBaris + 1} style={cellStyle}>
                    {item.uraian}
                  </td>
                  <td style={cellStyle}>{item?.coa?.[0]?.akun || "-"}</td>
                  <td style={cellStyle}>
                    {formatNumber(item?.coa?.[0]?.debit || 0)}
                  </td>
                  <td style={cellStyle}>
                    {formatNumber(item?.coa?.[0]?.kredit || 0)}
                  </td>
                </tr>
                {item?.coa?.slice(1).map((coaItem, coaIndex) => (
                  <tr key={`coa-${index}-${coaIndex}`}>
                    <td style={cellStyle}>{coaItem?.akun || "-"}</td>
                    <td style={cellStyle}>
                      {formatNumber(coaItem?.debit || 0)}
                    </td>
                    <td style={cellStyle}>
                      {formatNumber(coaItem?.kredit || 0)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="bg-gray-200" style={cellStyle}>
                    Jumlah
                  </td>
                  <td className="bg-gray-200" style={cellStyle}>
                    {formatNumber(item?.totalDebit || 0)}
                  </td>
                  <td className="bg-gray-200" style={cellStyle}>
                    {formatNumber(item?.totalKredit || 0)}
                  </td>
                </tr>
              </>
            );
          })}
          <tr>
            <td className="bg-gray-200" colSpan={5} style={cellStyle}>
              Jumlah Total
            </td>
            <td className="bg-gray-200" style={cellStyle}>
              {formatNumber(
                jurnal?.totalDebitKeseluruhan || 0
              )}
            </td>
            <td className="bg-gray-200" style={cellStyle}>
              {formatNumber(
                jurnal?.totalKreditKeseluruhan || 0
              )}
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
  textAlign: "center",
  fontSize: "12px",
};

DokumentasiJurnal.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
};
