import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDistribution } from "../../redux/actions/transaksiAction";

export default function TableDistribusi() {
  const dispatch = useDispatch();
  const { pN } = useSelector((state) => state.pn);
  const { distribution } = useSelector((state) => state.summary);
  const { createDokumentasi } = useSelector((state) => state.summary);

  useEffect(() => {
    if (createDokumentasi == false) {
      dispatch(getDistribution(pN - 1));
    }
  }, [dispatch, pN, createDokumentasi]);
  const formatNumber = (value) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  return (
    <table className="w-full justify-between text-sm text-gray-500 table-auto">
      <thead className="justif text-xs text-gray-700 uppercase bg-slate-200 shadow-lg sticky top-0">
        <tr className="text-left">
          <th scope="col" className="px-6 py-3rounded-tl-lg rounded-bl-lg">
            ID
          </th>
          <th scope="col" className="px-6 py-3">
            Jumlah Distribusi
          </th>
          <th scope="col" className="px-6 py-3 w-60 text-wrap">
            Tanggal
          </th>
          <th scope="col" className="px-6 py-3">
            Penerima
          </th>
          <th scope="col" className="px-6 py-3">
            kategori
          </th>
          <th scope="col" className="px-6 py-3">
            Deskripsi
          </th>
        </tr>
      </thead>
      <tbody>
        {distribution.map((item) => (
          <tr
            key={item?.id}
            className="odd:bg-white text-left even:bg-gray-50 border-b  odd:hover:bg-slate-500 even:hover:bg-slate-500 odd:hover:text-white even:hover:text-white "
          >
            <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
              {item?.id}
            </th>
            <td className="px-6 py-4 text-start">
              Rp {formatNumber(item?.distributionAmount || 0)}
            </td>
            <td className="px-6 py-4">{item?.distributionDate}</td>
            <td className="px-6 py-4 text-start">{item?.receiver}</td>
            <td className="px-6 py-4 text-start">{item?.category}</td>
            <td className="px-6 py-4">{item?.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
