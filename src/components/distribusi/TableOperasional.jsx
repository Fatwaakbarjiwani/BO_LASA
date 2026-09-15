import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPercentage,
  getPercentageByCampaignId,
  editPercentageByCampaignId,
  addPercentageForCampaign,
} from "../../redux/actions/transaksiAction";
import { getAllCampaign } from "../../redux/actions/campaignAction";
import { OrbitProgress } from "react-loading-indicators";

export default function TableOperasional() {
  const dispatch = useDispatch();
  const { persentase } = useSelector((state) => state.summary);
  const { allCampaign } = useSelector((state) => state.campaign);

  const [mode, setMode] = useState("list");
  const [campaignId, setCampaignId] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [nominal, setNominal] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [isEditExisting, setIsEditExisting] = useState(false);

  const percentageList = Array.isArray(persentase) ? persentase : [];
  const getCampaignKey = (c) => c?.campaignId ?? c?.id;

  const refreshList = () => {
    setLoadingList(true);
    return dispatch(getAllPercentage()).finally(() => setLoadingList(false));
  };

  useEffect(() => {
    dispatch(getAllCampaign());
    setLoadingList(true);
    dispatch(getAllPercentage()).finally(() => setLoadingList(false));
  }, [dispatch]);

  const openEdit = async (item) => {
    if (!item?.campaignId) return;
    setMode("form");
    setIsEditExisting(true);
    setCampaignId(String(item.campaignId));
    setCampaignName(item.campaignName || "");
    setNominal(item.percentage != null ? String(item.percentage) : "");
    setLoading(true);
    try {
      const detail = await dispatch(
        getPercentageByCampaignId(item.campaignId)
      );
      if (detail) {
        setCampaignName(detail.campaignName || item.campaignName || "");
        setNominal(
          detail.percentage != null ? String(detail.percentage) : ""
        );
      }
    } catch {
      // keep list values if detail fetch fails
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setMode("form");
    setIsEditExisting(false);
    setCampaignId("");
    setCampaignName("");
    setNominal("");
  };

  const closeForm = () => {
    setMode("list");
    setIsEditExisting(false);
    setCampaignId("");
    setCampaignName("");
    setNominal("");
  };

  const existingCampaignIds = new Set(
    percentageList.map((p) => String(p?.campaignId))
  );
  const campaignsForAdd = (allCampaign || []).filter(
    (c) => !existingCampaignIds.has(String(getCampaignKey(c)))
  );
  const campaignOptions =
    campaignsForAdd.length > 0 ? campaignsForAdd : allCampaign || [];

  const handleSubmit = () => {
    const resolvedId = Number(campaignId);
    if (!campaignId || Number.isNaN(resolvedId) || nominal === "") {
      return;
    }
    setLoading(true);
    const action = isEditExisting
      ? editPercentageByCampaignId(resolvedId, nominal)
      : addPercentageForCampaign(resolvedId, nominal);

    dispatch(action)
      .then(() => {
        closeForm();
        refreshList();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-lg border border-gray-100 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-800">
            Persentase Biaya Admin
          </h1>
          {mode === "list" ? (
            <button
              type="button"
              onClick={openAdd}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600"
            >
              Tambah Persentase
            </button>
          ) : (
            <button
              type="button"
              onClick={closeForm}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300"
            >
              Kembali
            </button>
          )}
        </div>

        {mode === "list" ? (
          loadingList ? (
            <div className="flex justify-center py-10">
              <OrbitProgress
                variant="dotted"
                color="#4CAF50"
                style={{ fontSize: "12px" }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs uppercase bg-slate-200 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Campaign</th>
                    <th className="px-4 py-3">Persentase</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {percentageList.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Belum ada data persentase campaign.
                      </td>
                    </tr>
                  ) : (
                    percentageList.map((item, index) => (
                      <tr
                        key={item?.id || item?.campaignId}
                        className="border-b odd:bg-white even:bg-gray-50"
                      >
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">
                          {item?.campaignName || "-"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          {item?.percentage ?? 0}%
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                          >
                            Ubah
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )
        ) : loading ? (
          <div className="flex justify-center py-10">
            <OrbitProgress
              variant="dotted"
              color="#4CAF50"
              style={{ fontSize: "12px" }}
            />
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm space-y-4 max-w-md mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign
              </label>
              {isEditExisting ? (
                <input
                  type="text"
                  value={campaignName}
                  readOnly
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-200"
                />
              ) : (
                <select
                  value={campaignId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setCampaignId(id);
                    const found = campaignOptions.find(
                      (c) => String(getCampaignKey(c)) === String(id)
                    );
                    setCampaignName(found?.campaignName || "");
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Pilih Campaign</option>
                  {campaignOptions.map((item) => {
                    const key = getCampaignKey(item);
                    return (
                      <option key={key} value={key}>
                        {item?.campaignName}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Persentase
              </label>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Masukkan persentase"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
            >
              {isEditExisting ? "Simpan Perubahan" : "Tambah"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
