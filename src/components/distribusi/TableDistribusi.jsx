import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDistribution } from "../../redux/actions/transaksiAction";
import { HiOutlinePencil } from "react-icons/hi";
import { FileInput, Label } from "flowbite-react";
import axios from "axios";
import { API_URL } from "../../redux/actions/transaksiAction";

export default function TableDistribusi() {
  const dispatch = useDispatch();
  const { pN } = useSelector((state) => state.pn);
  const { distribution } = useSelector((state) => state.summary);
  const { createDokumentasi } = useSelector((state) => state.summary);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState(null);
  const [editForm, setEditForm] = useState({
    distributionAmount: "",
    distributionDate: "",
    receiver: "",
    description: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (createDokumentasi == false) {
      dispatch(getDistribution(pN - 1));
    }
  }, [dispatch, pN, createDokumentasi]);
  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle edit functions
  const openEditModal = (distributionItem) => {
    setEditingDistribution(distributionItem);
    setEditForm({
      distributionAmount: distributionItem.distributionAmount || "",
      distributionDate: distributionItem.distributionDate || "",
      receiver: distributionItem.receiver || "",
      description: distributionItem.description || "",
      image: null,
    });
    setImagePreview(null);
    setExistingImage(distributionItem.image || null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingDistribution(null);
    setEditForm({
      distributionAmount: "",
      distributionDate: "",
      receiver: "",
      description: "",
      image: null,
    });
    setImagePreview(null);
    setExistingImage(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm((prev) => ({
        ...prev,
        image: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDistribution) return;

    setEditLoading(true);
    try {
      const tokenAdmin = localStorage.getItem("tokenAdmin");
      const formData = new FormData();
      formData.append("distributionAmount", editForm.distributionAmount);
      formData.append("distributionDate", editForm.distributionDate);
      formData.append("receiver", editForm.receiver);
      formData.append("description", editForm.description);

      // Only append image if user uploaded a new one
      if (editForm.image) {
        formData.append("image", editForm.image);
      }

      const response = await axios.put(
        `${API_URL}/distribution/edit/${editingDistribution.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );

      if (response.data) {
        alert("Distribusi berhasil diupdate!");
        closeEditModal();
        // Refresh data
        dispatch(getDistribution(pN - 1));
      }
    } catch (error) {
      console.error("Error updating distribution:", error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Terjadi kesalahan saat mengupdate distribusi");
      }
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-500 table-auto">
          <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
            <tr className="text-left">
              <th
                scope="col"
                className="px-4 py-3 rounded-tl-lg rounded-bl-lg w-16"
              >
                ID
              </th>
              <th scope="col" className="px-4 py-3 w-20">
                Gambar
              </th>
              <th scope="col" className="px-4 py-3 w-32">
                Jumlah Distribusi
              </th>
              <th scope="col" className="px-4 py-3 w-28">
                Tanggal
              </th>
              <th scope="col" className="px-4 py-3 w-40">
                Penerima
              </th>
              <th scope="col" className="px-4 py-3 w-24">
                Kategori
              </th>
              <th scope="col" className="px-4 py-3 min-w-96">
                Deskripsi
              </th>
              <th
                scope="col"
                className="px-4 py-3 rounded-tr-lg rounded-br-lg w-24"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {distribution.map((item) => (
              <tr
                key={item?.id}
                className="odd:bg-white even:bg-gray-50 border-b hover:bg-blue-50 transition-colors duration-200"
              >
                <td className="px-4 py-4 font-medium whitespace-nowrap text-center">
                  {item?.id}
                </td>
                <td className="px-4 py-4 text-center">
                  {item?.image ? (
                    <img
                      src={item.image}
                      alt="Distribution"
                      className="w-12 h-12 object-cover rounded-lg border mx-auto"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg border flex items-center justify-center mx-auto">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 text-right font-medium">
                  Rp {formatNumber(item?.distributionAmount || 0)}
                </td>
                <td className="px-4 py-4 text-center">
                  {item?.distributionDate}
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-40 truncate" title={item?.receiver}>
                    {item?.receiver}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {item?.category}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div
                    className="max-w-96 line-clamp-3 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: item?.description || "",
                    }}
                  />
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition duration-200 flex items-center gap-1 text-sm"
                    onClick={() => openEditModal(item)}
                    title="Edit Distribusi"
                  >
                    <HiOutlinePencil className="w-3 h-3" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Distribusi
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
                {/* Distribution Amount */}
                <div>
                  <Label
                    htmlFor="distributionAmount"
                    value="Jumlah Distribusi"
                  />
                  <input
                    type="number"
                    id="distributionAmount"
                    name="distributionAmount"
                    value={editForm.distributionAmount}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Distribution Date */}
                <div>
                  <Label
                    htmlFor="distributionDate"
                    value="Tanggal Distribusi"
                  />
                  <input
                    type="date"
                    id="distributionDate"
                    name="distributionDate"
                    value={editForm.distributionDate}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Receiver */}
                <div>
                  <Label htmlFor="receiver" value="Penerima" />
                  <input
                    type="text"
                    id="receiver"
                    name="receiver"
                    value={editForm.receiver}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" value="Deskripsi" />
                  <textarea
                    id="description"
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <Label htmlFor="image" value="Gambar (Opsional)" />

                  {/* Show existing image if available */}
                  {existingImage && !imagePreview && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Gambar saat ini:
                      </p>
                      <div className="flex justify-center">
                        <img
                          src={existingImage}
                          alt="Current"
                          className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                        />
                      </div>
                    </div>
                  )}

                  <FileInput
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full"
                  />

                  {/* Show preview of new image */}
                  {imagePreview && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Gambar baru:</p>
                      <div className="flex justify-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-40 h-40 object-cover rounded-lg border shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
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
                disabled={editLoading}
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
