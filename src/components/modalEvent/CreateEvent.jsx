import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import { createEvent } from "../../redux/actions/eventAction";
import { setModalCreateEvent } from "../../redux/reducers/eventReducer";

export default function CreateEvent() {
  const dispatch = useDispatch();
  const { modalCreateEvent } = useSelector((state) => state.event);
  const [isLoading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  if (!modalCreateEvent) {
    return null;
  }

  const handleCreateEvent = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(createEvent({ name, location })).finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setModalCreateEvent(false))}
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600">
          Buat Event Baru
        </h2>
        <form className="space-y-4" onSubmit={handleCreateEvent}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nama Event
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan nama event"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Lokasi
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan lokasi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 pt-2">
            <button
              type="button"
              className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
              onClick={() => dispatch(setModalCreateEvent(false))}
            >
              Batal
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
                className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200"
              >
                Buat Event
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
