import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  editPageImage,
  getPageImage,
  uploadPageImage,
} from "../../redux/actions/authAction";
import { FileInput, Label } from "flowbite-react";
import { OrbitProgress } from "react-loading-indicators";
import { IoMdArrowBack } from "react-icons/io";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from "react-icons/hi";
import { Editor } from "@tinymce/tinymce-react";

export default function Tampilan() {
  const dispatch = useDispatch();
  const { pageImage } = useSelector((state) => state.page);
  const [loading, setLoading] = useState(false);
  const [button, setButton] = useState("dashboard");
  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
  });
  const [previews, setPreviews] = useState({
    preview1: null,
    preview2: null,
    preview3: null,
  });

  // Mitra states
  const [mitraData, setMitraData] = useState([]);
  const [mitraLoading, setMitraLoading] = useState(false);
  const [showMitraModal, setShowMitraModal] = useState(false);
  const [mitraForm, setMitraForm] = useState({
    name: "",
    image: null,
  });
  const [mitraFormPreview, setMitraFormPreview] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMitraId, setEditingMitraId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMitraId, setDeletingMitraId] = useState(null);

  // Ziswaf Image states
  const [ziswafImageData, setZiswafImageData] = useState([]);
  const [ziswafImageLoading, setZiswafImageLoading] = useState(false);
  const [showZiswafImageModal, setShowZiswafImageModal] = useState(false);
  const [ziswafImageForm, setZiswafImageForm] = useState({
    category: "",
    image: null,
  });
  const [ziswafImageFormPreview, setZiswafImageFormPreview] = useState(null);
  const [isZiswafImageEditMode, setIsZiswafImageEditMode] = useState(false);
  const [editingZiswafImageId, setEditingZiswafImageId] = useState(null);
  const [showZiswafImageDeleteModal, setShowZiswafImageDeleteModal] =
    useState(false);
  const [deletingZiswafImageId, setDeletingZiswafImageId] = useState(null);

  // Literatur states
  const [literaturData, setLiteraturData] = useState([]);
  const [literaturLoading, setLiteraturLoading] = useState(false);
  const [showLiteraturModal, setShowLiteraturModal] = useState(false);
  const [literaturForm, setLiteraturForm] = useState({
    literaturName: "",
    text: "",
  });
  const [isLiteraturEditMode, setIsLiteraturEditMode] = useState(false);
  const [editingLiteraturId, setEditingLiteraturId] = useState(null);
  const [showLiteraturDeleteModal, setShowLiteraturDeleteModal] =
    useState(false);
  const [deletingLiteraturId, setDeletingLiteraturId] = useState(null);

  // Base URL for API
  const baseUrl = "https://skyconnect.lazis-sa.org";

  const handleImageUpload = (e, imageKey, previewKey) => {
    const file = e.target.files[0];
    if (file) {
      // Update image state
      setImages((prev) => ({ ...prev, [imageKey]: file }));

      // Generate preview URL
      const imageUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [previewKey]: imageUrl }));
    }
  };
  const handleSubmit = () => {
    if (images.image1 || images.image2 || images.image3) {
      // Dispatch action to upload images
      setLoading(true);
      dispatch(uploadPageImage(images)).finally(() => {
        setLoading(false);
        setButton("dashboard");
      });
    } else {
      alert("Please upload at least one image before submitting.");
    }
  };
  const handleEdit = () => {
    if (images.image1 || images.image2 || images.image3) {
      // Dispatch action to upload images
      setLoading(true);
      dispatch(editPageImage(images)).finally(() => {
        setLoading(false);
        setButton("dashboard");
      });
    } else {
      alert("Please upload at least one image before submitting.");
    }
  };

  // Mitra functions
  const fetchMitraData = async () => {
    try {
      setMitraLoading(true);
      const response = await fetch(`${baseUrl}/api/mitra/get-all`);
      const data = await response.json();
      setMitraData(data);
    } catch (error) {
      console.error("Error fetching mitra data:", error);
    } finally {
      setMitraLoading(false);
    }
  };

  // Ziswaf Image functions
  const fetchZiswafImageData = async () => {
    try {
      setZiswafImageLoading(true);
      const response = await fetch(`${baseUrl}/api/ziswaf-image/get-all`);
      const data = await response.json();
      setZiswafImageData(data);
    } catch (error) {
      console.error("Error fetching ziswaf image data:", error);
    } finally {
      setZiswafImageLoading(false);
    }
  };

  // Literatur functions
  const fetchLiteraturData = async () => {
    try {
      setLiteraturLoading(true);
      const response = await fetch(`${baseUrl}/api/literatur/get-all`);
      const data = await response.json();
      setLiteraturData(data);
    } catch (error) {
      console.error("Error fetching literatur data:", error);
    } finally {
      setLiteraturLoading(false);
    }
  };

  const handleMitraImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMitraForm((prev) => ({ ...prev, image: file }));
      const imageUrl = URL.createObjectURL(file);
      setMitraFormPreview(imageUrl);
    }
  };

  const resetMitraForm = () => {
    setMitraForm({ name: "", image: null });
    setMitraFormPreview(null);
    setIsEditMode(false);
    setEditingMitraId(null);
  };

  const handleCreateMitra = async () => {
    if (!mitraForm.name || !mitraForm.image) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setMitraLoading(true);
      const formData = new FormData();
      formData.append("name", mitraForm.name);
      formData.append("image", mitraForm.image);

      const response = await fetch(`${baseUrl}/api/mitra/create`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Mitra created successfully");
        resetMitraForm();
        setShowMitraModal(false);
        fetchMitraData();
      } else {
        alert("Failed to create mitra");
      }
    } catch (error) {
      console.error("Error creating mitra:", error);
      alert("Error creating mitra");
    } finally {
      setMitraLoading(false);
    }
  };

  const handleEditMitra = async () => {
    if (!mitraForm.name) {
      alert("Please fill in the name field");
      return;
    }

    try {
      setMitraLoading(true);
      const formData = new FormData();
      formData.append("name", mitraForm.name);
      if (mitraForm.image) {
        formData.append("image", mitraForm.image);
      }

      const response = await fetch(
        `${baseUrl}/api/mitra/edit/${editingMitraId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        alert("Mitra updated successfully");
        resetMitraForm();
        setShowMitraModal(false);
        fetchMitraData();
      } else {
        alert("Failed to update mitra");
      }
    } catch (error) {
      console.error("Error updating mitra:", error);
      alert("Error updating mitra");
    } finally {
      setMitraLoading(false);
    }
  };

  const handleDeleteMitra = async () => {
    try {
      setMitraLoading(true);
      const response = await fetch(
        `${baseUrl}/api/mitra/delete/${deletingMitraId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Mitra deleted successfully");
        setShowDeleteModal(false);
        setDeletingMitraId(null);
        fetchMitraData();
      } else {
        alert("Failed to delete mitra");
      }
    } catch (error) {
      console.error("Error deleting mitra:", error);
      alert("Error deleting mitra");
    } finally {
      setMitraLoading(false);
    }
  };

  const openEditModal = async (mitraId) => {
    try {
      const response = await fetch(`${baseUrl}/api/mitra/get-by-id/${mitraId}`);
      const data = await response.json();

      setMitraForm({ name: data.name, image: null });
      setMitraFormPreview(data.image);
      setIsEditMode(true);
      setEditingMitraId(mitraId);
      setShowMitraModal(true);
    } catch (error) {
      console.error("Error fetching mitra details:", error);
      alert("Error fetching mitra details");
    }
  };

  const openCreateModal = () => {
    resetMitraForm();
    setShowMitraModal(true);
  };

  const openDeleteModal = (mitraId) => {
    setDeletingMitraId(mitraId);
    setShowDeleteModal(true);
  };

  // Ziswaf Image CRUD functions
  const handleZiswafImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setZiswafImageForm((prev) => ({ ...prev, image: file }));
      const imageUrl = URL.createObjectURL(file);
      setZiswafImageFormPreview(imageUrl);
    }
  };

  const resetZiswafImageForm = () => {
    setZiswafImageForm({ category: "", image: null });
    setZiswafImageFormPreview(null);
    setIsZiswafImageEditMode(false);
    setEditingZiswafImageId(null);
  };

  const handleCreateZiswafImage = async () => {
    if (!ziswafImageForm.category || !ziswafImageForm.image) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setZiswafImageLoading(true);
      const formData = new FormData();
      formData.append("category", ziswafImageForm.category);
      formData.append("image", ziswafImageForm.image);

      const response = await fetch(`${baseUrl}/api/ziswaf-image/create`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Ziswaf image created successfully");
        setShowZiswafImageModal(false);
        resetZiswafImageForm();
        fetchZiswafImageData();
      } else {
        alert("Failed to create ziswaf image");
      }
    } catch (error) {
      console.error("Error creating ziswaf image:", error);
      alert("Error creating ziswaf image");
    } finally {
      setZiswafImageLoading(false);
    }
  };

  const handleEditZiswafImage = async () => {
    if (!ziswafImageForm.category) {
      alert("Please fill in category field");
      return;
    }

    try {
      setZiswafImageLoading(true);
      const formData = new FormData();
      formData.append("category", ziswafImageForm.category);
      if (ziswafImageForm.image) {
        formData.append("image", ziswafImageForm.image);
      }

      const response = await fetch(
        `${baseUrl}/api/ziswaf-image/update/${editingZiswafImageId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        alert("Ziswaf image updated successfully");
        setShowZiswafImageModal(false);
        resetZiswafImageForm();
        fetchZiswafImageData();
      } else {
        alert("Failed to update ziswaf image");
      }
    } catch (error) {
      console.error("Error updating ziswaf image:", error);
      alert("Error updating ziswaf image");
    } finally {
      setZiswafImageLoading(false);
    }
  };

  const handleDeleteZiswafImage = async () => {
    try {
      setZiswafImageLoading(true);
      const response = await fetch(
        `${baseUrl}/api/ziswaf-image/delete/${deletingZiswafImageId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Ziswaf image deleted successfully");
        setShowZiswafImageDeleteModal(false);
        setDeletingZiswafImageId(null);
        fetchZiswafImageData();
      } else {
        alert("Failed to delete ziswaf image");
      }
    } catch (error) {
      console.error("Error deleting ziswaf image:", error);
      alert("Error deleting ziswaf image");
    } finally {
      setZiswafImageLoading(false);
    }
  };

  const openZiswafImageEditModal = async (ziswafImageId) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/ziswaf-image/get-by-id/${ziswafImageId}`
      );
      const data = await response.json();

      setZiswafImageForm({ category: data.category, image: null });
      setZiswafImageFormPreview(data.image);
      setIsZiswafImageEditMode(true);
      setEditingZiswafImageId(ziswafImageId);
      setShowZiswafImageModal(true);
    } catch (error) {
      console.error("Error fetching ziswaf image details:", error);
      alert("Error fetching ziswaf image details");
    }
  };

  const openZiswafImageCreateModal = () => {
    resetZiswafImageForm();
    setShowZiswafImageModal(true);
  };

  const openZiswafImageDeleteModal = (ziswafImageId) => {
    setDeletingZiswafImageId(ziswafImageId);
    setShowZiswafImageDeleteModal(true);
  };

  // Literatur CRUD functions
  const resetLiteraturForm = () => {
    setLiteraturForm({ literaturName: "", text: "" });
    setIsLiteraturEditMode(false);
    setEditingLiteraturId(null);
  };

  const handleCreateLiteratur = async () => {
    if (
      !literaturForm.literaturName ||
      !literaturForm.text ||
      literaturForm.text.trim() === ""
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLiteraturLoading(true);
      const response = await fetch(`${baseUrl}/api/literatur/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(literaturForm),
      });

      if (response.ok) {
        alert("Literatur created successfully");
        setShowLiteraturModal(false);
        resetLiteraturForm();
        fetchLiteraturData();
      } else {
        alert("Failed to create literatur");
      }
    } catch (error) {
      console.error("Error creating literatur:", error);
      alert("Error creating literatur");
    } finally {
      setLiteraturLoading(false);
    }
  };

  const handleEditLiteratur = async () => {
    if (
      !literaturForm.literaturName ||
      !literaturForm.text ||
      literaturForm.text.trim() === ""
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLiteraturLoading(true);
      const response = await fetch(
        `${baseUrl}/api/literatur/edit/${editingLiteraturId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(literaturForm),
        }
      );

      if (response.ok) {
        alert("Literatur updated successfully");
        setShowLiteraturModal(false);
        resetLiteraturForm();
        fetchLiteraturData();
      } else {
        alert("Failed to update literatur");
      }
    } catch (error) {
      console.error("Error updating literatur:", error);
      alert("Error updating literatur");
    } finally {
      setLiteraturLoading(false);
    }
  };

  const handleDeleteLiteratur = async () => {
    try {
      setLiteraturLoading(true);
      const response = await fetch(
        `${baseUrl}/api/literatur/delete/${deletingLiteraturId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Literatur deleted successfully");
        setShowLiteraturDeleteModal(false);
        setDeletingLiteraturId(null);
        fetchLiteraturData();
      } else {
        alert("Failed to delete literatur");
      }
    } catch (error) {
      console.error("Error deleting literatur:", error);
      alert("Error deleting literatur");
    } finally {
      setLiteraturLoading(false);
    }
  };

  const openLiteraturEditModal = async (literaturId) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/literatur/get-by-id/${literaturId}`
      );
      const data = await response.json();

      setLiteraturForm({
        literaturName: data.literaturName,
        text: data.text,
      });
      setIsLiteraturEditMode(true);
      setEditingLiteraturId(literaturId);
      setShowLiteraturModal(true);
    } catch (error) {
      console.error("Error fetching literatur details:", error);
      alert("Error fetching literatur details");
    }
  };

  const openLiteraturCreateModal = () => {
    resetLiteraturForm();
    setShowLiteraturModal(true);
  };

  const openLiteraturDeleteModal = (literaturId) => {
    setDeletingLiteraturId(literaturId);
    setShowLiteraturDeleteModal(true);
  };

  useEffect(() => {
    {
      !loading && dispatch(getPageImage());
    }
  }, [dispatch, loading]);

  // Load mitra data on component mount
  useEffect(() => {
    fetchMitraData();
    fetchZiswafImageData();
    fetchLiteraturData();
  }, []);

  return (
    <div>
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Tampilan</h1>
        <div className="flex gap-4 items-center my-5">
          {pageImage.length > 0 && button == "dashboard" ? (
            <button
              className="
                 bg-blue-600 text-white hover:scale-105 duration-200
             p-2 rounded-lg shadow text-sm"
              onClick={() => setButton("edit")}
            >
              Upload Gambar
            </button>
          ) : pageImage.length == 0 && button == "dashboard" ? (
            <button
              className="
                 bg-blue-600 text-white hover:scale-105 duration-200
             p-2 rounded-lg shadow text-sm"
              onClick={() => setButton("create")}
            >
              Upload Gambar
            </button>
          ) : (
            <button
              className="
                 bg-blue-600 text-white hover:scale-105 duration-200
             p-2 rounded-lg shadow text-sm flex items-center gap-2"
              onClick={() => setButton("dashboard")}
            >
              <IoMdArrowBack /> Kembali
            </button>
          )}
        </div>
        {button == "create" && (
          <div>
            <h1 className="font-semibold text-gray-800 text-lg">
              Form Upload Images
            </h1>
            <div className="grid grid-cols-3 gap-4 items-center justify-center">
              {/* Image 1 */}
              <Label
                htmlFor="image1"
                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                {previews.preview1 ? (
                  <img
                    src={previews.preview1}
                    alt="Preview Image 1"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Placeholder />
                )}
                <FileInput
                  id="image1"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "image1", "preview1")}
                  accept="image/*"
                />
              </Label>

              {/* Image 2 */}
              <Label
                htmlFor="image2"
                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                {previews.preview2 ? (
                  <img
                    src={previews.preview2}
                    alt="Preview Image 2"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Placeholder />
                )}
                <FileInput
                  id="image2"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "image2", "preview2")}
                  accept="image/*"
                />
              </Label>

              {/* Image 3 */}
              <Label
                htmlFor="image3"
                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                {previews.preview3 ? (
                  <img
                    src={previews.preview3}
                    alt="Preview Image 3"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Placeholder />
                )}
                <FileInput
                  id="image3"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "image3", "preview3")}
                  accept="image/*"
                />
              </Label>
            </div>
            <div className="mt-4">
              {loading ? (
                <OrbitProgress
                  variant="dotted"
                  color="#69c53e"
                  text=""
                  style={{ fontSize: "6px" }}
                  textColor=""
                />
              ) : (
                <div className="flex gap-2 items-center">
                  <button
                    onClick={handleSubmit}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        {button == "edit" && (
          <div>
            <h1 className="font-semibold text-gray-800 text-lg">
              Form Edit Images
            </h1>
            <div className="grid grid-cols-3 gap-4 items-center justify-center">
              {/* Image 1 */}
              <Label
                htmlFor="image1"
                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                {previews.preview1 ? (
                  <img
                    src={previews.preview1}
                    alt="Preview Image 1"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <img
                    src={pageImage[0]?.image_1}
                    alt="Preview Image 1"
                    className="h-full w-full object-contain"
                  />
                )}
                <FileInput
                  id="image1"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "image1", "preview1")}
                  accept="image/*"
                />
              </Label>

              {/* Image 2 */}
              <Label
                htmlFor="image2"
                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                {previews.preview2 ? (
                  <img
                    src={previews.preview2}
                    alt="Preview Image 2"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <img
                    src={pageImage[0]?.image_2}
                    alt="Preview Image 1"
                    className="h-full w-full object-contain"
                  />
                )}
                <FileInput
                  id="image2"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "image2", "preview2")}
                  accept="image/*"
                />
              </Label>

              {/* Image 3 */}
              <Label
                htmlFor="image3"
                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                {previews.preview3 ? (
                  <img
                    src={previews.preview3}
                    alt="Preview Image 3"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <img
                    src={pageImage[0]?.image_3}
                    alt="Preview Image 1"
                    className="h-full w-full object-contain"
                  />
                )}
                <FileInput
                  id="image3"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, "image3", "preview3")}
                  accept="image/*"
                />
              </Label>
            </div>
            <div className="mt-4">
              {loading ? (
                <OrbitProgress
                  variant="dotted"
                  color="#69c53e"
                  text=""
                  style={{ fontSize: "6px" }}
                  textColor=""
                />
              ) : (
                <button
                  onClick={handleEdit}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg"
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}
        {button === "dashboard" && (
          <div className="grid grid-cols-3 gap-4">
            {Array(3)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="relative">
                  <label
                    htmlFor={`image-${index}`}
                    className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                  >
                    {pageImage.length > 0 ? (
                      <img
                        src={pageImage[0]?.[`image_${index + 1}`]}
                        alt={`Preview Image ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Placeholder2 />
                    )}
                  </label>
                </div>
              ))}
          </div>
        )}
      </div>
      {/* Mitra Section */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Kelola Mitra
          </h1>
          <button
            className="bg-green-600 text-white hover:scale-105 duration-200 p-3 rounded-lg shadow text-sm flex items-center gap-2"
            onClick={openCreateModal}
          >
            <HiOutlinePlus /> Tambah Mitra
          </button>
        </div>

        {/* Mitra Table */}
        {mitraLoading ? (
          <div className="flex justify-center items-center py-8">
            <OrbitProgress
              variant="dotted"
              color="#69c53e"
              text=""
              style={{ fontSize: "6px" }}
              textColor=""
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Mitra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mitraData.map((mitra, index) => (
                  <tr key={mitra.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={mitra.image}
                        alt={mitra.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {mitra.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-blue-600"
                          onClick={() => openEditModal(mitra.id)}
                        >
                          <HiOutlinePencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-red-600"
                          onClick={() => openDeleteModal(mitra.id)}
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mitraData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Belum ada data mitra
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showMitraModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
            <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
                onClick={() => setShowMitraModal(false)}
              >
                &times;
              </button>
              <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600">
                {isEditMode ? "Edit Mitra" : "Tambah Mitra Baru"}
              </h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nama Mitra
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Masukkan nama mitra"
                    value={mitraForm.name}
                    onChange={(e) =>
                      setMitraForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="flex w-full items-center justify-center">
                  <Label
                    htmlFor="dropzone-file-mitra"
                    className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                  >
                    {mitraFormPreview ? (
                      <img
                        src={mitraFormPreview}
                        alt="Mitra Image"
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
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          SVG, PNG, JPG or GIF (MAX. 800x600px / 1Mb)
                        </p>
                      </div>
                    )}
                    <FileInput
                      id="dropzone-file-mitra"
                      className="hidden"
                      onChange={handleMitraImageUpload}
                      accept="image/*"
                    />
                  </Label>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
                    onClick={() => setShowMitraModal(false)}
                  >
                    Cancel
                  </button>
                  {mitraLoading ? (
                    <div className="w-full flex justify-center mt-8">
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
                      type="button"
                      onClick={isEditMode ? handleEditMitra : handleCreateMitra}
                      className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200"
                    >
                      {isEditMode ? "Update Mitra" : "Tambah Mitra"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative m-4">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
                onClick={() => setShowDeleteModal(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-semibold mb-4 text-center text-gray-600">
                Konfirmasi Hapus
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus mitra ini?
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Batal
                </button>
                {mitraLoading ? (
                  <div className="w-full flex justify-center mt-4">
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
                    type="button"
                    onClick={handleDeleteMitra}
                    className="px-6 py-2 w-full bg-red-500 text-white rounded-lg active:scale-105 transition duration-200"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ziswaf Image Section */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-800">
              Kelola Ziswaf Image
            </h1>
            <button
              className="bg-green-600 text-white hover:scale-105 duration-200 p-3 rounded-lg shadow text-sm flex items-center gap-2"
              onClick={openZiswafImageCreateModal}
            >
              <HiOutlinePlus /> Tambah Ziswaf Image
            </button>
          </div>

          {/* Ziswaf Image Table */}
          {ziswafImageLoading ? (
            <div className="flex justify-center items-center py-8">
              <OrbitProgress
                variant="dotted"
                color="#69c53e"
                text=""
                style={{ fontSize: "6px" }}
                textColor=""
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gambar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ziswafImageData.map((ziswafImage, index) => (
                    <tr key={ziswafImage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ziswafImage.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={ziswafImage.image}
                          alt={ziswafImage.category}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-blue-600"
                            onClick={() =>
                              openZiswafImageEditModal(ziswafImage.id)
                            }
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-red-600"
                            onClick={() =>
                              openZiswafImageDeleteModal(ziswafImage.id)
                            }
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {ziswafImageData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data ziswaf image
                </div>
              )}
            </div>
          )}

          {/* Create/Edit Ziswaf Image Modal */}
          {showZiswafImageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
              <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
                  onClick={() => setShowZiswafImageModal(false)}
                >
                  &times;
                </button>
                <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600">
                  {isZiswafImageEditMode
                    ? "Edit Ziswaf Image"
                    : "Tambah Ziswaf Image Baru"}
                </h2>
                <form
                  className="space-y-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Kategori
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={ziswafImageForm.category}
                      onChange={(e) =>
                        setZiswafImageForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="" disabled>
                        Pilih Kategori
                      </option>
                      <option value="zakat">Zakat</option>
                      <option value="infak">Infak</option>
                      <option value="dskl">DSKL</option>
                    </select>
                  </div>

                  <div className="flex w-full items-center justify-center">
                    <Label
                      htmlFor="dropzone-file-ziswaf"
                      className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                    >
                      {ziswafImageFormPreview ? (
                        <img
                          src={ziswafImageFormPreview}
                          alt="Ziswaf Image"
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
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG or GIF (MAX. 800x600px / 1Mb)
                          </p>
                        </div>
                      )}
                      <FileInput
                        id="dropzone-file-ziswaf"
                        className="hidden"
                        onChange={handleZiswafImageUpload}
                        accept="image/*"
                      />
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
                      onClick={() => setShowZiswafImageModal(false)}
                    >
                      Cancel
                    </button>
                    {ziswafImageLoading ? (
                      <div className="w-full flex justify-center mt-8">
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
                        type="button"
                        onClick={
                          isZiswafImageEditMode
                            ? handleEditZiswafImage
                            : handleCreateZiswafImage
                        }
                        className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200"
                      >
                        {isZiswafImageEditMode
                          ? "Update Ziswaf Image"
                          : "Tambah Ziswaf Image"}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Ziswaf Image Confirmation Modal */}
          {showZiswafImageDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative m-4">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
                  onClick={() => setShowZiswafImageDeleteModal(false)}
                >
                  &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-600">
                  Konfirmasi Hapus
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus ziswaf image ini?
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
                    onClick={() => setShowZiswafImageDeleteModal(false)}
                  >
                    Batal
                  </button>
                  {ziswafImageLoading ? (
                    <div className="w-full flex justify-center mt-4">
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
                      type="button"
                      onClick={handleDeleteZiswafImage}
                      className="px-6 py-2 w-full bg-red-500 text-white rounded-lg active:scale-105 transition duration-200"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Literatur Section */}
        <div className="mt-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-800">
              Kelola Literatur
            </h1>
            <button
              className="bg-green-600 text-white hover:scale-105 duration-200 p-3 rounded-lg shadow text-sm flex items-center gap-2"
              onClick={openLiteraturCreateModal}
            >
              <HiOutlinePlus /> Tambah Literatur
            </button>
          </div>

          {/* Literatur Table */}
          {literaturLoading ? (
            <div className="flex justify-center items-center py-8">
              <OrbitProgress
                variant="dotted"
                color="#69c53e"
                text=""
                style={{ fontSize: "6px" }}
                textColor=""
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Literatur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {literaturData.map((literatur, index) => (
                    <tr key={literatur.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {literatur.literaturName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div
                          className="truncate"
                          dangerouslySetInnerHTML={{
                            __html: literatur.text
                              ? literatur.text
                                  .replace(/<[^>]*>/g, "")
                                  .substring(0, 100) + "..."
                              : "",
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-blue-600"
                            onClick={() => openLiteraturEditModal(literatur.id)}
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-red-600"
                            onClick={() =>
                              openLiteraturDeleteModal(literatur.id)
                            }
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {literaturData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Belum ada data literatur
                </div>
              )}
            </div>
          )}

          {/* Create/Edit Literatur Modal */}
          {showLiteraturModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
              <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
                  onClick={() => setShowLiteraturModal(false)}
                >
                  &times;
                </button>
                <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600">
                  {isLiteraturEditMode
                    ? "Edit Literatur"
                    : "Tambah Literatur Baru"}
                </h2>
                <form
                  className="space-y-6"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nama Literatur
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={literaturForm.literaturName}
                      onChange={(e) =>
                        setLiteraturForm((prev) => ({
                          ...prev,
                          literaturName: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="" disabled>
                        Pilih Literatur
                      </option>
                      <option value="Khidmah Dakwah">Khidmah Dakwah</option>
                      <option value="Khidmah Ekonomi">Khidmah Ekonomi</option>
                      <option value="Khidmah Kesehatan">
                        Khidmah Kesehatan
                      </option>
                      <option value="Khidmah Lingkungan">
                        Khidmah Lingkungan
                      </option>
                      <option value="Khidmah Pendidikan">
                        Khidmah Pendidikan
                      </option>
                      <option value="Khidmah Sosial">Khidmah Sosial</option>
                      <option value="Tujuan">Tujuan</option>
                      <option value="Visi Misi">Visi Misi</option>
                      <option value="Tentang Kami">Tentang Kami</option>
                      <option value="Khidmah Organisasi">
                        Khidmah Organisasi
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Teks
                    </label>
                    <Editor
                      apiKey="e3m2xvaijq07t0pv56vwlvxn41f4ro15a65t7kbjpt9packt"
                      value={literaturForm.text}
                      onEditorChange={(newValue) =>
                        setLiteraturForm((prev) => ({
                          ...prev,
                          text: newValue,
                        }))
                      }
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

                  <div className="space-y-2">
                    <button
                      type="button"
                      className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
                      onClick={() => setShowLiteraturModal(false)}
                    >
                      Cancel
                    </button>
                    {literaturLoading ? (
                      <div className="w-full flex justify-center mt-8">
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
                        type="button"
                        onClick={
                          isLiteraturEditMode
                            ? handleEditLiteratur
                            : handleCreateLiteratur
                        }
                        className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200"
                      >
                        {isLiteraturEditMode
                          ? "Update Literatur"
                          : "Tambah Literatur"}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Literatur Confirmation Modal */}
          {showLiteraturDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative m-4">
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
                  onClick={() => setShowLiteraturDeleteModal(false)}
                >
                  &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-center text-gray-600">
                  Konfirmasi Hapus
                </h2>
                <p className="text-center text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus literatur ini?
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
                    onClick={() => setShowLiteraturDeleteModal(false)}
                  >
                    Batal
                  </button>
                  {literaturLoading ? (
                    <div className="w-full flex justify-center mt-4">
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
                      type="button"
                      onClick={handleDeleteLiteratur}
                      className="px-6 py-2 w-full bg-red-500 text-white rounded-lg active:scale-105 transition duration-200"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Placeholder Component
function Placeholder() {
  return (
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
        <span className="font-semibold">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-gray-500">
        SVG, PNG, JPG, or GIF (MAX. 800x600px / 5Mb)
      </p>
    </div>
  );
}
function Placeholder2() {
  return (
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
      <p className="text-xs text-gray-500">
        SVG, PNG, JPG, or GIF (MAX. 800x600px / 5Mb)
      </p>
    </div>
  );
}
