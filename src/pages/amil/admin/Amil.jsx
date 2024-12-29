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
  const { amilZakat } = useSelector((state) => state.ziswaf);
  const { amilWakaf } = useSelector((state) => state.ziswaf);
  const { amilInfak } = useSelector((state) => state.ziswaf);
  const { amilDskl } = useSelector((state) => state.ziswaf);
  const { pNAmilCampaign } = useSelector((state) => state.pn);
  const { totalPNAmilCampaign } = useSelector((state) => state.pn);
  const [pilih, setPilih] = useState("campaign");
  useEffect(() => {
    dispatch(getAmilCampaign(pNAmilCampaign - 1, "zakat"));
    dispatch(getAmilCampaign(pNAmilCampaign - 1, "infak"));
    dispatch(getAmilCampaign(pNAmilCampaign - 1, "wakaf"));
    dispatch(getAmilCampaign(pNAmilCampaign - 1, "dskl"));
    dispatch(getAmilCampaign(pNAmilCampaign - 1, "campaign"));
  }, [dispatch, pNAmilCampaign]);

  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  return (
    <>
      <div className={`mb-4 w-full`}>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Amil</h1>
        <div className="grid grid-cols-4 gap-3">
          <div className="shadow-md rounded-md border border-gray-100 p-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-slate-500 text-start font-semibold">
                  Total Pendapatan
                </h1>
                <p className="font-bold text-2xl text-start text-primary">
                  Rp{" "}
                  {formatNumber(
                    amilCampaign[amilCampaign.length - 1]?.totalAmount || 0
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
                  Rp{" "}
                  {formatNumber(
                    amilCampaign[amilCampaign.length - 1]?.totalAmil || 0
                  )}
                </p>
              </div>
              <img src={Distribusi} alt="" />
            </div>
          </div>
        </div>
        <div className="w-full my-4">
          <div className="flex justify-between items-center items-center font-semibold font-Inter">
            <select
              className="bg-primary outline-none text-white rounded-lg mb-2 w-48 p-3 text-lg"
              onChange={(e) => setPilih(e.target.value)}
            >
              {menuDropdown.map((item, id) => (
                <option key={id} value={item?.value}>
                  {item?.name}
                </option>
              ))}
            </select>

            {pilih == "campaign" && (
              <PageNumber
                total={totalPNAmilCampaign}
                page={pNAmilCampaign}
                setPage={setPNAmilCampaign}
              />
            )}
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
                    .map((item,id) => (
                      <tr
                        key={id}
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
                  {(pilih == "zakat"
                    ? amilZakat.slice(0, amilZakat.length - 1)
                    : pilih == "infak"
                    ? amilInfak.slice(0, amilInfak.length - 1)
                    : pilih == "wakaf"
                    ? amilWakaf.slice(0, amilWakaf.length - 1)
                    : amilDskl.slice(0, amilDskl.length - 1)
                  )?.map((item,id) => (
                    <tr
                      key={id}
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
