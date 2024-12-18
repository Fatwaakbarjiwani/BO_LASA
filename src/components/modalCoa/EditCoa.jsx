import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { OrbitProgress } from "react-loading-indicators";
import PropTypes from "prop-types";
import {
  editCategoryCoa,
  getCategoryCoa,
  getDetailCoa,
} from "../../redux/actions/ziswafAction";
import {
  setDetailCoa,
  setModalEditCoa,
} from "../../redux/reducers/transaction&summaryReducer";

function EditCoa({ id }) {
  const dispatch = useDispatch();
  const { modalEditCoa } = useSelector((state) => state.summary);
  const { detailCoa } = useSelector((state) => state.summary);
  const [isLoading, setLoading] = useState(false);
  const { coaCategory } = useSelector((state) => state.ziswaf);

  const typedata = [
    {
      id: 1,
      name: "Asset",
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
    {
      id && dispatch(getDetailCoa(id));
    }
    {
      !modalEditCoa && setName("");
      setCode("");
      setIdParent("");
      setType("");
      dispatch(setDetailCoa([]));
    }
  }, [dispatch, id, modalEditCoa]);
  useEffect(() => {
    {
      detailCoa && setType(detailCoa?.accountType || "");
      setName(detailCoa?.accountName || "");
      setCode(detailCoa?.accountCode || "");
      setIdParent(detailCoa?.parentAccount?.id || "");
    }
  }, [detailCoa]);

  if (!modalEditCoa) {
    return null;
  }

  const handleEditCoa = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(editCategoryCoa(code, name, type, idParent, id)).finally(() =>
      setLoading(false)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 font-Madimi">
      <div className="bg-white rounded-xl p-4 w-full max-w-lg shadow-lg relative m-4 max-h-[95vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
          onClick={() => dispatch(setModalEditCoa(false))}
        >
          &times;
        </button>
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-600 capitalize">
          Edit Coa
        </h2>
        <form className="space-y-6" onSubmit={handleEditCoa}>
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
              onClick={() => dispatch(setModalEditCoa(false))}
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
                onClick={handleEditCoa}
                className="px-6 py-2 w-full bg-primary text-white rounded-lg active:scale-105 transition duration-200 capitalize"
              >
                Edit Coa
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
export default EditCoa;

EditCoa.propTypes = {
  id: PropTypes.string,
};
