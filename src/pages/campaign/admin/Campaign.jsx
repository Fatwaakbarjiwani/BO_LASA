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
} from "../../../redux/reducers/campaignReducer";
import EditCampaign from "../../../components/modalCampaign/EditCampaign";
import PageNumber from "../../../components/PageNumber";
import TableCampaignActiveAprove from "../../../components/campaign/admin/TableCampaignActiveAprove";
import TableCampaignPending from "../../../components/campaign/admin/TableCampaignPending";
import TableCampaignHistory from "../../../components/campaign/admin/TableCampaignHistory";
import TableCategoryCampaign from "../../../components/campaign/admin/TableCategoryCampaign";
import EditCategoryCampaign from "../../../components/modalCampaign/EditCategoryCampaign";
import CreateCategoryCampaign from "../../../components/modalCampaign/CreateCategoryCampaign";

export default function Campaign() {
  const dispatch = useDispatch();
  const { totalPNActiveCampaign } = useSelector((state) => state.pn);
  const { totalPN2 } = useSelector((state) => state.pn);
  const { totalPN3 } = useSelector((state) => state.pn);
  const { pNActiveCampaign } = useSelector((state) => state.pn);
  const { pN2 } = useSelector((state) => state.pn);
  const { pN3 } = useSelector((state) => state.pn);

  return (
    <>
      <CreateCampaign />
      <CreateCategoryCampaign />
      <EditCampaign />
      <EditCategoryCampaign />
      <h1 className="text-3xl font-extrabold text-gray-800">Campaign</h1>
      <div className={`w-full my-4`}>
        <div className="w-full shadow-md p-4 border-gray-100">
          <h1 className="text-start text-3xl font-bold mb-5 flex gap-4 items-center">
            Kategori Campaign{" "}
            <button
              onClick={() => dispatch(setModalCreateCategory(true))}
              className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary px-6 py-1 rounded-full text-white font-semibold"
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
      <div className={`w-full my-5 mt-10`}>
        <div className="w-full shadow-md p-4 border-gray-100">
          <div className="flex justify-between w-full items-center">
            <h1 className="text-start text-3xl font-bold mt-2 flex gap-4 items-center">
              Campaign Aktif Dan Disetujui
              <button
                onClick={() => dispatch(setModalCreateActive(true))}
                className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary bg-primary px-6 py-1 rounded-full text-white font-semibold"
              >
                Buat Campaign
              </button>
            </h1>

            <div className="flex justify-center">
              <PageNumber
                total={totalPNActiveCampaign}
                page={pNActiveCampaign}
                setPage={setPNActiveCampaign}
              />
            </div>
          </div>

          <div className="relative overflow-x-auto max-h-[100vh] overflow-y-auto shadow-md sm:rounded-lg mt-4">
            <TableCampaignActiveAprove />
          </div>
        </div>
        <div className="w-full shadow-md p-4 border-gray-100">
          <div className="flex justify-between w-full items-center">
            <h1 className="text-start text-3xl font-bold">Tertunda</h1>
            <div className="flex justify-center">
              <PageNumber total={totalPN2} page={pN2} setPage={setPN2} />
            </div>
          </div>

          <div className="relative overflow-x-auto max-h-[100vh] overflow-y-auto shadow-md sm:rounded-lg mt-4">
            <TableCampaignPending />
          </div>
        </div>
        <div className="w-full shadow-md p-4 border-gray-100">
          <div className="flex justify-between w-full items-center">
            <h1 className="text-start text-3xl font-bold">Riwayat</h1>
            <div className="flex justify-center">
              <PageNumber total={totalPN3} page={pN3} setPage={setPN3} />
            </div>
          </div>

          <div className="relative overflow-x-auto max-h-[100vh] overflow-y-auto shadow-md sm:rounded-lg mt-4">
            <TableCampaignHistory />
          </div>
        </div>
      </div>
    </>
  );
}
