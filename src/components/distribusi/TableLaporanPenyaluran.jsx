import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HiOutlinePencil } from "react-icons/hi";
import { Label } from "flowbite-react";
import axios from "axios";
import { API_URL } from "../../redux/actions/transaksiAction";
import { getCategoryCoa } from "../../redux/actions/ziswafAction";

export default function TableLaporanPenyaluran() {
  const dispatch = useDispatch();
  const { coaCategory } = useSelector((state) => state.ziswaf);

  // Data states
  const [laporanData, setLaporanData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLaporan, setEditingLaporan] = useState(null);
  const [originalLaporanData, setOriginalLaporanData] = useState(null);
  const [editForm, setEditForm] = useState({
    nomorBukti: "",
    categoryName: "",
    transactionDate: "",
    description: "",
    categoryType: "",
    categoryId: "",
    debitDetails: [{ coaId: "", amount: 0 }],
    kreditDetails: [{ coaId: "", amount: 0 }],
  });
  const [editLoading, setEditLoading] = useState(false);

  // Fetch COA data
  useEffect(() => {
    dispatch(getCategoryCoa());
  }, [dispatch]);

  // Debug COA data loading
  useEffect(() => {
    if (coaCategory && coaCategory.length > 0) {
      console.log("COA data loaded successfully:", coaCategory.length, "items");
      console.log("Sample COA item:", coaCategory[0]);
    } else if (coaCategory && coaCategory.length === 0) {
      console.log("COA data is empty array");
    } else {
      console.log("COA data not loaded yet:", coaCategory);
    }
  }, [coaCategory]);

  // Fetch laporan penyaluran data
  const fetchLaporanData = async () => {
    setLoading(true);
    try {
      const tokenAdmin = localStorage.getItem("tokenAdmin");
      const response = await axios.get(
        `${API_URL}/transaction/get-all-penyaluran`,
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      setLaporanData(response.data || []);
    } catch (error) {
      console.error("Error fetching laporan penyaluran:", error);
      setLaporanData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanData();
  }, []);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle edit functions
  const openEditModal = (laporanItem) => {
    setEditingLaporan(laporanItem);
    setOriginalLaporanData(JSON.parse(JSON.stringify(laporanItem))); // Deep copy
    setEditForm({
      nomorBukti: laporanItem.nomorBukti || "",
      categoryName: laporanItem.categoryName || "",
      transactionDate: laporanItem.jurnal?.transactionDate || "",
      description: laporanItem.jurnal?.description || "",
      categoryType: laporanItem.jurnal?.categoryType || "",
      categoryId: laporanItem.jurnal?.categoryId || "",
      debitDetails: laporanItem.jurnal?.debitDetails || [
        { coaId: "", amount: 0 },
      ],
      kreditDetails: laporanItem.jurnal?.kreditDetails || [
        { coaId: "", amount: 0 },
      ],
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingLaporan(null);
    setOriginalLaporanData(null);
    setEditForm({
      nomorBukti: "",
      categoryName: "",
      transactionDate: "",
      description: "",
      categoryType: "",
      categoryId: "",
      debitDetails: [{ coaId: "", amount: 0 }],
      kreditDetails: [{ coaId: "", amount: 0 }],
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle debit/kredit rows
  const addDebitRow = () => {
    if (editForm.debitDetails.length >= 1) {
      alert("Debit hanya boleh maksimal 1 rekening!");
      return;
    }
    setEditForm((prev) => ({
      ...prev,
      debitDetails: [...prev.debitDetails, { coaId: "", amount: 0 }],
    }));
  };

  const addKreditRow = () => {
    setEditForm((prev) => ({
      ...prev,
      kreditDetails: [...prev.kreditDetails, { coaId: "", amount: 0 }],
    }));
  };

  const removeDebitRow = (index) => {
    if (editForm.debitDetails.length > 1) {
      setEditForm((prev) => ({
        ...prev,
        debitDetails: prev.debitDetails.filter((_, i) => i !== index),
      }));
    }
  };

  const removeKreditRow = (index) => {
    if (editForm.kreditDetails.length > 1) {
      setEditForm((prev) => ({
        ...prev,
        kreditDetails: prev.kreditDetails.filter((_, i) => i !== index),
      }));
    }
  };

  const handleDebitChange = (index, field, value) => {
    const updatedDebit = [...editForm.debitDetails];
    updatedDebit[index][field] =
      field === "amount" ? parseFloat(value) || 0 : value;
    setEditForm((prev) => ({
      ...prev,
      debitDetails: updatedDebit,
    }));
  };

  const handleKreditChange = (index, field, value) => {
    const updatedKredit = [...editForm.kreditDetails];
    updatedKredit[index][field] =
      field === "amount" ? parseFloat(value) || 0 : value;
    setEditForm((prev) => ({
      ...prev,
      kreditDetails: updatedKredit,
    }));
  };

  const getTotal = (type) => {
    const details =
      type === "debit" ? editForm.debitDetails : editForm.kreditDetails;
    return details.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingLaporan) return;

    // Validate total debit = total kredit
    if (getTotal("debit") !== getTotal("kredit")) {
      alert("Total debit dan kredit harus sama!");
      return;
    }

    setEditLoading(true);
    try {
      const tokenAdmin = localStorage.getItem("tokenAdmin");
      const payload = {
        transactionDate: editForm.transactionDate,
        description: editForm.description,
        categoryType: editForm.categoryType,
        categoryId: parseInt(editForm.categoryId) || editForm.categoryId,
        penyaluran: true,
        debitDetails: editForm.debitDetails.map((detail) => ({
          coaId: parseInt(detail.coaId),
          amount: parseFloat(detail.amount),
        })),
        kreditDetails: editForm.kreditDetails.map((detail) => ({
          coaId: parseInt(detail.coaId),
          amount: parseFloat(detail.amount),
        })),
      };

      const response = await axios.put(
        `${API_URL}/transaction/edit-penyaluran?nomorBukti=${editingLaporan.nomorBukti}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        alert("Laporan penyaluran berhasil diupdate!");
        closeEditModal();
        fetchLaporanData();
      }
    } catch (error) {
      console.error("Error updating laporan penyaluran:", error);

      // Restore original data if API call fails
      if (originalLaporanData) {
        setEditingLaporan(originalLaporanData);
        // Update the data in the table to show original values
        setLaporanData((prevData) =>
          prevData.map((item) =>
            item.nomorBukti === originalLaporanData.nomorBukti
              ? originalLaporanData
              : item
          )
        );
      }

      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Terjadi kesalahan saat mengupdate laporan penyaluran");
      }
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-500 table-auto">
          <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
            <tr className="text-left">
              <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg w-20">No</th>
              <th className="px-4 py-3 w-32">Nomor Bukti</th>
              <th className="px-4 py-3 w-40">Kategori</th>
              <th className="px-4 py-3 w-28">Tanggal</th>
              <th className="px-4 py-3 w-32">Total Debit</th>
              <th className="px-4 py-3 w-32">Total Kredit</th>
              <th className="px-4 py-3 min-w-64">Deskripsi</th>
              <th className="px-4 py-3 rounded-tr-lg rounded-br-lg w-24">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {laporanData.map((item, index) => {
              const totalDebit =
                item.jurnal?.debitDetails?.reduce(
                  (sum, d) => sum + (d.amount || 0),
                  0
                ) || 0;
              const totalKredit =
                item.jurnal?.kreditDetails?.reduce(
                  (sum, k) => sum + (k.amount || 0),
                  0
                ) || 0;

              return (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-gray-50 border-b hover:bg-blue-50 transition-colors duration-200"
                >
                  <td className="px-4 py-4 font-medium whitespace-nowrap text-center">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4">
                    <div className="max-w-32 truncate" title={item.nomorBukti}>
                      {item.nomorBukti}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className="max-w-40 truncate"
                      title={item.categoryName}
                    >
                      {item.categoryName}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {item.jurnal?.transactionDate}
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    Rp {formatNumber(totalDebit)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    Rp {formatNumber(totalKredit)}
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className="max-w-64 line-clamp-3 text-sm"
                      dangerouslySetInnerHTML={{
                        __html: item.jurnal?.description || "",
                      }}
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition duration-200 flex items-center gap-1 text-sm"
                      onClick={() => openEditModal(item)}
                      title="Edit Laporan Penyaluran"
                    >
                      <HiOutlinePencil className="w-3 h-3" />
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Laporan Penyaluran
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nomorBukti" value="Nomor Bukti" />
                    <input
                      type="text"
                      id="nomorBukti"
                      name="nomorBukti"
                      value={editForm.nomorBukti}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryName" value="Nama Kategori" />
                    <input
                      type="text"
                      id="categoryName"
                      name="categoryName"
                      value={editForm.categoryName}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="transactionDate"
                      value="Tanggal Transaksi"
                    />
                    <input
                      type="date"
                      id="transactionDate"
                      name="transactionDate"
                      value={editForm.transactionDate}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryType" value="Tipe Kategori" />
                    <select
                      id="categoryType"
                      name="categoryType"
                      value={editForm.categoryType}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih Tipe</option>
                      <option value="campaign">Campaign</option>
                      <option value="zakat">Zakat</option>
                      <option value="infak">Infak</option>
                      <option value="wakaf">Wakaf</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" value="Deskripsi" />
                  <textarea
                    id="description"
                    name="description"
                    value={editForm.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Informasi Aturan Debit/Kredit */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        Aturan Debit dan Kredit
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>
                          • <strong>Debit:</strong> Maksimal 1 rekening
                          (biasanya untuk rekening yang menerima dana)
                        </li>
                        <li>
                          • <strong>Kredit:</strong> Bisa lebih dari 1 rekening
                          (biasanya untuk rekening yang mengeluarkan dana)
                        </li>
                        <li>
                          •{" "}
                          <strong>
                            Total debit harus sama dengan total kredit
                          </strong>{" "}
                          untuk menjaga keseimbangan
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Debit Details */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Detail Debit
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Maksimal 1 rekening debit
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addDebitRow}
                      disabled={editForm.debitDetails.length >= 1}
                      className={`px-3 py-1 rounded-lg text-sm transition duration-200 ${
                        editForm.debitDetails.length >= 1
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      + Tambah Debit
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left border-b border-gray-300 w-16">
                            No
                          </th>
                          <th className="px-4 py-3 text-left border-b border-gray-300">
                            Rekening/COA
                          </th>
                          <th className="px-4 py-3 text-left border-b border-gray-300 w-32">
                            Jumlah
                          </th>
                          <th className="px-4 py-3 text-left border-b border-gray-300 w-20">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {editForm.debitDetails.map((debit, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 border-b border-gray-200 text-center">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200">
                              <select
                                value={debit.coaId}
                                onChange={(e) =>
                                  handleDebitChange(
                                    index,
                                    "coaId",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              >
                                <option value="">Pilih Rekening</option>
                                {coaCategory && coaCategory.length > 0 ? (
                                  coaCategory.map((coa) => (
                                    <option key={coa.id} value={coa.id}>
                                      {`${coa.accountCode || ""} ${
                                        coa.accountName ||
                                        coa.coaName ||
                                        coa.name ||
                                        `COA ${coa.id}`
                                      }`.trim()}
                                    </option>
                                  ))
                                ) : coaCategory && coaCategory.length === 0 ? (
                                  <option value="" disabled>
                                    Tidak ada data rekening
                                  </option>
                                ) : (
                                  <option value="" disabled>
                                    Loading rekening...
                                  </option>
                                )}
                              </select>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200">
                              <input
                                type="number"
                                value={debit.amount}
                                onChange={(e) =>
                                  handleDebitChange(
                                    index,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                placeholder="0"
                                required
                              />
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 text-center">
                              {editForm.debitDetails.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeDebitRow(index)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                                >
                                  Hapus
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                          <td
                            colSpan="2"
                            className="px-4 py-3 border-b border-gray-300"
                          >
                            Total Debit
                          </td>
                          <td className="px-4 py-3 border-b border-gray-300 text-right">
                            {formatCurrency(getTotal("debit"))}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-300"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Kredit Details */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Detail Kredit
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Bisa lebih dari 1 rekening kredit
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addKreditRow}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      + Tambah Kredit
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left border-b border-gray-300 w-16">
                            No
                          </th>
                          <th className="px-4 py-3 text-left border-b border-gray-300">
                            Rekening/COA
                          </th>
                          <th className="px-4 py-3 text-left border-b border-gray-300 w-32">
                            Jumlah
                          </th>
                          <th className="px-4 py-3 text-left border-b border-gray-300 w-20">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {editForm.kreditDetails.map((kredit, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 border-b border-gray-200 text-center">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200">
                              <select
                                value={kredit.coaId}
                                onChange={(e) =>
                                  handleKreditChange(
                                    index,
                                    "coaId",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              >
                                <option value="">Pilih Rekening</option>
                                {coaCategory && coaCategory.length > 0 ? (
                                  coaCategory.map((coa) => (
                                    <option key={coa.id} value={coa.id}>
                                      {`${coa.accountCode || ""} ${
                                        coa.accountName ||
                                        coa.coaName ||
                                        coa.name ||
                                        `COA ${coa.id}`
                                      }`.trim()}
                                    </option>
                                  ))
                                ) : coaCategory && coaCategory.length === 0 ? (
                                  <option value="" disabled>
                                    Tidak ada data rekening
                                  </option>
                                ) : (
                                  <option value="" disabled>
                                    Loading rekening...
                                  </option>
                                )}
                              </select>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200">
                              <input
                                type="number"
                                value={kredit.amount}
                                onChange={(e) =>
                                  handleKreditChange(
                                    index,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                placeholder="0"
                                required
                              />
                            </td>
                            <td className="px-4 py-3 border-b border-gray-200 text-center">
                              {editForm.kreditDetails.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeKreditRow(index)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                                >
                                  Hapus
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                          <td
                            colSpan="2"
                            className="px-4 py-3 border-b border-gray-300"
                          >
                            Total Kredit
                          </td>
                          <td className="px-4 py-3 border-b border-gray-300 text-right">
                            {formatCurrency(getTotal("kredit"))}
                          </td>
                          <td className="px-4 py-3 border-b border-gray-300"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Balance Check */}
                {getTotal("debit") !== getTotal("kredit") && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <strong>Peringatan:</strong> Total debit (
                        {formatCurrency(getTotal("debit"))}) tidak sama dengan
                        total kredit ({formatCurrency(getTotal("kredit"))})
                      </div>
                    </div>
                  </div>
                )}

                {/* Balance Success */}
                {getTotal("debit") === getTotal("kredit") &&
                  getTotal("debit") > 0 && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div>
                          <strong>Balance:</strong> Total debit dan kredit sudah
                          seimbang ({formatCurrency(getTotal("debit"))})
                        </div>
                      </div>
                    </div>
                  )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={closeEditModal}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={
                  editLoading || getTotal("debit") !== getTotal("kredit")
                }
                onClick={handleEditSubmit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {editLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
