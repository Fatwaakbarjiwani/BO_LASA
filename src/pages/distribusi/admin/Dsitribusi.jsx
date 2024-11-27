import { useSelector } from "react-redux";
import PageNumber from "../../../components/PageNumber";
import { setPN } from "../../../redux/reducers/pageNumberReducer";
import TableDistribusi from "../../../components/distribusi/TableDistribusi";
import TableDokumentasi from "../../../components/distribusi/TableDokumentasi";

export default function Distribusi() {
  const { pN } = useSelector((state) => state.pn);
  const { totalPN } = useSelector((state) => state.pn);

  return (
    <>
      <div className={`mb-4 w-full`}>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Distribusi</h1>
        <div className="w-full shadow-md rounded-md border border-gray-100 p-4">
          <PageNumber total={totalPN} page={pN} setPage={setPN} />
          <div className="relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg">
            <TableDistribusi />
          </div>
        </div>
        <h1 className="text-start text-3xl font-bold mt-8">Dokumentasi</h1>
        <PageNumber total={totalPN} page={pN} setPage={setPN} />
        <TableDokumentasi />
      </div>
    </>
  );
}
