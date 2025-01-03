import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setModalCreateCoa,
  setModalEditCoa,
} from "../../redux/reducers/transaction&summaryReducer";
import CreateCoa from "../../components/modalCoa/CreateCoa";
import {
  deleteCoa,
  getAllCategoryCoa,
  getAllCoa,
} from "../../redux/actions/ziswafAction";
import { OrbitProgress } from "react-loading-indicators";
import EditCoa from "../../components/modalCoa/EditCoa";

export default function Coa() {
  const { allCoaCategory } = useSelector((state) => state.ziswaf);
  const { modalCreateCoa } = useSelector((state) => state.summary);
  const { modalEditCoa } = useSelector((state) => state.summary);
  const [isLoading, setLoading] = useState(false);
  const [idDelete, setIdDelete] = useState("");
  const [id, setId] = useState("");
  const [type, setType] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    {
      {
        !type
          ? dispatch(getAllCoa())
          : (!modalCreateCoa || !modalEditCoa || !isLoading || type) &&
            dispatch(getAllCategoryCoa(type));
      }
      // (!modalCreateCoa || !modalEditCoa || !isLoading || type) &&
      //   dispatch(getAllCategoryCoa(type));
    }
  }, [dispatch, modalCreateCoa, isLoading, modalEditCoa, type]);
  const typedata = [
    {
      id: 1,
      name: "asset",
    },
    {
      id: 2,
      name: "liability",
    },
    {
      id: 3,
      name: "equity",
    },
    {
      id: 4,
      name: "revenue",
    },
    {
      id: 5,
      name: "expense",
    },
  ];

  return (
    <div>
      <CreateCoa />
      <EditCoa id={id} />
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Daftar COA</h1>
        <div className="flex gap-2 items-center w-1/2 justify-end">
          <div className="w-1/2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Pilih Tipe Akun</option>
              {typedata.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              dispatch(setModalCreateCoa(true));
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
          >
            Tambah COA
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left text-nowrap">Kode Akun</th>
              <th className="py-3 px-6 text-left">Nama Akun</th>
              <th className="py-3 px-6 text-left text-nowrap">Tipe Akun</th>
              <th className="py-3 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-light">
            {allCoaCategory.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6">{item.id}</td>
                <td className="py-3 px-6">{item.accountCode}</td>
                <td className="py-3 px-6">{item.accountName}</td>
                <td className="py-3 px-6">{item.accountType}</td>
                <td className="py-3 px-6 text-center flex gap-2">
                  <button
                    onClick={() => {
                      dispatch(setModalEditCoa(true));
                      setId(item?.id);
                    }}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 "
                  >
                    Edit
                  </button>
                  {isLoading && idDelete == item?.id ? (
                    <div className="flex justify-center">
                      <OrbitProgress
                        variant="spokes"
                        color="#69c53e"
                        style={{ fontSize: "8px" }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setLoading(true);
                        setIdDelete(item.id);
                        dispatch(deleteCoa(item?.id)).finally(() =>
                          setLoading(false)
                        );
                      }}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
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
    </div>
  );
}
