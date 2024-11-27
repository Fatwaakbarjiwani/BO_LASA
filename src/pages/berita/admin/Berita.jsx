import { useDispatch, useSelector } from "react-redux";
import {
  setModalCreateBerita,
  setModalCreateTopicBerita,
} from "../../../redux/reducers/beritaReducer";
import CreateBerita from "../../../components/modalBerita/CreateBerita";
import EditBerita from "../../../components/modalBerita/EditBerita";
import PageNumber from "../../../components/PageNumber";
import { setPNBerita } from "../../../redux/reducers/pageNumberReducer";
import TableBerita from "../../../components/berita/TableBerita";
import TableTopicBerita from "../../../components/berita/TableTopicBerita";
import CreateTopicBerita from "../../../components/modalBerita/CreateTopikBerita";
import EditTopicBerita from "../../../components/modalBerita/EditBeritaTopikBerita";

export default function Berita() {
  const dispatch = useDispatch();
  const { pNBerita } = useSelector((state) => state.pn);
  const { totalPNBerita } = useSelector((state) => state.pn);

  return (
    <>
      <CreateBerita />
      <CreateTopicBerita />
      <EditTopicBerita />
      <EditBerita />
      <div className={`mb-4 w-full`}>
      <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Berita</h1>
        <div className="flex gap-4 items-center">
          <h1 className="text-start text-3xl font-bold">Topik Berita</h1>
          <button
            onClick={() => dispatch(setModalCreateTopicBerita(true))}
            className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary px-6 py-1 rounded-full text-white font-semibold"
          >
            Buat Topik Berita
          </button>
        </div>
        <div className="w-full space-y-2 shadow-md rounded-2xl mt-5 border border-gray-100 p-4">
          <TableTopicBerita />
        </div>
      </div>
      <div className={`mt-6 w-full`}>
        <div className="flex gap-4 items-center">
          <h1 className="text-start text-3xl font-bold">Berita</h1>
          <button
            onClick={() => dispatch(setModalCreateBerita(true))}
            className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary px-6 py-1 rounded-full text-white font-semibold"
          >
            Buat Berita
          </button>
        </div>
        <div className="w-full space-y-2 shadow-md rounded-2xl mt-4 border border-gray-100 p-4">
          <PageNumber
            total={totalPNBerita}
            page={pNBerita}
            setPage={setPNBerita}
          />
          <TableBerita />
        </div>
      </div>
    </>
  );
}
