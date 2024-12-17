import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/dashboard/admin/Dashboard";
import { useSelector } from "react-redux";
import Campaign from "./pages/campaign/admin/Campaign";
import LoginAdmin from "./pages/LoginAdmin";
import Protected from "./components/Protected";
import NoAccessToken from "./components/NoAccessToken";
import Pengguna from "./pages/pengguna/admin/Pengguna";
import Transaksi from "./pages/transaksi/admin/Transaksi";
import Berita from "./pages/berita/admin/Berita";
import Ziswaf from "./pages/ziswaf/admin/Ziswaf";
import Distribusi from "./pages/distribusi/admin/Dsitribusi";
import Amil from "./pages/amil/admin/Amil";
import Campaign2 from "./pages/campaign/subAdmin/Campaign2";
import Dashboard2 from "./pages/dashboard/subAdmin/Dashboard2";
import Administrasi from "./pages/administrasi/Administrasi";
import Tampilan from "./pages/tampilan/Tampilan";

function AppContent() {
  const { isSidebarOpen } = useSelector((state) => state.page);
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <>
      <div className="flex font-Madimi">
        {!isLoginPage && (
          <div className={`${isSidebarOpen ? "w-1/6" : "w-1/12"}`}>
            <Sidebar />
          </div>
        )}
        {!isLoginPage && <Navbar />}
        <div
          className={`${!isLoginPage && isSidebarOpen ? `w-5/6` : `w-11/12`}`}
        >
          <Routes>
            <Route
              path="/"
              element={
                <NoAccessToken>
                  <LoginAdmin />
                </NoAccessToken>
              }
            />
          </Routes>
          <div className={`${isSidebarOpen ? `mt-10 p-8` : `mt-10 p-10`}`}>
            <Routes>
              <Route
                path="/dashboard"
                element={
                  <Protected>
                    {user?.role == "ADMIN" ? <Dashboard /> : <Dashboard2 />}
                  </Protected>
                }
              />
              <Route
                path="/campaign"
                element={
                  <Protected>
                    {user?.role == "ADMIN" ? <Campaign /> : <Campaign2 />}
                  </Protected>
                }
              />
              <Route
                path="/pengguna"
                element={
                  <Protected>
                    <Pengguna />
                  </Protected>
                }
              />
              <Route
                path="/transaksi"
                element={
                  <Protected>
                    <Transaksi />
                  </Protected>
                }
              />
              <Route
                path="/administrasi"
                element={
                  <Protected>
                    <Administrasi />
                  </Protected>
                }
              />
              <Route
                path="/berita"
                element={
                  <Protected>
                    <Berita />
                  </Protected>
                }
              />
              <Route
                path="/distribusi"
                element={
                  <Protected>
                    <Distribusi />
                  </Protected>
                }
              />
              <Route
                path="/ziswaf"
                element={
                  <Protected>
                    <Ziswaf />
                  </Protected>
                }
              />
              <Route
                path="/amil"
                element={
                  <Protected>
                    <Amil />
                  </Protected>
                }
              />
              <Route
                path="/tampilan"
                element={
                  <Protected>
                    <Tampilan />
                  </Protected>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
