import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import { setModalEditTopicBerita } from "../../redux/reducers/beritaReducer";
import { editTopicBerita } from "../../redux/actions/beritaAction";

function EditTopicBerita() {
  const dispatch = useDispatch();
  const { modalEditTopicBerita } = useSelector((state) => state.berita);
  const { idTopic } = useSelector((state) => state.berita);
  const { categoryBerita } = useSelector((state) => state.berita);
  const [isLoading, setLoading] = useState(false);
  // State for form inputs
  const [topicName, setTopicName] = useState("");
  useEffect(() => {
    const adjustedCategoryIndex = parseInt(idTopic) - 1;
    setTopicName(
      categoryBerita[adjustedCategoryIndex]?.newsTopic || ""
    );
  }, [dispatch, idTopic]);

  if (!modalEditTopicBerita) {
    return null;
  }
  const handleEditCampaign = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(
      editTopicBerita(topicName, idTopic)
    ).finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setModalEditTopicBerita(false))}
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600">
          Edit Kategori Campaign Baru
        </h2>
        <form className="space-y-6" onSubmit={handleEditCampaign}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nama Topik Berita
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter new topic name"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <button
              type="button"
              className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
              onClick={() => dispatch(setModalEditTopicBerita(false))}
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
                onClick={handleEditCampaign}
                className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200"
              >
                Edit topik berita
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTopicBerita;
