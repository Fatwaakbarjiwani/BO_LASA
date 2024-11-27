import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { menuDropdown } from "../../data/menu";
import { getAmilCampaign } from "../../redux/actions/campaignAction";
import PageNumber from "../PageNumber";
import { setPNAmilCampaign } from "../../redux/reducers/pageNumberReducer";
import {
  setCreateDokumentasi,
  setId,
  setType,
} from "../../redux/reducers/transaction&summaryReducer";
import CreateDokumentasi from "./CreateDokumentasi";

export default function TableDokumentasi() {
  const dispatch = useDispatch();
  const { amilCampaign } = useSelector((state) => state.campaign);
  const { type } = useSelector((state) => state.summary);
  const { pNAmilCampaign } = useSelector((state) => state.pn);
  const { totalPNAmilCampaign } = useSelector((state) => state.pn);

  useEffect(() => {
    dispatch(getAmilCampaign(pNAmilCampaign - 1, type));
  }, [dispatch, pNAmilCampaign, type]);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  return (
    <div className="w-full shadow-md rounded-2xl p-4 space-y-4 border border-gray-100 ">
      <CreateDokumentasi />
      <div className="flex justify-between items-center items-center font-semibold font-Inter">
        <select
          className="bg-primary outline-none text-white rounded-full w-48 p-3 text-lg"
          onChange={(e) => {
            dispatch(setType(e.target.value));
            dispatch(setPNAmilCampaign(1));
          }}
        >
          {menuDropdown.map((item, id) => (
            <option key={id} value={item?.value}>
              {item?.name}
            </option>
          ))}
        </select>

        <PageNumber
          total={totalPNAmilCampaign}
          page={pNAmilCampaign}
          setPage={setPNAmilCampaign}
        />
      </div>
      <div className="relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
          <thead className="text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
            {type == "campaign" ? (
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 w-80 rounded-tl-lg rounded-bl-lg"
                >
                  id
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 w-80 rounded-tl-lg rounded-bl-lg"
                >
                  Campaign
                </th>
                <th scope="col" className="px-6 py-3">
                  Lokasi
                </th>
                <th scope="col" className="px-6 py-3">
                  Target
                </th>
                <th scope="col" className="px-6 py-3">
                  Terkumpul
                </th>
                <th scope="col" className="px-6 py-3">
                  Amil
                </th>
                <th
                  scope="col"
                  className="text-center px-6 py-3 rounded-tr-lg rounded-br-lg"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="text-center px-6 py-3 rounded-tr-lg rounded-br-lg"
                >
                  Aksi
                </th>
              </tr>
            ) : (
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 w-80 rounded-tl-lg rounded-bl-lg"
                >
                  id
                </th>
                <th scope="col" className="px-6 py-3">
                  tipe
                </th>
                <th scope="col" className="px-6 py-3">
                  kategori
                </th>
                <th scope="col" className="px-6 py-3">
                  Terkumpul
                </th>
                <th scope="col" className="px-6 py-3">
                  Amil
                </th>
                <th scope="col" className="px-6 py-3">
                  Aksi
                </th>
              </tr>
            )}
          </thead>
          {type == "campaign" ? (
            <tbody>
              {amilCampaign?.slice(0, amilCampaign.length - 1).map((item) => (
                <tr
                  key={item?.campaingId}
                  className="odd:bg-white even:bg-gray-50 border-b odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                >
                  <td className="px-6 py-4 w-1/12">{item?.campaignId}</td>
                  <td className="px-6 py-4 text-wrap">{item?.campaignName}</td>
                  <td className="px-6 py-4">{item?.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {formatNumber(item?.targetAmount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {formatNumber(item?.currentAmount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {formatNumber(item?.amil || 0)}
                  </td>
                  {item?.active ? (
                    <td className="text-primary text-center font-semibold px-6 py-4">
                      AKTIF
                    </td>
                  ) : (
                    <td className="text-gray-600 text-center font-semibold px-6 py-4">
                      TIDAK AKTIF
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        dispatch(setCreateDokumentasi(true));
                        dispatch(setId(item?.campaignId));
                      }}
                      className="bg-blue-500 p-2 rounded-full font-semibold text-white drop-shadow border border-blue-400 hover:scale-105 duration-300"
                    >
                      Buat Dokumentasi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              {amilCampaign.slice(0, amilCampaign.length - 1)?.map((item) => (
                <tr
                  key={item?.id}
                  className="odd:bg-white even:bg-gray-50 border-b odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                >
                  <td className="px-6 py-4 text-wrap w-1/12">{item?.id}</td>
                  <td className="px-6 py-4 text-wrap">{item?.type}</td>
                  <td className="px-6 py-4">{item?.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {formatNumber(item?.amount || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {formatNumber(item?.amil || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        dispatch(setCreateDokumentasi(true));
                        dispatch(setId(item?.id));
                      }}
                      className="bg-blue-500 p-2 rounded-full font-semibold text-white drop-shadow border border-blue-400 hover:scale-105 duration-300"
                    >
                      Buat Dokumentasi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
