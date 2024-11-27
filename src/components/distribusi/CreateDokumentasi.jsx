import { useSelector, useDispatch } from "react-redux";
import { FileInput, Label } from "flowbite-react";
import { useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import { setCreateDokumentasi } from "../../redux/reducers/transaction&summaryReducer";
import { createDistribusiDokumentasi } from "../../redux/actions/transaksiAction";

function CreateDokumentasi() {
  const dispatch = useDispatch();
  const { createDokumentasi } = useSelector((state) => state.summary);
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

  if (!createDokumentasi) {
    return null;
  }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setCreateDokumentasi(false))}
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600">
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
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
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
          <div className="space-y-2">
            <button
              type="button"
              className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
              onClick={() => dispatch(setCreateDokumentasi(false))}
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
                Buat Dokumentasi
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDokumentasi;
