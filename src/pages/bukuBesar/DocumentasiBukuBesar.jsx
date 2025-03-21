import PropTypes from "prop-types"; // Import PropTypes
import logo2 from "../../assets/logo2.png";
import { useSelector } from "react-redux";

const DocumentasiBukuBesar = ({
  startDate,
  endDate,
  coaId,
  coaId2,
  coaName,
  coaName2,
  dateTime,
}) => {
  const { bukuBesar } = useSelector((state) => state.summary);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

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
        <p
          className="w-full flex justify-between"
          style={{ margin: "5px 0", fontSize: "14px", color: "red" }}
        >
          COA: {coaName}
          {dateTime && <p className="text-black">{dateTime}</p>}
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
              ></td>
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
                className="bg-gray-200 font-semibold"
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
                {bukuBesar?.bukuBesarCoa1 &&
                  bukuBesar.bukuBesarCoa1.length > 0 &&
                  formatNumber(
                    bukuBesar.bukuBesarCoa1[bukuBesar.bukuBesarCoa1.length - 1]
                      ?.saldo || 0
                  )}
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
          <p
            className="w-full flex justify-between"
            style={{ margin: "5px 0", fontSize: "14px", color: "red" }}
          >
            COA: {coaName2}
            {dateTime && <p className="text-black">{dateTime}</p>}
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
                ></td>
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
                  className="bg-gray-200 font-semibold"
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
                  {bukuBesar?.bukuBesarCoa2 &&
                    bukuBesar.bukuBesarCoa2.length > 0 &&
                    formatNumber(
                      bukuBesar.bukuBesarCoa2[
                        bukuBesar.bukuBesarCoa2.length - 1
                      ]?.saldo || 0
                    )}
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
  coaId: PropTypes.string.isRequired,
  coaId2: PropTypes.string.isRequired,
  coaName: PropTypes.string.isRequired,
  coaName2: PropTypes.string.isRequired,
  dateTime: PropTypes.string.isRequired,
};

export default DocumentasiBukuBesar;
