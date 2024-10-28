import Donatur from "../../../assets/donatur.svg";
import Distribusi from "../../../assets/distribusi.svg";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getAmilCampaign } from "../../../redux/actions/campaignAction";
import PageNumber from "../../../components/PageNumber";
import { setPNAmilCampaign } from "../../../redux/reducers/pageNumberReducer";
import { menuDropdown } from "../../../data/menu";

export default function Amil() {
  const dispatch = useDispatch();
  const { amilCampaign } = useSelector((state) => state.campaign);
  const { pNAmilCampaign } = useSelector((state) => state.pn);
  const { totalPNAmilCampaign } = useSelector((state) => state.pn);
  const [pilih, setPilih] = useState("campaign");
  useEffect(() => {
    dispatch(getAmilCampaign(pNAmilCampaign - 1, pilih));
  }, [dispatch, pNAmilCampaign, pilih]);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  return (
    <>
      <div className={`my-5 w-full`}>
        <h1 className="text-start text-3xl font-bold mb-5">Amil</h1>
        <div className="grid grid-cols-4 gap-3">
          <div className="shadow-md rounded-md border border-gray-100 p-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-slate-500 text-start font-semibold">
                  Total Pendapatan
                </h1>
                <p className="font-bold text-2xl text-start text-primary">
                  Rp {formatNumber(
                    amilCampaign[amilCampaign.length-1]?.totalAmount || 0
                  )}
                </p>
              </div>
              <img src={Donatur} alt="" />
            </div>
          </div>
          <div className="shadow-md rounded-md border border-gray-100 p-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-slate-500 text-start font-semibold">
                  Total Amil
                </h1>
                <p className="font-bold text-2xl text-start text-primary">
                  Rp {formatNumber(
                    amilCampaign[amilCampaign.length-1]?.totalAmil || 0
                  )}
                </p>
              </div>
              <img src={Distribusi} alt="" />
            </div>
          </div>
        </div>
        <div className="w-full shadow-md rounded-2xl mt-8 p-4 space-y-4 border border-gray-100 ">
          <div className="flex justify-between items-center items-center font-semibold font-Inter">
            <select
              className="bg-primary outline-none text-white rounded-full w-48 p-3 text-lg"
              onChange={(e) => setPilih(e.target.value)}
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
                {pilih == "campaign" ? (
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
                  </tr>
                )}
              </thead>
              {pilih == "campaign" ? (
                <tbody>
                  {amilCampaign
                    ?.slice(0, amilCampaign.length - 1)
                    .map((item) => (
                      <tr
                        key={item?.campaingId}
                        className="odd:bg-white even:bg-gray-50 border-b odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
                      >
                        <td className="px-6 py-4 w-1/12">{item?.campaignId}</td>
                        <td className="px-6 py-4 text-wrap">
                          {item?.campaignName}
                        </td>
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
                      </tr>
                    ))}
                </tbody>
              ) : (
                <tbody>
                  {amilCampaign
                    .slice(0, amilCampaign.length - 1)
                    ?.map((item) => (
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
                      </tr>
                    ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
