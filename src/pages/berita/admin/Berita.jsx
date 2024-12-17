import { useDispatch, useSelector } from "react-redux";
import {
  setModalCreateBerita,
  setModalCreateTopicBerita,
  setSearchBerita,
} from "../../../redux/reducers/beritaReducer";
import CreateBerita from "../../../components/modalBerita/CreateBerita";
import EditBerita from "../../../components/modalBerita/EditBerita";
import PageNumber from "../../../components/PageNumber";
import { setPNBerita } from "../../../redux/reducers/pageNumberReducer";
import TableBerita from "../../../components/berita/TableBerita";
import TableTopicBerita from "../../../components/berita/TableTopicBerita";
import CreateTopicBerita from "../../../components/modalBerita/CreateTopikBerita";
import EditTopicBerita from "../../../components/modalBerita/EditBeritaTopikBerita";
import { useState } from "react";

const data = [
  { id: 1, nama: "Berita", value: "berita" },
  { id: 2, nama: "Topik Berita", value: "topik" },
];
export default function Berita() {
  const dispatch = useDispatch();
  const { pNBerita } = useSelector((state) => state.pn);
  const { searchBerita } = useSelector((state) => state.berita);
  const { totalPNBerita } = useSelector((state) => state.pn);
  const [typeButton, setTypeButton] = useState("berita");

  return (
    <>
      <CreateBerita />
      <CreateTopicBerita />
      <EditTopicBerita />
      <EditBerita />
      <div className={`mb-4 w-full`}>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Berita</h1>
        <div className="flex gap-4 items-center my-5">
          {data.map((item) => (
            <button
              key={item.id}
              className={`${
                typeButton == item?.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-blue-100"
              } p-2 rounded-lg shadow text-sm`}
              onClick={() => setTypeButton(item?.value)}
            >
              {item?.nama}
            </button>
          ))}
        </div>
        {typeButton == "topik" && (
          <>
            <div className="flex gap-4 items-center">
              <h1 className="text-start text-3xl font-bold">Topik Berita</h1>
              <button
                onClick={() => dispatch(setModalCreateTopicBerita(true))}
                className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary px-6 py-1 rounded-lg text-white font-semibold"
              >
                Buat Topik Berita
              </button>
            </div>
            <div className="w-full space-y-2 shadow-md rounded-2xl mt-4">
              <TableTopicBerita />
            </div>
          </>
        )}
      </div>
      {typeButton == "berita" && (
        <div className={`w-full`}>
          <h1 className="text-start text-3xl font-bold">Daftar Berita</h1>
          <div className="w-full space-y-2 mt-2">
            <div className="flex justify-between items-end">
              <button
                onClick={() => dispatch(setModalCreateBerita(true))}
                className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary px-6 py-1 rounded-lg text-white font-semibold"
              >
                Buat Berita
              </button>
              <div className="flex w-3/4 flex-wrap items-center justify-end gap-2">
                <input
                  type="text"
                  className="outline-none border border-gray-200 rounded-lg w-1/2 p-2 text-sm bg-gray-200"
                  placeholder="search donatur"
                  value={searchBerita}
                  onChange={(e) => {
                    dispatch(setSearchBerita(e.target.value));
                    dispatch(setPNBerita(1));
                  }}
                />
                <PageNumber
                  total={totalPNBerita}
                  page={pNBerita}
                  setPage={setPNBerita}
                />
              </div>
            </div>
            <TableBerita />
          </div>
        </div>
      )}
    </>
  );
}
