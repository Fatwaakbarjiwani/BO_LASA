import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import {
  getSearchTransaksi,
  getTransaction,
  API_URL,
} from "../../../redux/actions/transaksiAction";
import {
  getHistoryByAgent,
  getHistoryRecapAdmin,
} from "../../../redux/actions/posAction";
import { getAllAgen } from "../../../redux/actions/agenAction";
import { getAllEvents } from "../../../redux/actions/eventAction";
import PageNumber from "../../../components/PageNumber";
import { setPNTransaksi } from "../../../redux/reducers/pageNumberReducer";
import { setSearchTransaksi } from "../../../redux/reducers/transaction&summaryReducer";

const TAB_DONATUR = "donatur";
const TAB_AGEN = "agen";
const TAB_LOG_AGEN = "log-agen";

const KATEGORI_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "zakat", label: "Zakat" },
  { value: "infak", label: "Infak" },
  { value: "dskl", label: "DSKL" },
  { value: "campaign", label: "Campaign" },
];

const METODE_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "tunai", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris agen", label: "QRIS Agen" },
];

export default function Transaksi() {
  const dispatch = useDispatch();
  const { transaction } = useSelector((state) => state.summary);
  const { searchTransaksi } = useSelector((state) => state.summary);
  const { totalPNTransaksi } = useSelector((state) => state.pn);
  const { pNTransaksi } = useSelector((state) => state.pn);
  const { listAgen } = useSelector((state) => state.agen);
  const { listEvents } = useSelector((state) => state.event);
  const { tokenAdmin } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState(TAB_DONATUR);
  const [historyAgen, setHistoryAgen] = useState({
    content: [],
    totalPages: 0,
    number: 0,
    totalElements: 0,
  });
  const [loadingAgen, setLoadingAgen] = useState(false);
  const [pageAgen, setPageAgen] = useState(1);
  const [filterAgen, setFilterAgen] = useState({
    agentId: "",
    startDate: "",
    endDate: "",
    category: "",
    eventId: "",
    paymentMethod: "",
  });
  const [loadingDownloadRecap, setLoadingDownloadRecap] = useState(false);

  const [agenEditOpen, setAgenEditOpen] = useState(false);
  const [agenEditLoading, setAgenEditLoading] = useState(false);
  const [agenEditSaving, setAgenEditSaving] = useState(false);
  const [agenEditNomorBukti, setAgenEditNomorBukti] = useState("");
  const [agenEditForm, setAgenEditForm] = useState({
    username: "",
    phoneNumber: "",
    email: "",
    address: "",
    transactionAmount: "",
    message: "",
    transactionDate: "",
  });

  const [logAgen, setLogAgen] = useState({
    content: [],
    totalPages: 0,
    number: 0,
    totalElements: 0,
  });
  const [logPage, setLogPage] = useState(1);
  const [logSize, setLogSize] = useState(10);
  const [loadingLog, setLoadingLog] = useState(false);

  useEffect(() => {
    if (searchTransaksi) {
      dispatch(getSearchTransaksi(searchTransaksi, pNTransaksi - 1));
    } else dispatch(getTransaction(pNTransaksi - 1));
  }, [searchTransaksi, dispatch, pNTransaksi]);

  useEffect(() => {
    if (activeTab === TAB_AGEN || activeTab === TAB_LOG_AGEN) {
      dispatch(getAllAgen());
      dispatch(getAllEvents());
    }
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (activeTab !== TAB_AGEN) return;
    setLoadingAgen(true);
    dispatch(
      getHistoryByAgent({
        ...filterAgen,
        agentId: filterAgen.agentId || undefined,
        eventId: filterAgen.eventId || undefined,
        page: pageAgen - 1,
      })
    )
      .then((data) => {
        setHistoryAgen({
          content: data?.content ?? [],
          totalPages: data?.totalPages ?? 0,
          number: data?.number ?? 0,
          totalElements: data?.totalElements ?? 0,
        });
      })
      .catch(() => {
        setHistoryAgen({ content: [], totalPages: 0, number: 0, totalElements: 0 });
      })
      .finally(() => setLoadingAgen(false));
  }, [activeTab, dispatch, pageAgen, filterAgen]);

  useEffect(() => {
    if (activeTab !== TAB_LOG_AGEN) return;
    setLoadingLog(true);
    axios
      .get(`${API_URL}/transaction/edit-logs?page=${logPage - 1}&size=${logSize}`, {
        headers: { Authorization: `Bearer ${tokenAdmin}` },
      })
      .then((res) => {
        const data = res?.data ?? {};
        setLogAgen({
          content: data?.content ?? [],
          totalPages: data?.totalPages ?? 0,
          number: data?.number ?? 0,
          totalElements: data?.totalElements ?? 0,
        });
      })
      .catch(() => {
        setLogAgen({ content: [], totalPages: 0, number: 0, totalElements: 0 });
      })
      .finally(() => setLoadingLog(false));
  }, [activeTab, logPage, logSize, tokenAdmin]);

  const handleFilterAgen = (e) => {
    e?.preventDefault?.();
    setPageAgen(1);
    setLoadingAgen(true);
    dispatch(
      getHistoryByAgent({
        ...filterAgen,
        agentId: filterAgen.agentId || undefined,
        eventId: filterAgen.eventId || undefined,
        page: 0,
      })
    )
      .then((data) => {
        setHistoryAgen({
          content: data?.content ?? [],
          totalPages: data?.totalPages ?? 0,
          number: data?.number ?? 0,
          totalElements: data?.totalElements ?? 0,
        });
        setPageAgen(1);
      })
      .catch(() => {
        setHistoryAgen({ content: [], totalPages: 0, number: 0, totalElements: 0 });
      })
      .finally(() => setLoadingAgen(false));
  };

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatDateTimeId = (val) => {
    if (!val) return "-";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  };

  const toInputDateTimeLocal = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}T${hh}:${mm}`;
  };

  const refreshHistoryAgen = () =>
    dispatch(
      getHistoryByAgent({
        ...filterAgen,
        agentId: filterAgen.agentId || undefined,
        eventId: filterAgen.eventId || undefined,
        page: pageAgen - 1,
      })
    )
      .then((data) => {
        setHistoryAgen({
          content: data?.content ?? [],
          totalPages: data?.totalPages ?? 0,
          number: data?.number ?? 0,
          totalElements: data?.totalElements ?? 0,
        });
      })
      .catch(() => {
        setHistoryAgen({ content: [], totalPages: 0, number: 0, totalElements: 0 });
      });

  const openEditAgenByNomorBukti = async (nomorBukti) => {
    if (!nomorBukti) return;
    setAgenEditNomorBukti(nomorBukti);
    setAgenEditOpen(true);
    setAgenEditLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/transaction/get-by-nomor-bukti?nomorBukti=${encodeURIComponent(
          nomorBukti
        )}`,
        { headers: { Authorization: `Bearer ${tokenAdmin}` } }
      );
      const d = res?.data ?? {};
      setAgenEditForm({
        username: d?.username ?? "",
        phoneNumber: d?.phoneNumber ?? "",
        email: d?.email ?? "",
        address: d?.address ?? "",
        transactionAmount:
          d?.transactionAmount != null ? String(d.transactionAmount) : "",
        message: d?.message ?? "",
        transactionDate: d?.transactionDate ?? "",
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          e?.response?.data?.message ||
          "Gagal mengambil detail transaksi berdasarkan nomor bukti.",
      });
      setAgenEditOpen(false);
    } finally {
      setAgenEditLoading(false);
    }
  };

  const submitEditAgen = async () => {
    if (!agenEditNomorBukti) return;
    setAgenEditSaving(true);
    try {
      const normalizedDate =
        typeof agenEditForm.transactionDate === "string" &&
        agenEditForm.transactionDate.includes("T") &&
        agenEditForm.transactionDate.length === 16
          ? `${agenEditForm.transactionDate}:00`
          : agenEditForm.transactionDate;
      const payload = {
        username: agenEditForm.username,
        phoneNumber: agenEditForm.phoneNumber,
        email: agenEditForm.email,
        address: agenEditForm.address,
        transactionAmount: Number(agenEditForm.transactionAmount || 0),
        transactionDate: normalizedDate,
        message: agenEditForm.message,
      };
      const res = await axios.put(
        `${API_URL}/transaction/edit-by-nomor-bukti?nomorBukti=${encodeURIComponent(
          agenEditNomorBukti
        )}`,
        payload,
        { headers: { Authorization: `Bearer ${tokenAdmin}` } }
      );
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text:
          res?.data?.message ||
          `Transaksi dengan nomor bukti ${agenEditNomorBukti} berhasil diperbarui`,
      });
      setAgenEditOpen(false);
      await refreshHistoryAgen();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          e?.response?.data?.message ||
          "Gagal memperbarui transaksi. Coba lagi nanti.",
      });
    } finally {
      setAgenEditSaving(false);
    }
  };

  const softDeleteAgenByNomorBukti = async (nomorBukti) => {
    if (!nomorBukti) return;
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Hapus transaksi?",
      text: `Nomor bukti: ${nomorBukti}`,
      showCancelButton: true,
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.delete(
        `${API_URL}/transaction/soft-delete?nomorBukti=${encodeURIComponent(nomorBukti)}`,
        { headers: { Authorization: `Bearer ${tokenAdmin}` } }
      );
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Transaksi berhasil dihapus (soft delete).",
      });
      await refreshHistoryAgen();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          e?.response?.data?.message ||
          "Gagal menghapus transaksi. Coba lagi nanti.",
      });
    }
  };

  const CSV_SEP = ";";
  const escapeCsvCell = (val) => {
    if (val == null) return "";
    const s = String(val).trim();
    if (/[";\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const handleDownloadRecap = () => {
    if (!filterAgen.agentId) {
      return;
    }
    setLoadingDownloadRecap(true);
    dispatch(
      getHistoryRecapAdmin({
        agenId: filterAgen.agentId,
        startDate: filterAgen.startDate || undefined,
        endDate: filterAgen.endDate || undefined,
        category: filterAgen.category || undefined,
        eventId: filterAgen.eventId || undefined,
        paymentMethod: filterAgen.paymentMethod || undefined,
      })
    )
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.content ?? [];
        const headers = [
          "No",
          "Tanggal",
          "No Bukti",
          "Nama",
          "No HP",
          "Email",
          "Alamat",
          "Kategori",
          "Sub Kategori",
          "Nominal",
          "Metode Pembayaran",
          "Nama Event",
          "Lokasi Event",
        ];
        const rows = list.map((item, i) => [
          i + 1,
          item?.tanggal ?? "",
          item?.nomorBukti ?? "",
          item?.nama ?? "",
          item?.noHp ?? "",
          item?.email ?? "",
          item?.alamat ?? "",
          item?.kategori ?? "",
          item?.subKategori ?? "",
          item?.nominal ?? "",
          item?.metodePembayaran ?? "",
          item?.namaEvent ?? "",
          item?.lokasiEvent ?? "",
        ]);
        const csvContent = [
          headers.map(escapeCsvCell).join(CSV_SEP),
          ...rows.map((r) => r.map(escapeCsvCell).join(CSV_SEP)),
        ].join("\r\n");
        const blob = new Blob(["\uFEFF" + csvContent], {
          type: "text/csv;charset=utf-8",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `rekap-transaksi-agen-${filterAgen.agentId}-${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => {})
      .finally(() => setLoadingDownloadRecap(false));
  };

  return (
    <>
      <div className={`mb-4 w-full`}>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
          Transaksi
        </h1>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab(TAB_DONATUR)}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              activeTab === TAB_DONATUR
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Transaksi Donatur
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(TAB_AGEN)}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              activeTab === TAB_AGEN
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Transaksi Agen
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(TAB_LOG_AGEN)}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              activeTab === TAB_LOG_AGEN
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Log Transaksi Agen
          </button>
        </div>

        {activeTab === TAB_DONATUR && (
          <div className="w-full rounded-md mt-4">
            <div className="flex justify-between w-full items-end ">
              <h1 className="text-start text-3xl font-bold">Transaksi Donatur</h1>
              <div className="flex w-2/4 flex-wrap justify-end gap-2">
                <input
                  type="text"
                  className="outline-none border border-gray-200 rounded-lg w-1/2 p-2 text-sm bg-gray-200"
                  placeholder="search transaksi donatur"
                  value={searchTransaksi}
                  onChange={(e) => {
                    dispatch(setSearchTransaksi(e.target.value));
                    dispatch(setPNTransaksi(1));
                  }}
                />
                <PageNumber
                  total={totalPNTransaksi}
                  page={pNTransaksi}
                  setPage={setPNTransaksi}
                />
              </div>
            </div>
            <div className="relative overflow-y-auto my-2">
              <table className="w-full text-sm text-left text-gray-500 ">
                <thead className="text-xs text-gray-700 uppercase bg-slate-200  shadow-lg sticky top-0">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 rounded-tl-lg rounded-bl-lg"
                    >
                      No
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Nama
                    </th>
                    <th scope="col" className="px-6 py-3">
                      No Bukti
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Handphone
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Pesan
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Donasi
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Kategori
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Nama Campaign
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Channel
                    </th>
                    <th
                      scope="col"
                      className="text-center px-6 py-3 rounded-tr-lg rounded-br-lg"
                    >
                      Metode
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.map((item, nomor) => (
                    <tr
                      key={item.id}
                      className="odd:bg-white  even:bg-gray-50 border-b  odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                      >
                        {nomor + 1}
                      </th>
                      <td className="px-6 py-4">{item?.username}</td>
                      <td className="px-6 py-4">{item?.nomorBukti}</td>
                      <td className="px-6 py-4">{item?.phoneNumber}</td>
                      <td className="px-6 py-4">{item?.message}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        Rp {formatNumber(item?.transactionAmount || 0)}
                      </td>
                      <td className="px-6 py-4 ">{item?.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">
                        {item?.categoryData?.campaignName}
                      </td>

                      <td className="px-6 py-4">{item?.transactionDate}</td>
                      <td
                        className={`${
                          item?.channel === "ONLINE"
                            ? "text-[#69C53E]"
                            : "text-gray-600"
                        } px-6 py-4`}
                      >
                        {item?.channel}
                      </td>
                      <td
                        className={`${
                          item?.method === "ONLINE"
                            ? "text-blue-600"
                            : "text-orange-600"
                        } `}
                      >
                        {item?.method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === TAB_AGEN && (
          <div className="w-full rounded-md mt-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Transaksi Agen
            </h2>

            <form
              onSubmit={handleFilterAgen}
              className="flex flex-wrap gap-3 items-end p-4 bg-slate-50 rounded-lg border border-gray-100 mb-4"
            >
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Agen
                </label>
                <select
                  value={filterAgen.agentId}
                  onChange={(e) =>
                    setFilterAgen((f) => ({ ...f, agentId: e.target.value }))
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[140px]"
                >
                  <option value="">Pilih Agen</option>
                  {listAgen?.map((a) => (
                    <option key={a?.id} value={a?.id}>
                      {a?.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tanggal Awal
                </label>
                <input
                  type="date"
                  value={filterAgen.startDate}
                  onChange={(e) =>
                    setFilterAgen((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={filterAgen.endDate}
                  onChange={(e) =>
                    setFilterAgen((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Kategori
                </label>
                <select
                  value={filterAgen.category}
                  onChange={(e) =>
                    setFilterAgen((f) => ({ ...f, category: e.target.value }))
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[120px]"
                >
                  {KATEGORI_OPTIONS.map((opt) => (
                    <option key={opt.value || "all"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Event
                </label>
                <select
                  value={filterAgen.eventId}
                  onChange={(e) =>
                    setFilterAgen((f) => ({ ...f, eventId: e.target.value }))
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[160px]"
                >
                  <option value="">Semua Event</option>
                  {listEvents?.map((ev) => (
                    <option key={ev?.id} value={ev?.id}>
                      {ev?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={filterAgen.paymentMethod}
                  onChange={(e) =>
                    setFilterAgen((f) => ({
                      ...f,
                      paymentMethod: e.target.value,
                    }))
                  }
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm min-w-[120px]"
                >
                  {METODE_OPTIONS.map((opt) => (
                    <option key={opt.value || "all"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:opacity-90"
              >
                Filter
              </button>
              <button
                type="button"
                onClick={handleDownloadRecap}
                disabled={!filterAgen.agentId || loadingDownloadRecap}
                className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingDownloadRecap ? "Mengunduh..." : "Download Rekap"}
              </button>
            </form>

            <div className="flex justify-between w-full items-end mb-2">
              <p className="text-sm text-gray-600">
                Total: {historyAgen.totalElements} transaksi
              </p>
              {historyAgen.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPageAgen((p) => Math.max(1, p - 1))}
                    disabled={pageAgen <= 1}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-gray-600">
                    Halaman {pageAgen} dari {historyAgen.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPageAgen((p) =>
                        Math.min(historyAgen.totalPages, p + 1)
                      )
                    }
                    disabled={pageAgen >= historyAgen.totalPages}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="relative overflow-y-auto my-2">
              {loadingAgen ? (
                <div className="py-12 text-center text-gray-500">
                  Memuat data...
                </div>
              ) : (
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-lg rounded-bl-lg">
                        No
                      </th>
                      <th className="px-6 py-3">Tgl / No Bukti</th>
                      <th className="px-6 py-3">Nama</th>
                      <th className="px-6 py-3">No HP</th>
                      <th className="px-6 py-3">Kategori</th>
                      <th className="px-6 py-3">Nominal</th>
                      <th className="px-6 py-3">Metode / Event</th>
                      <th className="px-6 py-3 rounded-tr-lg rounded-br-lg text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyAgen.content?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          Tidak ada data. Pilih agen dan filter lalu klik Filter.
                        </td>
                      </tr>
                    ) : (
                      historyAgen.content?.map((item, index) => (
                        <tr
                          key={item?.id}
                          className="odd:bg-white even:bg-gray-50 border-b odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {(historyAgen.number || 0) * 10 + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col leading-5">
                              <span className="font-medium text-gray-900">
                                {item?.tanggal ?? "-"}
                              </span>
                              <span className="text-gray-600">
                                {item?.nomorBukti ?? "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{item?.nama}</td>
                          <td className="px-6 py-4">{item?.noHp ?? "-"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col leading-5">
                              <span className="font-medium text-gray-900">
                                {item?.kategori ?? "-"}
                              </span>
                              <span className="text-gray-600">
                                {item?.subKategori ?? "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            Rp {formatNumber(item?.nominal ?? 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col leading-5">
                              <span className="font-medium text-gray-900">
                                {item?.metodePembayaran ?? "-"}
                              </span>
                              <span className="text-gray-600">
                                {item?.namaEvent ?? "-"}
                              </span>
                              <span className="text-gray-600">
                                {item?.lokasiEvent ?? "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => openEditAgenByNomorBukti(item?.nomorBukti)}
                                className="px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => softDeleteAgenByNomorBukti(item?.nomorBukti)}
                                className="px-2 py-1 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === TAB_LOG_AGEN && (
          <div className="w-full rounded-md mt-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Log Transaksi Agen
            </h2>

            <div className="flex justify-between items-end gap-3 mb-3">
              <p className="text-sm text-gray-600">
                Total: {logAgen.totalElements} log
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Size</label>
                <select
                  value={logSize}
                  onChange={(e) => {
                    setLogPage(1);
                    setLogSize(Number(e.target.value));
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                {logAgen.totalPages > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                      disabled={logPage <= 1}
                      className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-gray-600">
                      Halaman {logPage} dari {logAgen.totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setLogPage((p) => Math.min(logAgen.totalPages, p + 1))
                      }
                      disabled={logPage >= logAgen.totalPages}
                      className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                    >
                      Next
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="relative overflow-y-auto my-2">
              {loadingLog ? (
                <div className="py-12 text-center text-gray-500">Memuat data...</div>
              ) : (
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
                    <tr>
                      <th className="px-6 py-3 rounded-tl-lg rounded-bl-lg">ID</th>
                      <th className="px-6 py-3">No Bukti</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Edited By</th>
                      <th className="px-6 py-3">Edit Time</th>
                      <th className="px-6 py-3">Old Data</th>
                      <th className="px-6 py-3 rounded-tr-lg rounded-br-lg">
                        New Data
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logAgen.content?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          Tidak ada data log.
                        </td>
                      </tr>
                    ) : (
                      logAgen.content?.map((row) => (
                        <tr
                          key={row?.id}
                          className="odd:bg-white even:bg-gray-50 border-b odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {row?.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {row?.nomorBukti ?? "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {row?.status ?? "-"}
                          </td>
                          <td className="px-6 py-4">{row?.editedBy ?? "-"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDateTimeId(row?.editTime)}
                          </td>
                          <td className="px-6 py-4 max-w-[420px]">
                            <div className="truncate" title={row?.oldData ?? ""}>
                              {row?.oldData ?? "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-[420px]">
                            <div className="truncate" title={row?.newData ?? ""}>
                              {row?.newData ?? "-"}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {agenEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Edit Transaksi Agen</h3>
                <p className="text-xs text-gray-500">
                  Nomor bukti: {agenEditNomorBukti}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAgenEditOpen(false)}
                className="px-3 py-1 rounded hover:bg-gray-100"
                disabled={agenEditSaving}
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4">
              {agenEditLoading ? (
                <div className="py-10 text-center text-gray-500">Memuat detail...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nama
                    </label>
                    <input
                      value={agenEditForm.username}
                      onChange={(e) =>
                        setAgenEditForm((f) => ({ ...f, username: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      No HP
                    </label>
                    <input
                      value={agenEditForm.phoneNumber}
                      onChange={(e) =>
                        setAgenEditForm((f) => ({
                          ...f,
                          phoneNumber: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Email
                    </label>
                    <input
                      value={agenEditForm.email}
                      onChange={(e) =>
                        setAgenEditForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Alamat
                    </label>
                    <input
                      value={agenEditForm.address}
                      onChange={(e) =>
                        setAgenEditForm((f) => ({ ...f, address: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nominal
                    </label>
                    <input
                      type="number"
                      value={agenEditForm.transactionAmount}
                      onChange={(e) =>
                        setAgenEditForm((f) => ({
                          ...f,
                          transactionAmount: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tanggal Transaksi
                    </label>
                    <input
                      type="datetime-local"
                      value={toInputDateTimeLocal(agenEditForm.transactionDate)}
                      onChange={(e) =>
                        setAgenEditForm((f) => ({
                          ...f,
                          transactionDate: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Pesan
                    </label>
                    <textarea
                      rows={3}
                      value={agenEditForm.message}
                      onChange={(e) =>
                        setAgenEditForm((f) => ({ ...f, message: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 border-t bg-slate-50">
              <button
                type="button"
                onClick={() => setAgenEditOpen(false)}
                disabled={agenEditSaving}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={submitEditAgen}
                disabled={agenEditLoading || agenEditSaving}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {agenEditSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
