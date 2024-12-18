import { useDispatch, useSelector } from "react-redux";
import {
  setPN1,
  setPN2,
  setPN3,
} from "../../../redux/reducers/pageNumberReducer";
import CreateCampaign from "../../../components/modalCampaign/CreateCampaign";
import { setModalCreateActive } from "../../../redux/reducers/campaignReducer";
import EditCampaign from "../../../components/modalCampaign/EditCampaign";
import PageNumber from "../../../components/PageNumber";
import TableCampaignOperator from "../../../components/campaign/operator/TableCampaignOperator";
import TableCampaignPending from "../../../components/campaign/operator/TableCampaignPending";
import TableCampaignHistory from "../../../components/campaign/operator/TableCampaignHistory";
import { useState } from "react";
const data = [
  { id: 1, nama: "Daftar Campaign", value: "daftar" },
  { id: 2, nama: "Riwayat", value: "riwayat" },
];
export default function Campaign2() {
  const dispatch = useDispatch();
  const { totalPN1 } = useSelector((state) => state.pn);
  const { totalPN2 } = useSelector((state) => state.pn);
  const { totalPN3 } = useSelector((state) => state.pn);
  const { pN1 } = useSelector((state) => state.pn);
  const { pN2 } = useSelector((state) => state.pn);
  const { pN3 } = useSelector((state) => state.pn);
  const [typeButton, setTypeButton] = useState("daftar");

  return (
    <>
      <CreateCampaign />
      <EditCampaign />
      <div className={`w-full my-5`}>
        <h1 className="text-3xl font-extrabold text-gray-800 flex gap-2 items-center">
          Campaign{" "}
          <button
            onClick={() => dispatch(setModalCreateActive(true))}
            className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary bg-primary px-6 py-1 rounded-lg text-white font-semibold"
          >
            Buat Campaign
          </button>
        </h1>
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
        {typeButton == "daftar" && (
          <>
            <div>
              <div className="w-full">
                <div className="flex justify-between w-full items-center">
                  <h1 className="text-start text-3xl font-bold">
                    Aktif dan Disetujui
                  </h1>
                  <div className="flex justify-center">
                    <PageNumber total={totalPN1} page={pN1} setPage={setPN1} />
                  </div>
                </div>
                <div className="relative overflow-x-auto max-h-[100vh] overflow-y-auto shadow-md sm:rounded-lg mt-4">
                  <TableCampaignOperator />
                </div>
              </div>
            </div>
            <div className={`w-full my-5`}>
              <div className="w-full">
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
            </div>
          </>
        )}
      </div>
      {typeButton == "riwayat" && (
        <div className={`w-full my-5`}>
          <div className="w-full">
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
      )}
    </>
  );
}
