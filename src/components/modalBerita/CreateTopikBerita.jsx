import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import { setModalCreateTopicBerita } from "../../redux/reducers/beritaReducer";
import { createTopicBerita } from "../../redux/actions/beritaAction";

function CreateTopicBerita() {
  const dispatch = useDispatch();
  const { modalCreateTopicBerita } = useSelector((state) => state.berita);
  const [isLoading, setLoading] = useState(false);
  // State for form inputs
  const [topicName, setTopicName] = useState("");

  useEffect(() => {
    if (modalCreateTopicBerita == false) {
      setTopicName("");
    }
  }, [modalCreateTopicBerita]);

  if (!modalCreateTopicBerita) {
    return null;
  }
  const handleCreateBerita = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(createTopicBerita(topicName)).finally(() =>
      setLoading(false)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setModalCreateTopicBerita(false))}
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600">
          Buat Topik Berita Baru
        </h2>
        <form className="space-y-6" onSubmit={handleCreateBerita}>
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
              onClick={() => dispatch(setModalCreateTopicBerita(false))}
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
                onClick={handleCreateBerita}
                className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200"
              >
                Buat kategori berita
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTopicBerita;
