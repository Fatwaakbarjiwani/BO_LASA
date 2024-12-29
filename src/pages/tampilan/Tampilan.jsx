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

  useEffect(() => {
    {
      !loading && dispatch(getPageImage());
    }
  }, [dispatch, loading]);

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
