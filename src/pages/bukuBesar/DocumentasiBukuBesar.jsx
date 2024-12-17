import PropTypes from "prop-types"; // Import PropTypes
import logo2 from "../../assets/logo2.png";
import { useSelector } from "react-redux";

const DocumentasiBukuBesar = ({
  startDate,
  endDate,
  coaCategory,
  coaId,
  coaId2,
}) => {
  const { bukuBesar } = useSelector((state) => state.summary);

  // const monthNames = [
  //   "Januari",
  //   "Februari",
  //   "Maret",
  //   "April",
  //   "Mei",
  //   "Juni",
  //   "Juli",
  //   "Agustus",
  //   "September",
  //   "Oktober",
  //   "November",
  //   "Desember",
  // ];
  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  // const startMonth = new Date(startDate).getMonth();
  // const namaBulan = monthNames[startMonth];

  return (
    <>
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
          className="relative"
        >
          <img
            src={logo2}
            alt="LAZIS Logo"
            style={{
              width: "150px",
              height: "auto",
              marginRight: "20px",
              position: "absolute",
              left: 0,
            }}
          />
          <div className="text-center">
            <h1 style={{ margin: "0", fontSize: "24px" }}>
              LAZIS SULTAN AGUNG
            </h1>
            <p style={{ margin: "0", fontSize: "14px" }}>
              Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah
            </p>
            <p style={{ margin: "0", fontSize: "14px" }}>
              Info : Telp. +62 24 6583584
            </p>
            <p style={{ margin: "0", fontSize: "14px" }}>
              <a
                href=" https://lazis-sa.org/"
                style={{ textDecoration: "none", color: "blue" }}
              >
                https://lazis-sa.org/
              </a>
            </p>
          </div>
        </div>
        <hr style={{ border: "1px solid black" }} />
        {/* Report Title */}
        <div
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
            margin: "20px 0",
          }}
        >
          LAPORAN BUKU BESAR
        </div>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          Periode: {startDate} sampai dengan {endDate}
        </p>
        <p style={{ margin: "5px 0", fontSize: "14px" }}>
          Unit: Lazis Sultan Agung
        </p>
        <p style={{ margin: "5px 0", fontSize: "14px", color: "red" }}>
          COA: {coaCategory[coaId - 1]?.accountName}
        </p>
        {/* Table Section */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr>
              {[
                "TANGGAL",
                "UNIT",
                "NOMOR BUKTI",
                "URAIAN",
                "DEBET",
                "KREDIT",
                "SALDO",
              ].map((header, index) => (
                <th
                  key={index}
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    backgroundColor: "#f2f2f2",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan="4"
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: "bold",
                }}
              >
                Saldo Awal Tahun 2024 =
              </td>
              <td
                colSpan="2"
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                }}
              >
                Saldo Awal =
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {formatNumber(bukuBesar?.saldoAwal1 || 0)}
              </td>
            </tr>
            {bukuBesar?.bukuBesarCoa1?.map((item, index) => (
              <tr key={index}>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {item?.tanggal}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {item?.unit}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {item?.nomorBukti}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {item?.uraian}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "right",
                  }}
                >
                  {formatNumber(item?.debit || 0)}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "right",
                  }}
                >
                  {formatNumber(item?.kredit || 0)}
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "right",
                  }}
                >
                  {formatNumber(item?.saldo || 0)}
                </td>
              </tr>
            ))}
            <tr>
              <td
                className="bg-gray-200"
                colSpan={6}
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                Jumlah Total
              </td>
              <td
                className="bg-gray-200 text-left"
                style={{
                  border: "1px solid black",
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                {/* {formatNumber()} */}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* ======================== */}
      {bukuBesar?.bukuBesarCoa2 == null ||
      bukuBesar == null ||
      coaId == coaId2 ? null : (
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            padding: "20px",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
            className="relative"
          >
            <img
              src={logo2}
              alt="UNISSULA Logo"
              style={{
                width: "150px",
                height: "auto",
                marginRight: "20px",
                position: "absolute",
                left: 0,
              }}
            />
            <div className="text-center">
              <h1 style={{ margin: "0", fontSize: "24px" }}>
                LAZIS SULTAN AGUNG
              </h1>
              <p style={{ margin: "0", fontSize: "14px" }}>
                Jl. Raya Kaligawe Km.4, Semarang, Jawa Tengah
              </p>
              <p style={{ margin: "0", fontSize: "14px" }}>
                Info : Telp. +62 24 6583584
              </p>
              <p style={{ margin: "0", fontSize: "14px" }}>
                <a
                  href="http://www.unissula.ac.id"
                  style={{ textDecoration: "none", color: "blue" }}
                >
                  http://www.unissula.ac.id
                </a>
              </p>
            </div>
          </div>
          <hr style={{ border: "1px solid black" }} />
          {/* Report Title */}
          <div
            style={{
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "bold",
              margin: "20px 0",
            }}
          >
            LAPORAN BUKU BESAR
          </div>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            Periode: {startDate} - {endDate}
          </p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            Unit: Lazis Sultan Agung
          </p>
          <p style={{ margin: "5px 0", fontSize: "14px", color: "red" }}>
            COA: {coaCategory[coaId2 - 1]?.accountName}
          </p>
          {/* Table Section */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr>
                {[
                  "TANGGAL",
                  "UNIT",
                  "NOMOR BUKTI",
                  "URAIAN",
                  "DEBET",
                  "KREDIT",
                  "SALDO",
                ].map((header, index) => (
                  <th
                    key={index}
                    style={{
                      border: "1px solid black",
                      padding: "8px",
                      backgroundColor: "#f2f2f2",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan="4"
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  Saldo Awal Tahun 2024 =
                </td>
                <td
                  colSpan="2"
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "left",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Saldo Awal =
                </td>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  {formatNumber(bukuBesar?.saldoAwal2 || 0)}
                </td>
              </tr>
              {bukuBesar?.bukuBesarCoa2?.map((item, index) => (
                <tr key={index}>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {item?.tanggal}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {item?.unit}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {item?.nomorBukti}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "8px",
                      textAlign: "center",
                    }}
                  >
                    {item?.uraian}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    {formatNumber(item?.debit || 0)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    {formatNumber(item?.kredit || 0)}
                  </td>
                  <td
                    style={{
                      border: "1px solid black",
                      padding: "8px",
                      textAlign: "right",
                    }}
                  >
                    {formatNumber(item?.saldo || 0)}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  className="bg-gray-200"
                  colSpan={6}
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "right",
                  }}
                >
                  Jumlah Total
                </td>
                <td
                  className="bg-gray-200"
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    textAlign: "right",
                  }}
                >
                  0
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

// PropTypes validation
DocumentasiBukuBesar.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  coaCategory: PropTypes.arrayOf(
    PropTypes.shape({
      accountName: PropTypes.string.isRequired,
    })
  ).isRequired,
  coaId: PropTypes.number.isRequired,
  coaId2: PropTypes.number.isRequired,
};

export default DocumentasiBukuBesar;
