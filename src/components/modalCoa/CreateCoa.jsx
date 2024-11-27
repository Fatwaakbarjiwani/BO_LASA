import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import PropTypes from "prop-types";
import { setModalCreateCoa } from "../../redux/reducers/transaction&summaryReducer";
import {
  createCategoryCoa,
  getCategoryCoa,
} from "../../redux/actions/ziswafAction";

function CreateCoa() {
  const dispatch = useDispatch();
  const { modalCreateCoa } = useSelector((state) => state.summary);
  const [isLoading, setLoading] = useState(false);
  const { coaCategory } = useSelector((state) => state.ziswaf);

  const typedata = [
    {
      id: 1,
      name: " Asset",
    },
    {
      id: 2,
      name: "Liability",
    },
    {
      id: 3,
      name: "Equity",
    },
    {
      id: 4,
      name: "Revenue",
    },
    {
      id: 5,
      name: "Expense",
    },
  ];

  // State for form inputs
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("");
  const [idParent, setIdParent] = useState("");

  useEffect(() => {
    dispatch(getCategoryCoa());
  }, [dispatch]);

  if (!modalCreateCoa) {
    return null;
  }

  const handleCreateCoa = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(createCategoryCoa(code, name, type, idParent)).finally(() =>
      setLoading(false)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setModalCreateCoa(false))}
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600 capitalize">
          Buat Coa Baru
        </h2>
        <form className="space-y-6" onSubmit={handleCreateCoa}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
              Kode Coa
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={`Enter Coa code`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
              Nama Coa
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={`Enter Coa title`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
              Tipe Akun
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Pilih Tipe Akun</option>
              {typedata.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="" className="text-primary">
              opsional
            </label>
            <select
              value={idParent}
              onChange={(e) => setIdParent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Pilih Rekening</option>
              {coaCategory.map((item) => (
                <option key={item.id} value={item.id}>
                  {`${item.accountCode} ${item.accountName}`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <button
              type="button"
              className="px-6 py-2 w-full bg-gray-300 text-gray-700 rounded-lg active:scale-105 transition duration-200"
              onClick={() => dispatch(setModalCreateCoa(false))}
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
                onClick={handleCreateCoa}
                className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200 capitalize"
              >
                Buat Coa
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
CreateCoa.propTypes = {
  type: PropTypes.oneOf(["zakat", "infak", "dskl", "wakaf"]).isRequired,
};

export default CreateCoa;
