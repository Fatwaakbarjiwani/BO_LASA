import { Link, useLocation, useNavigate } from "react-router-dom";
import { menuItems } from "../data/navbarData";
import { menuItemsOperator } from "../data/navbarDataOperator";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Logout from "../assets/logout-01.svg";
import LogoutWhite from "../assets/logoutwhite.svg";
import { logout } from "../redux/actions/authAction";
import logoIcon from "../assets/logo.png";
import logoName from "../assets/logo1.jpeg";
import {
  setPN,
  setPN1,
  setPN2,
  setPN3,
  setPN4,
} from "../redux/reducers/pageNumberReducer";
import { menuItemsKeuangan } from "../data/navbarDataKeuangan";

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSidebarOpen } = useSelector((state) => state.page);
  const { user } = useSelector((state) => state.auth);

  const [activeMenu, setActiveMenu] = useState(
    localStorage.getItem("activeMenu") || location.pathname
  );
  return (
    <aside
      className={`fixed h-screen duration-300 z-40 ${
        isSidebarOpen ? "w-1/6" : "w-1/12"
      } bg-white shadow-md flex flex-col items-end font-Madimi`}
    >
      <div
        className={`w-full border-b border-gray-100 bg-white duration-300 ${
          isSidebarOpen ? "px-3 py-3" : "px-2 py-3"
        }`}
      >
        <div
          className={`flex items-center ${
            isSidebarOpen ? "justify-start gap-2" : "justify-center"
          }`}
        >
          <img
            src={logoIcon}
            alt=""
            className={`object-contain shrink-0 ${
              isSidebarOpen ? "h-10 w-auto" : "h-9 w-auto"
            }`}
          />
          {isSidebarOpen && (
            <img
              src={logoName}
              alt="LAZIS Sultan Agung"
              className="h-8 w-auto max-w-[calc(100%-2.75rem)] object-contain object-left"
            />
          )}
        </div>
      </div>
      <div className="w-full h-full flex flex-col justify-between">
        {user?.role == "ADMIN" ? (
          <>
            {menuItems.map((item, index) => (
              <Link to={item.route} key={index}>
                <div
                  className={`w-full flex items-center px-4 ${
                    activeMenu === item.route
                      ? "border-4 border-transparent border-l-[#69C53E]"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => {
                      setActiveMenu(item.route);
                      dispatch(setPN(1));
                      dispatch(setPN1(1));
                      dispatch(setPN2(1));
                      dispatch(setPN3(1));
                      dispatch(setPN4(1));
                    }}
                    className={`flex items-center w-full gap-2 ${
                      activeMenu === item.route
                        ? "rounded-3xl bg-[#69C53E] shadow-md text-white"
                        : ""
                    } ${
                      isSidebarOpen ? "px-8 py-2" : "justify-center px-2 py-1"
                    }`}
                    title={item.title}
                  >
                    <img
                      src={
                        activeMenu === item.route ? item.srcActive : item.src
                      }
                      alt={item.title}
                      className={`${isSidebarOpen ? "w-6" : "w-6 h-8"} `}
                    />
                    <span
                      className={`${isSidebarOpen ? "block" : "hidden"}  ${
                        activeMenu === item.route ? "text-white" : ""
                      } text-nowrap`}
                    >
                      {item.title}
                    </span>
                  </button>
                </div>
              </Link>
            ))}
          </>
        ) : user?.role == "OPERATOR" ? (
          <>
            <div className="mt-4 flex flex-col gap-4">
              {menuItemsOperator.map((item, index) => (
                <Link to={item.route} key={index}>
                  <div
                    className={`w-full flex items-center px-4 ${
                      activeMenu === item.route
                        ? "border-4 border-transparent border-l-[#69C53E]"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveMenu(item.route);
                        dispatch(setPN(1));
                        dispatch(setPN1(1));
                        dispatch(setPN2(1));
                        dispatch(setPN3(1));
                        dispatch(setPN4(1));
                      }}
                      className={`flex items-center w-full gap-2 ${
                        activeMenu === item.route
                          ? "rounded-3xl bg-[#69C53E] shadow-md text-white"
                          : ""
                      } ${
                        isSidebarOpen ? "px-8 py-2" : "justify-center px-2 py-1"
                      }`}
                      title={item.title}
                    >
                      <img
                        src={
                          activeMenu === item.route ? item.srcActive : item.src
                        }
                        alt={item.title}
                        className={`${isSidebarOpen ? "w-6" : "w-6 h-8"} `}
                      />
                      <span
                        className={`${isSidebarOpen ? "block" : "hidden"}  ${
                          activeMenu === item.route ? "text-white" : ""
                        }`}
                      >
                        {item.title}
                      </span>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-4">
              {menuItemsKeuangan.map((item, index) => (
                <Link to={item.route} key={index}>
                  <div
                    className={`w-full flex items-center px-4 ${
                      activeMenu === item.route
                        ? "border-4 border-transparent border-l-[#69C53E]"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveMenu(item.route);
                        dispatch(setPN(1));
                        dispatch(setPN1(1));
                        dispatch(setPN2(1));
                        dispatch(setPN3(1));
                        dispatch(setPN4(1));
                      }}
                      className={`flex items-center w-full gap-2 ${
                        activeMenu === item.route
                          ? "rounded-3xl bg-[#69C53E] shadow-md text-white"
                          : ""
                      } ${
                        isSidebarOpen ? "px-8 py-2" : "justify-center px-2 py-1"
                      }`}
                      title={item.title}
                    >
                      <img
                        src={
                          activeMenu === item.route ? item.srcActive : item.src
                        }
                        alt={item.title}
                        className={`${isSidebarOpen ? "w-6" : "w-6 h-8"} `}
                      />
                      <span
                        className={`${isSidebarOpen ? "block" : "hidden"}  ${
                          activeMenu === item.route ? "text-white" : ""
                        }`}
                      >
                        {item.title}
                      </span>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
        <div
          className={`w-full flex items-center px-4 ${
            activeMenu === "/logout"
              ? "border-4 border-transparent border-l-[#69C53E]"
              : ""
          }`}
        >
          <button
            onClick={() => {
              setActiveMenu("/logout");
              dispatch(logout(navigate));
            }}
            className={`flex items-center w-full gap-2 ${
              activeMenu === "/logout"
                ? "rounded-3xl bg-[#69C53E] shadow-md text-white"
                : ""
            } ${isSidebarOpen ? "px-8 py-2" : "justify-center px-2 py-1"}`}
            title="Logout"
          >
            <img
              src={activeMenu === "/logout" ? LogoutWhite : Logout}
              alt={"Logout"}
              className={`${isSidebarOpen ? "w-6" : "w-6 h-8"} `}
            />
            <span
              className={`${isSidebarOpen ? "block" : "hidden"}  ${
                activeMenu === "/logout" ? "text-white" : ""
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
