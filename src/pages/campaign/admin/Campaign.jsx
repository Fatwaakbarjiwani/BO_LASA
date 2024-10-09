import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getActiveAproveCampaign,
  getDetailCampaign,
  tutupCampaignActive,
} from "../../../redux/actions/campaignAction";
import { setPNActiveCampaign } from "../../../redux/reducers/pageNumberReducer";
import CreateCampaign from "../../../components/modalCampaign/createCampaign";
import {
  setModalCreateActive,
  setModalEditActive,
} from "../../../redux/reducers/campaignReducer";
import EditCampaign from "../../../components/modalCampaign/EditCampaign";
import { OrbitProgress } from "react-loading-indicators";
import PageNumber from "../../../components/PageNumber";

export default function Campaign() {
  const dispatch = useDispatch();
  const { totalPNActiveCampaign } = useSelector((state) => state.pn);
  const { allCampaign } = useSelector((state) => state.campaign);
  const { modalCreateActive } = useSelector((state) => state.campaign);
  const { modalEditActive } = useSelector((state) => state.campaign);
  const { pNActiveCampaign } = useSelector((state) => state.pn);
  const [isLoading, setLoading] = useState(false);
  const [id, setId] = useState("");
  useEffect(() => {
    if (
      pNActiveCampaign ||
      modalCreateActive == false ||
      modalEditActive == false ||
      isLoading == false
    ) {
      dispatch(getActiveAproveCampaign(pNActiveCampaign - 1));
    }
  }, [
    dispatch,
    pNActiveCampaign,
    modalCreateActive,
    modalEditActive,
    isLoading,
  ]);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  return (
    <>
      <CreateCampaign />
      <EditCampaign />
      <div className={`w-full my-5`}>
        <h1 className="text-start text-3xl font-bold mb-5 flex gap-4 items-center">
          Campaign{" "}
          <button
            onClick={() => dispatch(setModalCreateActive(true))}
            className="text-lg shadow active:scale-105 duration-200 flex items-center justify-center bg-primary bg-primary px-6 py-1 rounded-full text-white font-semibold"
          >
            Buat Campaign
          </button>
        </h1>
        <div className="w-full shadow-md p-4 border-gray-100">
          <div className="flex justify-between w-full items-center">
            <h1 className="text-start text-3xl font-bold">
              Aktif dan Disetujui
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
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-slate-200 dark:bg-gray-700 dark:text-gray-400 shadow-lg sticky top-0">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Id
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Campaign
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Pembuat
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Lokasi
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tanggal & Waktu
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Target
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Terkumpul
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Kategori
                  </th>
                  <th scope="col" className="px-6 py-3">
                    status
                  </th>
                  <th
                    scope="col"
                    className="text-center px-6 py-3 rounded-tr-lg rounded-br-lg"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {allCampaign.map((item) => (
                  <tr
                    key={item.campaignId}
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                  >
                    <td className="px-6 py-4">{item?.displayId}</td>
                    <td className="px-6 py-4">{item?.campaignName}</td>
                    <td className="px-6 py-4">{item?.creator}</td>
                    <td className="px-6 py-4">{item?.location}</td>
                    <td className="px-6 py-4">
                      {item?.startDate} - {item?.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rp {formatNumber(item?.targetAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {formatNumber(item?.currentAmount)}
                    </td>
                    {item?.active ? (
                      <td className="text-primarybg-primary font-semibold px-6 py-4">
                        Aktif
                      </td>
                    ) : (
                      <td className="text-primarybg-primary font-semibold px-6 py-4">
                        Tidak Aktif
                      </td>
                    )}
                    <td className="px-6 py-4">{item?.campaignCategory}</td>
                    <td className="px-6 py-4 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => {
                            dispatch(getDetailCampaign(item?.campaignId));
                            dispatch(setModalEditActive(true));
                          }}
                          className="active:scale-105 duration-200 w-16 h-7 rounded-full shadow-md bg-blue-500 text-white font-semibold"
                        >
                          Edit
                        </button>
                        {isLoading && id == item?.campaignId ? (
                          <div className="w-full flex justify-center mt-2">
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
                              setId(item?.campaignId);
                              dispatch(
                                tutupCampaignActive(item?.campaignId)
                              ).finally(() => setLoading(false));
                            }}
                            className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold mt-1"
                          >
                            Tutup
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
