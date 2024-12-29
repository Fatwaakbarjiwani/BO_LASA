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
  const [startMonth, setStartMonth] = useState("");
  const [year1, setYear1] = useState("");
  // const { posisiKeuangan } = useSelector((state) => state.summary);
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const reportTemplateRef = useRef(null);
  const [dateTime, setDateTime] = useState("");
  // const [loading2, setLoading2] = useState(false);

  useEffect(() => {
    if (startMonth && year1) {
      // setLoading2(true);
      dispatch(getNeracaSaldo(startMonth, year1));
    }
  }, [dispatch, startMonth, year1]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentDateTime = new Date().toLocaleString();
    setDateTime(currentDateTime);

    if (!startMonth || !format || !year1) {
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
    // const formatNumber = (value) => {
    //   return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    // };

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
              Bulan
            </label>
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Pilih Bulan</option>
              {months.map((month) => (
                <option key={month.id} value={month.id}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Tahun
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={year1}
              onChange={(e) => setYear1(e.target.value)}
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
              Download Laporan Aktivitas
            </button>
          )}
        </div>
      </div>
      <div ref={reportTemplateRef}>
        {/* {loading2 ? (
          <h1>Loading</h1>
        ) : ( */}
        <DokumentasiNeracaSaldo
          m1={startMonth}
          y1={year1}
          dateTime={dateTime}
        />
        {/* )} */}
      </div>
    </>
  );
}
