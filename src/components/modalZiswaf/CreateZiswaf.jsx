import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import { createZiswaf, getCategoryCoa } from "../../redux/actions/ziswafAction";
import { setModalCreateZiswaf } from "../../redux/reducers/ziswafReducer";
import PropTypes from "prop-types";

function CreateZiswaf({ type }) {
  const dispatch = useDispatch();
  const { modalCreateZiswaf, coaCategory } = useSelector((state) => state.ziswaf);
  const [isLoading, setLoading] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [coaDebitId, setCoaDebitId] = useState("");
  const [coaKreditId, setCoaKreditId] = useState("");

  useEffect(() => {
    dispatch(getCategoryCoa());
  }, [dispatch]);

  if (!modalCreateZiswaf) {
    return null;
  }

  const handleCreateZiswaf = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(
      createZiswaf(type, {
        categoryName,
        amount: 0,
        distribution: 0,
        coaDebitId: coaDebitId ? Number(coaDebitId) : null,
        coaKreditId: coaKreditId ? Number(coaKreditId) : null,
      })
    ).finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setModalCreateZiswaf(false))}
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600 capitalize">
          Buat {type} Baru
        </h2>
        <form className="space-y-6" onSubmit={handleCreateZiswaf}>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
              Nama {type}
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={`Enter ${type} title`}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              COA Debit
            </label>
            <select
              value={coaDebitId}
              onChange={(e) => setCoaDebitId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Pilih COA Debit</option>
              {coaCategory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item?.accountCode} - {item?.accountName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              COA Kredit
            </label>
            <select
              value={coaKreditId}
              onChange={(e) => setCoaKreditId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Pilih COA Kredit</option>
              {coaCategory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item?.accountCode} - {item?.accountName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <button
              type="button"
              className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
              onClick={() => dispatch(setModalCreateZiswaf(false))}
            >
              Cancel
            </button>
            {isLoading ? (
              <div className="w-full flex justify-center mt-8">
                <OrbitProgress
                  variant="dotted"
                  color="#69c53e"
                  text=""
                  style={{ fontSize: "8px" }}
                  textColor=""
                />
              </div>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200 capitalize"
              >
                Buat {type}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
CreateZiswaf.propTypes = {
  type: PropTypes.oneOf(["zakat", "infak", "dskl", "wakaf"]).isRequired,
};

export default CreateZiswaf;
