import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setIdTopic,
  setModalEditTopicBerita,
} from "../../redux/reducers/beritaReducer";
import { getCategoryBerita } from "../../redux/actions/beritaAction";
import { deleteNewsTopic } from "../../redux/actions/campaignAction";
import { OrbitProgress } from "react-loading-indicators";

export default function TableTopicBerita() {
  const dispatch = useDispatch();
  const [id, setId] = useState("");
  const [isLoading, setLoading] = useState("");
  const { modalEditTopicBerita } = useSelector((state) => state.berita);
  const { modalCreateTopicBerita } = useSelector((state) => state.berita);
  const { categoryBerita } = useSelector((state) => state.berita);

  useEffect(() => {
    if (
      modalCreateTopicBerita == false ||
      modalEditTopicBerita == false ||
      !isLoading
    ) {
      dispatch(getCategoryBerita());
    }
  }, [dispatch, modalCreateTopicBerita, modalEditTopicBerita, isLoading]);

  return (
    <div className="w-full">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th scope="col" className="px-4 py-3 w-1/6">
              No
            </th>
            <th scope="col" className="px-4 py-3 w-4/6">
              Topik Berita
            </th>
            <th scope="col" className="px-4 py-3 w-1/6">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {categoryBerita.map((item, num) => (
            <tr key={item.id} className="bg-white border-b hover:bg-gray-100">
              <td className="px-4 py-2">{num + 1}</td>
              <td className="px-4 py-2">{item?.newsTopic}</td>
              <td className="px-4 py-2 flex justify-center items-center gap-2">
                <button
                  onClick={() => {
                    dispatch(setIdTopic(item?.id));
                    dispatch(setModalEditTopicBerita(true));
                  }}
                  className="w-1/2 p-1 rounded-full bg-blue-500 text-white font-semibold"
                >
                  Edit
                </button>
                {isLoading && id == item?.id ? (
                  <div className="flex justify-center w-1/2">
                    <OrbitProgress
                      variant="dotted"
                      color="#69c53e"
                      text=""
                      style={{ fontSize: "6px" }}
                      textColor=""
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setLoading(true);
                      setId(item?.id);
                      dispatch(deleteNewsTopic(item?.id)).finally(() =>
                        setLoading(false)
                      );
                    }}
                    className="w-1/2 p-1 rounded-full shadow-md bg-red-500 text-white font-semibold"
                  >
                    Hapus
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
