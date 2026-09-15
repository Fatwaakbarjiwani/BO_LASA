import { useDispatch, useSelector } from "react-redux";
import { setIsSidebarOpen } from "../redux/reducers/pageReducer";
import DsToggle from "../assets/ds-toggle.svg";
import { useEffect } from "react";
import { getMe } from "../redux/actions/authAction";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { isSidebarOpen } = useSelector((state) => state.page);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
   dispatch(getMe(navigate, null, "/"));
  }, [dispatch]);
  return (
    <div
      className={`${
        isSidebarOpen ? "w-5/6" : "w-11/12"
      } z-50 duration-300 right-0 p-2 fixed top-0 flex justify-between bg-white border-b-2 border-gray-300/20`}
    >
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => dispatch(setIsSidebarOpen(!isSidebarOpen))}
          className="border border-gray-500/20 rounded-full shadow"
        >
          <img
            src={DsToggle}
            alt="Toggle Sidebar"
            className={`duration-300 ${isSidebarOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-6">
          <img
            className="w-10 h-10 rounded-full"
            src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
            alt=""
          />
          <div>
            <h1 className="mr-2">{user?.username}</h1>
            <p className="font-semibold text-start">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
