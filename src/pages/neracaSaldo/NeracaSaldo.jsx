import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useDispatch } from "react-redux";
import { getNeracaSaldo } from "../../redux/actions/transaksiAction";
// import logo from "../../assets/logo2.png";
import Swal from "sweetalert2";
import { OrbitProgress } from "react-loading-indicators";
import DokumentasiNeracaSaldo from "./DokumentasiNeracaSaldo";

export default function NeracaSaldo() {
  const [format, setFormat] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // const { posisiKeuangan } = useSelector((state) => state.summary);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const reportTemplateRef = useRef(null);
  const [dateTime, setDateTime] = useState("");
  // const [loading2, setLoading2] = useState(false);

  useEffect(() => {
    if (startDate && endDate) {
      setLoading(true);
      dispatch(getNeracaSaldo(startDate, endDate)).finally(() =>
        setLoading(false)
      );
    }
  }, [dispatch, startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentDateTime = new Date().toLocaleString();
    setDateTime(currentDateTime);

    if (!startDate || !format || !endDate) {
      Swal.fire({
        icon: "warning",
        title: "Input Tidak Lengkap",
        text: "Silakan isi semua input sebelum melanjutkan!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (format === "html") {
        openHtmlReport();
      } else if (format === "pdf") {
        downloadPdfReport();
      }
      setLoading(false);
    }, 1000);
  };

  const openHtmlReport = () => {
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(``);

      newWindow.document.close();
    }
  };

  const downloadPdfReport = () => {
    const doc = new jsPDF({
      format: "a4",
      unit: "px",
    });

    const content = reportTemplateRef.current;
    const contentWidth = content.offsetWidth;
    const pdfWidth = doc.internal.pageSize.getWidth();
    const scaleFactor = pdfWidth / contentWidth;

    doc.html(content, {
      x: 4,
      y: 4,
      html2canvas: { scale: scaleFactor },
      callback: (doc) => {
        doc.save("document.pdf");
      },
    });
  };

  return (
    <>
      <div className="mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Filter Neraca Saldo
        </h2>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select Format</option>
              {/* <option value="html">HTML</option> */}
              <option value="pdf">PDF</option>
            </select>
          </div>
          {isLoading ? (
            <div className="w-full flex justify-center">
              <OrbitProgress
                variant="spokes"
                color="#69c53e"
                style={{ fontSize: "8px" }}
              />
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 text-white p-3 rounded-lg"
            >
              Download Neraca Saldo
            </button>
          )}
        </div>
      </div>
      <div ref={reportTemplateRef}>
        {/* {loading2 ? (
          <h1>Loading</h1>
        ) : ( */}
        <DokumentasiNeracaSaldo
          m1={startDate}
          y1={endDate}
          dateTime={dateTime}
        />
        {/* )} */}
      </div>
    </>
  );
}
