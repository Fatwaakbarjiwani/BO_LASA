import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAgen,
  getAllAgen,
  getDetailAgen,
} from "../../redux/actions/agenAction";
import {
  deleteEvent,
  getAllEvents,
  getDetailEvent,
} from "../../redux/actions/eventAction";
import {
  setModalCreateAgen,
  setModalEditAgen,
} from "../../redux/reducers/agenReducer";
import {
  setModalCreateEvent,
  setModalEditEvent,
} from "../../redux/reducers/eventReducer";
import CreateAgen from "../../components/modalAgen/CreateAgen";
import EditAgen from "../../components/modalAgen/EditAgen";
import CreateEvent from "../../components/modalEvent/CreateEvent";
import EditEvent from "../../components/modalEvent/EditEvent";
import { OrbitProgress } from "react-loading-indicators";

const tabData = [
  { id: "agen", label: "Agen POS" },
  { id: "event", label: "Event" },
];

export default function Agen() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("agen");
  const { listAgen, modalCreateAgen, modalEditAgen } = useSelector(
    (state) => state.agen
  );
  const { listEvents, modalCreateEvent, modalEditEvent } = useSelector(
    (state) => state.event
  );
  const [isLoading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [deleteEventId, setDeleteEventId] = useState("");

  useEffect(() => {
    dispatch(getAllAgen());
    dispatch(getAllEvents());
  }, [dispatch]);

  useEffect(() => {
    if (
      modalCreateAgen === false ||
      modalEditAgen === false ||
      isLoading === false
    ) {
      dispatch(getAllAgen());
    }
  }, [dispatch, modalCreateAgen, modalEditAgen, isLoading]);

  useEffect(() => {
    if (
      modalCreateEvent === false ||
      modalEditEvent === false ||
      isLoading === false
    ) {
      dispatch(getAllEvents());
    }
  }, [dispatch, modalCreateEvent, modalEditEvent, isLoading]);

  return (
    <div className="mb-4 w-full">
      <CreateAgen />
      <EditAgen />
      <CreateEvent />
      <EditEvent />
      <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Agen POS</h1>
      <div className="flex gap-4 items-center mb-5">
        {tabData.map((tab) => (
          <button
            key={tab.id}
            className={`${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            } px-6 py-2 rounded-lg font-semibold shadow transition`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Agen POS */}
      {activeTab === "agen" && (
        <div className="w-full shadow-md rounded-lg border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => dispatch(setModalCreateAgen(true))}
              className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary px-6 py-2 rounded-lg text-white font-semibold"
            >
              Tambah Agen
            </button>
          </div>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg rounded-bl-lg">No</th>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Nomor Telepon</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Alamat</th>
                  <th className="px-6 py-3">Target Amount</th>
                  <th className="px-6 py-3">Tanggal Dibuat</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {listAgen?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Belum ada data agen
                    </td>
                  </tr>
                ) : (
                  listAgen?.map((item, index) => (
                    <tr
                      key={item?.id}
                      className="bg-white border-b hover:bg-slate-500 hover:text-white"
                    >
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium">{item?.username}</td>
                      <td className="px-6 py-4">{item?.phoneNumber}</td>
                      <td className="px-6 py-4">{item?.email}</td>
                      <td className="px-6 py-4">{item?.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        Rp {(item?.targetAmount ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                      </td>
                      <td className="px-6 py-4">{item?.createdAt}</td>
                      <td className="flex px-6 py-4 justify-center gap-2">
                        <button
                          onClick={() => {
                            dispatch(setModalEditAgen(true));
                            dispatch(getDetailAgen(item?.id));
                          }}
                          className="px-4 py-1 rounded-full bg-blue-500 text-white font-semibold shadow-md active:scale-105 duration-200"
                        >
                          Edit
                        </button>
                        {isLoading && deleteId === item?.id ? (
                          <div className="flex justify-center">
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
                              setDeleteId(item?.id);
                              dispatch(deleteAgen(item?.id)).finally(() => {
                                setLoading(false);
                                setDeleteId("");
                              });
                            }}
                            className="px-4 py-1 rounded-full bg-red-500 text-white font-semibold shadow-md active:scale-105 duration-200"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Event */}
      {activeTab === "event" && (
        <div className="w-full shadow-md rounded-lg border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => dispatch(setModalCreateEvent(true))}
              className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary px-6 py-2 rounded-lg text-white font-semibold"
            >
              Tambah Event
            </button>
          </div>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg rounded-bl-lg">No</th>
                  <th className="px-6 py-3">Nama Event</th>
                  <th className="px-6 py-3">Lokasi</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {listEvents?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Belum ada data event
                    </td>
                  </tr>
                ) : (
                  listEvents?.map((item, index) => (
                    <tr
                      key={item?.id}
                      className="bg-white border-b hover:bg-slate-500 hover:text-white"
                    >
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium">{item?.name}</td>
                      <td className="px-6 py-4">{item?.location}</td>
                      <td className="flex px-6 py-4 justify-center gap-2">
                        <button
                          onClick={() => {
                            dispatch(setModalEditEvent(true));
                            dispatch(getDetailEvent(item?.id));
                          }}
                          className="px-4 py-1 rounded-full bg-blue-500 text-white font-semibold shadow-md active:scale-105 duration-200"
                        >
                          Edit
                        </button>
                        {isLoading && deleteEventId === item?.id ? (
                          <div className="flex justify-center">
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
                              setDeleteEventId(item?.id);
                              dispatch(deleteEvent(item?.id)).finally(() => {
                                setLoading(false);
                                setDeleteEventId("");
                              });
                            }}
                            className="px-4 py-1 rounded-full bg-red-500 text-white font-semibold shadow-md active:scale-105 duration-200"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
