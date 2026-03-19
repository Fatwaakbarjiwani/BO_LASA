import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../redux/actions/ziswafAction";

export default function LogCoa() {
  const navigate = useNavigate();
  const { tokenAdmin } = useSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    number: 0,
    totalElements: 0,
  });
  const [restoringId, setRestoringId] = useState(null);

  const load = () => {
    setLoading(true);
    return axios
      .get(`${API_URL}/coa/get-deleted?page=${page - 1}`, {
        headers: { Authorization: `Bearer ${tokenAdmin}` },
      })
      .then((res) => {
        const d = res?.data ?? {};
        setData({
          content: d?.content ?? [],
          totalPages: d?.totalPages ?? 0,
          number: d?.number ?? 0,
          totalElements: d?.totalElements ?? 0,
        });
      })
      .catch(() => {
        setData({ content: [], totalPages: 0, number: 0, totalElements: 0 });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const restore = async (id) => {
    if (!id) return;
    const confirm = await Swal.fire({
      icon: "question",
      title: "Restore COA?",
      text: `ID: ${id}`,
      showCancelButton: true,
      confirmButtonText: "Ya, restore",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    setRestoringId(id);
    try {
      const res = await axios.put(`${API_URL}/coa/restore/${id}`, null, {
        headers: { Authorization: `Bearer ${tokenAdmin}` },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: res?.data?.message || "COA berhasil dikembalikan",
      });
      await load();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          e?.response?.data?.message || "Gagal restore COA. Coba lagi nanti.",
      });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Log COA (Deleted)</h1>
          <p className="text-sm text-gray-600">Total: {data.totalElements}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Kembali
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left text-nowrap">Kode Akun</th>
              <th className="py-3 px-6 text-left">Nama Akun</th>
              <th className="py-3 px-6 text-left text-nowrap">Tipe Akun</th>
              <th className="py-3 px-6 text-left">Parent</th>
              <th className="py-3 px-6 text-left text-nowrap">Deleted At</th>
              <th className="py-3 px-6 text-center text-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm font-light">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 px-6 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : data.content?.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 px-6 text-center text-gray-500">
                  Tidak ada COA yang terhapus.
                </td>
              </tr>
            ) : (
              data.content.map((item) => (
                <tr
                  key={item?.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6">{item?.id}</td>
                  <td className="py-3 px-6">{item?.accountCode}</td>
                  <td className="py-3 px-6">{item?.accountName}</td>
                  <td className="py-3 px-6">{item?.accountType}</td>
                  <td className="py-3 px-6">
                    {item?.parentAccount?.accountName
                      ? `${item.parentAccount.accountCode} - ${item.parentAccount.accountName}`
                      : "-"}
                  </td>
                  <td className="py-3 px-6">{item?.deletedAt ?? "-"}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      type="button"
                      onClick={() => restore(item?.id)}
                      disabled={restoringId === item?.id}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {restoringId === item?.id ? "Restoring..." : "Restore"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Halaman {page} dari {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

