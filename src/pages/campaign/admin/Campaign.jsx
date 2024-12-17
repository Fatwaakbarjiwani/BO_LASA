import { useDispatch, useSelector } from "react-redux";
import {
  setPN2,
  setPN3,
  setPNActiveCampaign,
} from "../../../redux/reducers/pageNumberReducer";
import CreateCampaign from "../../../components/modalCampaign/CreateCampaign";
import {
  setModalCreateActive,
  setModalCreateCategory,
  setSearchCampaign,
  setSearchCampaignHistory,
  setSearchCampaignPending,
} from "../../../redux/reducers/campaignReducer";
import EditCampaign from "../../../components/modalCampaign/EditCampaign";
import PageNumber from "../../../components/PageNumber";
import TableCampaignActiveAprove from "../../../components/campaign/admin/TableCampaignActiveAprove";
import TableCampaignPending from "../../../components/campaign/admin/TableCampaignPending";
import TableCampaignHistory from "../../../components/campaign/admin/TableCampaignHistory";
import TableCategoryCampaign from "../../../components/campaign/admin/TableCategoryCampaign";
import EditCategoryCampaign from "../../../components/modalCampaign/EditCategoryCampaign";
import CreateCategoryCampaign from "../../../components/modalCampaign/CreateCategoryCampaign";
import { useState } from "react";

const data = [
  { id: 1, nama: "Kategori Campaign", value: "kategori" },
  { id: 2, nama: "Campaign Aktif Dan Disetujui", value: "aktive" },
  { id: 3, nama: "Tertunda", value: "tertunda" },
  { id: 4, nama: "Riwayat", value: "riwayat" },
];

export default function Campaign() {
  const dispatch = useDispatch();
  const { searchCampaign } = useSelector((state) => state.campaign);
  const { searchCampaignHistory } = useSelector((state) => state.campaign);
  const { searchCampaignPending } = useSelector((state) => state.campaign);
  const { totalPNActiveCampaign } = useSelector((state) => state.pn);
  const { totalPN2 } = useSelector((state) => state.pn);
  const { totalPN3 } = useSelector((state) => state.pn);
  const { pNActiveCampaign } = useSelector((state) => state.pn);
  const { pN2 } = useSelector((state) => state.pn);
  const { pN3 } = useSelector((state) => state.pn);
  const [typeButton, setTypeButton] = useState("kategori");

  return (
    <>
      <CreateCampaign />
      <CreateCategoryCampaign />
      <EditCampaign />
      <EditCategoryCampaign />
      <h1 className="text-3xl font-extrabold text-gray-800">Campaign</h1>
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
      {typeButton == "kategori" && (
        <div className={`w-full my-4`}>
          <div className="w-full">
            <h1 className="text-start text-3xl font-bold mb-5 flex gap-4 items-center">
              Kategori Campaign
              <button
                onClick={() => dispatch(setModalCreateCategory(true))}
                className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary px-6 py-1 rounded-lg text-white font-semibold"
              >
                Buat Kategori Campaign
              </button>
            </h1>
            <div className="flex justify-between w-full items-center">
              <div className="flex justify-center w-full">
                <TableCategoryCampaign />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`w-full my-5`}>
        {typeButton == "aktive" && (
          <div className="w-full">
            <h1 className="text-start text-3xl font-bold mt-2">
              Aktif Dan Disetujui
            </h1>
            <div className="flex justify-between w-full items-end mt-4">
              <button
                onClick={() => dispatch(setModalCreateActive(true))}
                className="text-lg shadow-md active:scale-105 duration-200 flex items-center justify-center bg-primary bg-primary px-6 py-1 rounded-lg text-white font-semibold"
              >
                Buat Campaign
              </button>
              <div className="w-1/2 flex flex-wrap gap-4 items-center justify-end">
                <input
                  type="text"
                  className="outline-none border border-gray-200 rounded-lg w-4/6 p-2 text-sm bg-gray-200"
                  placeholder="search campaign"
                  value={searchCampaign}
                  onChange={(e) => {
                    dispatch(setSearchCampaign(e.target.value));
                    dispatch(setPNActiveCampaign(1));
                  }}
                />
                <PageNumber
                  total={totalPNActiveCampaign}
                  page={pNActiveCampaign}
                  setPage={setPNActiveCampaign}
                />
              </div>
            </div>

            <div className="relative overflow-y-auto shadow-md sm:rounded-lg mt-2">
              <TableCampaignActiveAprove />
            </div>
          </div>
        )}
        {typeButton == "tertunda" && (
          <div className="w-full">
            <div className="flex justify-between items-center">
              <h1 className="text-start text-3xl font-bold">Tertunda</h1>
              <div className="flex items-center w-full justify-end gap-2">
                <input
                  type="text"
                  className="outline-none border border-gray-200 drop-shadow rounded-lg w-1/3 p-2 text-sm bg-gray-100"
                  placeholder="search campaign"
                  value={searchCampaignPending}
                  onChange={(e) => {
                    dispatch(setSearchCampaignPending(e.target.value));
                    dispatch(setPN3(1));
                  }}
                />
                <PageNumber total={totalPN2} page={pN2} setPage={setPN2} />
              </div>
            </div>

            <div className="relative overflow-y-auto shadow-md sm:rounded-lg mt-2">
              <TableCampaignPending />
            </div>
          </div>
        )}
        {typeButton == "riwayat" && (
          <div className="w-full">
            <div className="flex justify-between w-full items-center">
              <h1 className="text-start text-3xl font-bold">Riwayat</h1>
              <div className="flex items-center gap-2 w-full justify-end">
                <input
                  type="text"
                  className="outline-none border border-gray-200 drop-shadow rounded-lg w-1/3 p-2 text-sm bg-gray-100"
                  placeholder="search campaign"
                  value={searchCampaignHistory}
                  onChange={(e) => {
                    dispatch(setSearchCampaignHistory(e.target.value));
                    dispatch(setPN3(1));
                  }}
                />
                <PageNumber total={totalPN3} page={pN3} setPage={setPN3} />
              </div>
            </div>

            <div className="relative overflow-x-auto max-h-[100vh] overflow-y-auto shadow-md sm:rounded-lg mt-2">
              <TableCampaignHistory />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
