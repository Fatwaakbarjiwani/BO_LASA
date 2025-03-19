import { useSelector, useDispatch } from "react-redux";
import { FileInput, Label } from "flowbite-react";
import { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import { setCreateDokumentasi } from "../../redux/reducers/transaction&summaryReducer";
import {
  createDistribusiDokumentasi,
  createLaporanPenyaluran,
} from "../../redux/actions/transaksiAction";
import { Editor } from "@tinymce/tinymce-react";
import {
  getCategoryCoa,
  getCategoryZiswaf,
} from "../../redux/actions/ziswafAction";
import Swal from "sweetalert2";
import { IoMdArrowBack } from "react-icons/io";

function CreateDokumentasiPage() {
  const { zakat, infak, wakaf, dskl, coaCategory } = useSelector(
    (state) => state.ziswaf
  );
  const { campaign } = useSelector((state) => state.campaign);

  const [date2, setDate2] = useState("");
  const [jenis, setJenis] = useState("");
  const [kategori, setKategori] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [rows, setRows] = useState([
    { id: 1, rekening: "", debet: 0, kredit: 0 },
  ]);

  const dispatch = useDispatch();
  const { id } = useSelector((state) => state.summary);
  const { type } = useSelector((state) => state.summary);
  const [image, setImage] = useState(null);
  const [showImage, setShowImage] = useState(null);
  const [isLoading, setLoading] = useState(false);

  // State for form inputs
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    dispatch(getCategoryZiswaf("zakat"));
    dispatch(getCategoryZiswaf("infak"));
    dispatch(getCategoryZiswaf("wakaf"));
    dispatch(getCategoryZiswaf("dskl"));
    dispatch(getCategoryZiswaf("campaign"));
    dispatch(getCategoryCoa());
  }, [dispatch]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    const imageUrl = URL.createObjectURL(file);
    setShowImage(imageUrl);
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(
      createDistribusiDokumentasi(
        image,
        description,
        receiver,
        parseInt(amount.replace(/\./g, ""), 10),
        date,
        type,
        id
      )
    ).finally(() => setLoading(false));
  };

  const data = [
    { id: 1, name: "Zakat", category: "zakat" },
    { id: 2, name: "Infak", category: "infak" },
    { id: 3, name: "Wakaf", category: "wakaf" },
    { id: 4, name: "DSKL", category: "dskl" },
    { id: 5, name: "Campaign", category: "campaign" },
  ];

  const addRow = () => {
    setRows([
      ...rows,
      { id: rows.length + 1, rekening: "", debet: 0, kredit: 0 },
    ]);
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] =
      field === "rekening"
        ? value
        : parseFloat(value.replace(/[^\d]/g, "")) || 0;
    setRows(updatedRows);
  };

  const getTotal = (field) =>
    rows.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(value);

  const resetForm = () => {
    setDate("");
    setJenis("");
    setKategori("");
    setKeterangan("");
    setRows([{ id: 1, rekening: "", debet: 0, kredit: 0 }]);
  };

  return (
    <div>
      <button
        className="bg-blue-600 text-white hover:scale-105 duration-200 p-2 rounded-lg shadow text-sm flex items-center gap-2"
        onClick={() => dispatch(setCreateDokumentasi(false))}
      >
        <IoMdArrowBack /> Kembali
      </button>
      <div className="mt-4">
        <h1 className="text-3xl font-semibold mb-6 text-gray-600">
          Laporan Penyaluran
        </h1>

        <div className="grid grid-cols-3 gap-6 items-center mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Tanggal
            </label>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Pilih Jenis
            </label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Pilih Jenis</option>
              {data.map((item, id) => (
                <option key={id} value={item.category}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Kategori
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Pilih Kategori</option>
              {(jenis === "zakat"
                ? zakat
                : jenis === "infak"
                ? infak
                : jenis === "wakaf"
                ? wakaf
                : jenis === "campaign"
                ? campaign
                : dskl
              ).map((item, id) =>
                jenis !== "campaign" ? (
                  <option key={id} value={item.id}>
                    {item.categoryName}
                  </option>
                ) : (
                  <option key={id} value={item.campaignId}>
                    {item.campaignId}. {item.campaignName}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600">
            Keterangan Penyaluran
          </label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows="3"
          ></textarea>
        </div>

        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                No
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Rekening
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Debet
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Kredit
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-gray-700">{index + 1}</td>
                <td className="px-4 py-2">
                  <select
                    value={row.rekening}
                    onChange={(e) =>
                      handleRowChange(index, "rekening", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Pilih Rekening</option>
                    {coaCategory.map((item, id) => (
                      <option key={id} value={item.id}>
                        {`${item.accountCode} ${item.accountName}`}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.debet.toLocaleString("id-ID")}
                    onChange={(e) =>
                      handleRowChange(index, "debet", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.kredit.toLocaleString("id-ID")}
                    onChange={(e) =>
                      handleRowChange(index, "kredit", e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="2" className="px-4 py-2 text-gray-700 font-bold">
                Total
              </td>
              <td className="px-4 py-2 text-gray-700 font-bold">
                {formatCurrency(getTotal("debet"))}
              </td>
              <td className="px-4 py-2 text-gray-700 font-bold">
                {formatCurrency(getTotal("kredit"))}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex gap-4 mt-6">
          <button
            onClick={resetForm}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600"
          >
            Reset
          </button>
          <button
            onClick={addRow}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
          >
            Tambah
          </button>
          {isLoading ? (
            <div className="flex justify-center">
              <OrbitProgress
                variant="spokes"
                color="#69c53e"
                style={{ fontSize: "8px" }}
              />
            </div>
          ) : (
            <button
              onClick={() => {
                if (
                  formatCurrency(getTotal("debet")) ==
                  formatCurrency(getTotal("kredit"))
                ) {
                  setLoading(true);
                  dispatch(
                    createLaporanPenyaluran(
                      date2,
                      keterangan,
                      jenis,
                      kategori,
                      rows
                    )
                  ).finally(() => setLoading(false));
                } else {
                  Swal.fire({
                    title: "Peringatan",
                    text: "Pastikan jumlah debet dan kredit sama",
                    icon: "info",
                  });
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600"
            >
              Simpan
            </button>
          )}
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-3xl font-semibold mb-6 text-gray-600">
          Buat Dokumentasi
        </h2>
        <form className="space-y-6" onSubmit={handleCreateCampaign}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Penerima
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter receiver"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Jumlah Distribusi
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter amount distribution"
              value={amount}
              onChange={(e) => {
                let inputValue = e.target.value.replace(/[^\d]/g, "");
                inputValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                setAmount(inputValue);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Deskripsi
            </label>
            <Editor
              apiKey="e3m2xvaijq07t0pv56vwlvxn41f4ro15a65t7kbjpt9packt" // Ganti dengan API key Anda atau hapus untuk mode testing
              value={description}
              onEditorChange={(newValue) => setDescription(newValue)}
              init={{
                branding: false,
                height: 400,
                menubar: true,
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic underline | " +
                  "alignleft aligncenter alignright alignjustify | " +
                  "bullist numlist outdent indent | link image media | removeformat",
                content_style:
                  "body { font-family:Arial,Helvetica,sans-serif; font-size:14px }",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tanggal Dokumentasi
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex w-full items-center justify-center">
            <Label
              htmlFor="dropzone-file"
              className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
            >
              {showImage != null ? (
                <img
                  src={showImage}
                  alt="Campaign Image"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  <svg
                    className="mb-4 h-8 w-8 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x600px / 1Mb)
                  </p>
                </div>
              )}
              <FileInput
                id="dropzone-file"
                className="hidden"
                onChange={handleImageUpload}
              />
            </Label>
          </div>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="flex justify-center">
                <OrbitProgress
                  variant="dotted"
                  color="#69c53e"
                  text=""
                  style={{ fontSize: "8px" }}
                  textColor=""
                />
              </div>
            ) : (
              <button
                type="submit"
                onClick={handleCreateCampaign}
                className="px-6 py-2 bg-primary text-white rounded-lg active:scale-105 transition duration-200"
              >
                Buat Dokumentasi
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDokumentasiPage;
