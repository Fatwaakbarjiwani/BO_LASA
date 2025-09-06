import { useSelector, useDispatch } from "react-redux";
import { setModalCreateActive } from "../../redux/reducers/campaignReducer";
import { FileInput, Label } from "flowbite-react";
import { useEffect, useState } from "react";
import {
  createCampaign,
  getAllCampaignCategory,
} from "../../redux/actions/campaignAction";
import { OrbitProgress } from "react-loading-indicators";

function CreateCampaign() {
  const dispatch = useDispatch();
  const { modalCreateActive } = useSelector((state) => state.campaign);
  const { allCampaignCategory } = useSelector((state) => state.campaign);
  const [campaignImage, setCampaignImage] = useState(null);
  const [showImage, setShowImage] = useState(null);
  const [isLoading, setLoading] = useState(false);

  // State for form inputs
  const [category, setCategory] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [campaignCode, setCampaignCode] = useState("");
  const [location, setLocation] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [campaignImageDesc1, setCampaignImageDesc1] = useState(null);
  const [campaignImageDesc2, setCampaignImageDesc2] = useState(null);
  const [campaignImageDesc3, setCampaignImageDesc3] = useState(null);
  const [showImageDesc1, setShowImageDesc1] = useState(null);
  const [showImageDesc2, setShowImageDesc2] = useState(null);
  const [showImageDesc3, setShowImageDesc3] = useState(null);

  useEffect(() => {
    dispatch(getAllCampaignCategory());
  }, [dispatch]);

  if (!modalCreateActive) {
    return null;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setCampaignImage(file);
    const imageUrl = URL.createObjectURL(file);
    setShowImage(imageUrl);
  };

  const handleImageDescUpload = (e, imageNumber) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      switch (imageNumber) {
        case 1:
          setCampaignImageDesc1(file);
          setShowImageDesc1(imageUrl);
          break;
        case 2:
          setCampaignImageDesc2(file);
          setShowImageDesc2(imageUrl);
          break;
        case 3:
          setCampaignImageDesc3(file);
          setShowImageDesc3(imageUrl);
          break;
        default:
          break;
      }
    }
  };

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(
      createCampaign(
        category,
        campaignName,
        campaignCode,
        campaignImage,
        description,
        location,
        parseInt(targetAmount.replace(/\./g, ""), 10),
        startDate,
        endDate,
        true,
        isEmergency,
        campaignImageDesc1,
        campaignImageDesc2,
        campaignImageDesc3
      )
    ).finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setModalCreateActive(false))}
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600">
          Buat Campaign Baru
        </h2>
        <form className="space-y-6" onSubmit={handleCreateCampaign}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Kategori Campaign
            </label>
            <select
              className="bg-gray-50 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border focus:border-primary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>
                Pilih Kategori
              </option>
              {allCampaignCategory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.campaignCategory}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nama Campaign
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter campaign title"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Kode Campaign
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter campaign code"
              value={campaignCode}
              onChange={(e) => setCampaignCode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Lokasi
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Target Donasi
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter target amount"
              value={targetAmount}
              onChange={(e) => {
                let inputValue = e.target.value.replace(/[^\d]/g, "");
                inputValue = inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                setTargetAmount(inputValue);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Deskripsi
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
              placeholder="Enter campaign description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Campaign Darurat
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-green-500"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-600">Darurat</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Gambar Deskripsi 1
            </label>
            <div className="flex w-full items-center justify-center">
              <Label
                htmlFor="dropzone-file-desc1"
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                {showImageDesc1 ? (
                  <img
                    src={showImageDesc1}
                    alt="Description Image 1"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <svg
                      className="mb-4 h-6 w-6 text-gray-500"
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
                    <p className="mb-2 text-xs text-gray-500">
                      <span className="font-semibold">Click to upload</span>{" "}
                      gambar 1
                    </p>
                  </div>
                )}
                <FileInput
                  id="dropzone-file-desc1"
                  className="hidden"
                  onChange={(e) => handleImageDescUpload(e, 1)}
                />
              </Label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Gambar Deskripsi 2
            </label>
            <div className="flex w-full items-center justify-center">
              <Label
                htmlFor="dropzone-file-desc2"
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                {showImageDesc2 ? (
                  <img
                    src={showImageDesc2}
                    alt="Description Image 2"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <svg
                      className="mb-4 h-6 w-6 text-gray-500"
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
                    <p className="mb-2 text-xs text-gray-500">
                      <span className="font-semibold">Click to upload</span>{" "}
                      gambar 2
                    </p>
                  </div>
                )}
                <FileInput
                  id="dropzone-file-desc2"
                  className="hidden"
                  onChange={(e) => handleImageDescUpload(e, 2)}
                />
              </Label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Gambar Deskripsi 3
            </label>
            <div className="flex w-full items-center justify-center">
              <Label
                htmlFor="dropzone-file-desc3"
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                {showImageDesc3 ? (
                  <img
                    src={showImageDesc3}
                    alt="Description Image 3"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <svg
                      className="mb-4 h-6 w-6 text-gray-500"
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
                    <p className="mb-2 text-xs text-gray-500">
                      <span className="font-semibold">Click to upload</span>{" "}
                      gambar 3
                    </p>
                  </div>
                )}
                <FileInput
                  id="dropzone-file-desc3"
                  className="hidden"
                  onChange={(e) => handleImageDescUpload(e, 3)}
                />
              </Label>
            </div>
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
          <div className="space-y-2">
            <button
              type="button"
              className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
              onClick={() => dispatch(setModalCreateActive(false))}
            >
              Cancel
            </button>
            {isLoading ? (
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
                type="submit"
                onClick={handleCreateCampaign}
                className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200"
              >
                Buat Campaign
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCampaign;
