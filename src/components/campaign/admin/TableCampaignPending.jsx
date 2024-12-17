import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { OrbitProgress } from "react-loading-indicators";
import {
  deleteCampaign,
  getApproveCampaign,
  getCampaignPending,
  getDetailCampaign,
  getSearchCampaignPending,
} from "../../../redux/actions/campaignAction";
import { setModalEditActive } from "../../../redux/reducers/campaignReducer";

export default function TableCampaignPending() {
  const [id, setId] = useState("");
  const [id2, setId2] = useState("");
  const dispatch = useDispatch();
  const { campaignPending } = useSelector((state) => state.campaign);
  const { searchCampaignPending } = useSelector((state) => state.campaign);
  const { modalCreateActive } = useSelector((state) => state.campaign);
  const { modalEditActive } = useSelector((state) => state.campaign);
  const { pN2 } = useSelector((state) => state.pn);
  const [isLoading, setLoading] = useState(false);
  const [isLoadingPending, setLoadingPending] = useState(false);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  useEffect(() => {
    if (searchCampaignPending) {
      dispatch(getSearchCampaignPending(searchCampaignPending, pN2 - 1));
    }
    if (
      !searchCampaignPending &&
      (pN2 ||
        modalCreateActive == false ||
        modalEditActive == false ||
        isLoading == false ||
        isLoadingPending == false)
    ) {
      dispatch(getCampaignPending(pN2 - 1));
    }
  }, [
    dispatch,
    pN2,
    modalCreateActive,
    modalEditActive,
    isLoading,
    isLoadingPending,
    searchCampaignPending,
  ]);

  return (
    <table className="w-full text-sm text-left rtl:text-right text-gray-500">
      <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
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
            Persetujuan
          </th>
          <th scope="col" className="px-6 py-3">
            Status
          </th>
          <th scope="col" className="px-6 py-3">
            Kategori
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
        {campaignPending.map((item) => (
          <tr
            key={item.campaignId}
            className="odd:bg-white even:bg-gray-50 border-b odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
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
            <td className="px-6 py-4">{formatNumber(item?.currentAmount)}</td>
            {item?.approved ? (
              <td className="whitespace-nowrap text-lg text-primary font-semibold px-6 py-4">
                Disetujui
              </td>
            ) : (
              <td className="text-lg font-semibold px-6 py-4">Pending</td>
            )}
            {item?.active ? (
              <td className="text-lg text-primary font-semibold px-6 py-4">
                Aktif
              </td>
            ) : (
              <td className="whitespace-nowrap text-lg text-gray font-semibold px-6 py-4">
                Tidak Aktif
              </td>
            )}
            <td className="px-6 py-4">{item?.campaignCategory}</td>
            <td className="p-2">
              <div className="flex flex-col items-center gap-1">
                {isLoadingPending && id2 == item?.campaignId ? (
                  <div className="w-full flex justify-center">
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
                      setLoadingPending(true);
                      setId2(item?.campaignId);
                      dispatch(getApproveCampaign(item?.campaignId)).finally(
                        () => setLoadingPending(false)
                      );
                    }}
                    className="active:scale-105 duration-200 w-16 h-7 rounded-full shadow-md bg-yellow-400 text-white font-semibold"
                  >
                    Setujui
                  </button>
                )}
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
                  <div className="w-full flex justify-center">
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
                      dispatch(deleteCampaign(item?.campaignId)).finally(() =>
                        setLoading(false)
                      );
                    }}
                    className="w-16 h-7 rounded-full shadow-md bg-red-500 text-white font-semibold"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
