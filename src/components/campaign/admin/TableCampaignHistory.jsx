import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCampaignHistoryAdmin,
} from "../../../redux/actions/campaignAction";

export default function TableCampaignHistory() {
  const dispatch = useDispatch();
  const { campaignHistory } = useSelector((state) => state.campaign);
  const { pN3 } = useSelector((state) => state.pn);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  useEffect(() => {
    if (pN3) {
      dispatch(getCampaignHistoryAdmin(pN3 - 1));
    }
  }, [dispatch, pN3, campaignHistory]);

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
        </tr>
      </thead>
      <tbody>
        {campaignHistory.map((item) => (
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}
