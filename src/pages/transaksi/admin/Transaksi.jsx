import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSearchTransaksi,
  getTransaction,
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
  { value: "qris", label: "QRIS" },
];

export default function Transaksi() {
  const dispatch = useDispatch();
  const { transaction } = useSelector((state) => state.summary);
  const { searchTransaksi } = useSelector((state) => state.summary);
  const { totalPNTransaksi } = useSelector((state) => state.pn);
  const { pNTransaksi } = useSelector((state) => state.pn);
  const { listAgen } = useSelector((state) => state.agen);
  const { listEvents } = useSelector((state) => state.event);

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

  useEffect(() => {
    if (searchTransaksi) {
      dispatch(getSearchTransaksi(searchTransaksi, pNTransaksi - 1));
    } else dispatch(getTransaction(pNTransaksi - 1));
  }, [searchTransaksi, dispatch, pNTransaksi]);

  useEffect(() => {
    if (activeTab === TAB_AGEN) {
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
                      <th className="px-6 py-3">Tanggal</th>
                      <th className="px-6 py-3">No Bukti</th>
                      <th className="px-6 py-3">Nama</th>
                      <th className="px-6 py-3">No HP</th>
                      <th className="px-6 py-3">Kategori</th>
                      <th className="px-6 py-3">Sub Kategori</th>
                      <th className="px-6 py-3">Nominal</th>
                      <th className="px-6 py-3">Metode</th>
                      <th className="px-6 py-3">Event</th>
                      <th className="px-6 py-3 rounded-tr-lg rounded-br-lg">
                        Lokasi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyAgen.content?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={11}
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
                            {item?.tanggal}
                          </td>
                          <td className="px-6 py-4">{item?.nomorBukti}</td>
                          <td className="px-6 py-4">{item?.nama}</td>
                          <td className="px-6 py-4">{item?.noHp ?? "-"}</td>
                          <td className="px-6 py-4">{item?.kategori}</td>
                          <td className="px-6 py-4 max-w-[200px] truncate">
                            {item?.subKategori ?? "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            Rp {formatNumber(item?.nominal ?? 0)}
                          </td>
                          <td className="px-6 py-4">
                            {item?.metodePembayaran ?? "-"}
                          </td>
                          <td className="px-6 py-4">{item?.namaEvent ?? "-"}</td>
                          <td className="px-6 py-4">
                            {item?.lokasiEvent ?? "-"}
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
    </>
  );
}
