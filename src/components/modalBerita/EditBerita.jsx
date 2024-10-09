import { useSelector, useDispatch } from "react-redux";
import { FileInput, Label } from "flowbite-react";
import { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import { editNews, getCategoryBerita } from "../../redux/actions/beritaAction";
import { setModalEditBerita } from "../../redux/reducers/beritaReducer";

function EditBerita() {
  const dispatch = useDispatch();
  const { modalEditBerita } = useSelector((state) => state.berita);
  const { categoryBerita } = useSelector((state) => state.berita);
  const { detailBerita } = useSelector((state) => state.berita);
  const [beritaImage, setBeritaImage] = useState(null);
  const [showImage, setShowImage] = useState(null);
  const [isLoading, setLoading] = useState(false);

  // State for form inputs
  const [category, setCategory] = useState("");
  const [beritaName, setBeritaName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    dispatch(getCategoryBerita());
    if (detailBerita) {
      setBeritaName(detailBerita?.title || "");
      setDescription(detailBerita?.content || "");
      setShowImage(detailBerita?.newsImage || null);
      setDate(detailBerita?.date || "");
    }
  }, [dispatch, detailBerita]);

  if (!modalEditBerita) {
    return null;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setBeritaImage(file);
    const imageUrl = URL.createObjectURL(file);
    setShowImage(imageUrl);
  };

  const handleEditBerita = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(
      editNews(
        beritaName,
        beritaImage,
        description,
        category,
        date,
        detailBerita?.id
      )
    ).finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setModalEditBerita(false))}
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600">
          Edit Berita
        </h2>
        <form className="space-y-6" onSubmit={handleEditBerita}>
          <div>
            <label className="flex gap-2 text-sm font-medium text-gray-600 mb-1 items-center">
              Kategori Berita :{" "}
              <span className="text-primary font-semibold text-base">
                {detailBerita?.newsTopic}
              </span>
            </label>
            <select
              className="bg-gray-50 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border focus:border-primary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>
                Pilih Kategori
              </option>
              {categoryBerita.map((item) => (
                <option key={item.id} value={item.id}>
                  {item?.newsTopic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Judul Berita
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter berita title"
              value={beritaName}
              onChange={(e) => setBeritaName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Deskripsi
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
              placeholder="Enter berita description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tanggal
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
                  alt="Berita Image"
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
              onClick={() => dispatch(setModalEditBerita(false))}
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
                onClick={handleEditBerita}
                className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200"
              >
                Buat Berita
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBerita;
