import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCategoryCampaign,
  getAllCampaignCategory,
} from "../../../redux/actions/campaignAction";
import {
  setIdCategoryCampaign,
  setModalEditCategory,
} from "../../../redux/reducers/campaignReducer";
import { OrbitProgress } from "react-loading-indicators";

export default function TableCategoryCampaign() {
  const dispatch = useDispatch();
  const [id, setId] = useState("");
  const [isLoading, setLoading] = useState("");
  const { modalEditCategory, modalCreateCategory, allCampaignCategory } =
    useSelector((state) => state.campaign);

  useEffect(() => {
    if (
      modalCreateCategory == false ||
      modalEditCategory == false ||
      isLoading == false
    ) {
      dispatch(getAllCampaignCategory());
    }
  }, [dispatch, modalCreateCategory, modalEditCategory, isLoading]);

  return (
    <div className="w-full">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th scope="col" className="px-4 py-3 w-1/6">
              ID
            </th>
            <th scope="col" className="px-4 py-3 w-4/6">
              Kategori Campaign
            </th>
            <th scope="col" className="px-4 py-3 w-1/6">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {allCampaignCategory.map((item) => (
            <tr key={item.id} className="bg-white border-b hover:bg-gray-100">
              <td className="px-4 py-2">{item?.id}</td>
              <td className="px-4 py-2">{item?.campaignCategory}</td>
              <td className="px-4 py-2 flex justify-center items-center gap-2">
                <button
                  onClick={() => {
                    dispatch(setIdCategoryCampaign(item?.id));
                    dispatch(setModalEditCategory(true));
                  }}
                  className="w-1/2 p-1 rounded-full bg-blue-500 text-white font-semibold"
                >
                  Edit
                </button>
                {isLoading && id == item?.id ? (
                  <div className="flex justify-center w-1/2">
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
                      setId(item?.id);
                      dispatch(deleteCategoryCampaign(item?.id)).finally(() =>
                        setLoading(false)
                      );
                    }}
                    className="w-1/2 p-1 rounded-full shadow-md bg-red-500 text-white font-semibold"
                  >
                    Hapus
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
