import { useSelector } from "react-redux";
import PageNumber from "../../../components/PageNumber";
import { setPN } from "../../../redux/reducers/pageNumberReducer";
import TableDistribusi from "../../../components/distribusi/TableDistribusi";
import TableDokumentasi from "../../../components/distribusi/TableDokumentasi";
import { useState } from "react";
import TableOperasional from "../../../components/distribusi/TableOperasional";

const data = [
  { id: 1, nama: "Distribusi", value: "distribusi" },
  { id: 2, nama: "Dokumentasi", value: "documentasi" },
  { id: 2, nama: "Prosentase Biaya Admin", value: "penyaluran" },
];
export default function Distribusi() {
  const { pN } = useSelector((state) => state.pn);
  const { totalPN } = useSelector((state) => state.pn);
  const { createDokumentasi } = useSelector((state) => state.summary);
  const [typeButton, setTypeButton] = useState("distribusi");

  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Distribusi</h1>
      <div className="flex gap-4 items-center my-5">
        {data.map((item, id) => (
          <button
            key={id}
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
      <div className={`w-full`}>
        {typeButton == "distribusi" && (
          <div>
            <h1 className="text-start text-3xl font-bold">Daftar Distribusi</h1>
            <div className="w-full mt-2">
              <PageNumber total={totalPN} page={pN} setPage={setPN} />
              <div className="relative overflow-x-auto overflow-y-auto shadow-md sm:rounded-lg">
                <TableDistribusi />
              </div>
            </div>
          </div>
        )}
        {typeButton == "documentasi" && (
          <>
            {!createDokumentasi && (
              <h1 className="text-start text-3xl font-bold ">Dokumentasi</h1>
            )}
            <PageNumber total={totalPN} page={pN} setPage={setPN} />
            <TableDokumentasi />
          </>
        )}
        {typeButton == "penyaluran" && <TableOperasional />}
      </div>
    </>
  );
}
