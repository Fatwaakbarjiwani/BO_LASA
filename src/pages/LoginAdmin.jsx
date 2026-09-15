import { useState } from "react";
import logoIcon from "../assets/logo.png";
import logoName from "../assets/logo1.jpeg";
import loginBg from "../assets/login-lazis-bg.png";
import { useDispatch } from "react-redux";
import { login, resetPassword } from "../redux/actions/authAction";
import { OrbitProgress } from "react-loading-indicators";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const [acount, setAcount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [reset, setReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(login(acount, password, navigate)).finally(() =>
      setLoading(false)
    );
  };

  const handleReset = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(resetPassword(acount)).finally(() => {
      setLoading(false);
      setReset(false);
    });
  };

  const inputClass =
    "w-full rounded-xl border border-[#d5e0d2] bg-white px-3.5 py-3 text-sm text-[#1a3317] outline-none transition placeholder:text-[#9aab96] focus:border-[#2f6b28] focus:ring-2 focus:ring-[#2f6b28]/15";

  return (
    <div className="fixed inset-0 flex w-screen overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <aside className="login-fade-in relative hidden w-[48%] flex-col justify-between overflow-hidden bg-[#163a12] px-12 py-12 text-white xl:px-16 lg:flex">
        <img
          src={loginBg}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-[10px]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(12,36,10,0.55) 0%, rgba(12,36,10,0.4) 38%, rgba(10,28,8,0.78) 72%, rgba(8,22,6,0.94) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,transparent_0%,rgba(8,22,6,0.45)_100%)]" />
        <div className="login-float absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#c4a35a]/10 blur-2xl" />
        <div className="absolute -left-20 bottom-10 h-64 w-64 rounded-full bg-[#69c53e]/10 blur-2xl" />

        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/75">
            Back Office
          </p>
        </div>

        <div
          className="login-fade-up relative z-10 max-w-md"
          style={{ animationDelay: "0.12s" }}
        >
          <div className="inline-flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-4">
              <img
                src={logoIcon}
                alt=""
                className="h-[68px] w-auto shrink-0 object-contain"
              />
              <img
                src={logoName}
                alt="LAZIS Sultan Agung"
                className="h-[48px] w-auto max-w-[240px] object-contain object-left"
              />
            </div>
          </div>
          <p className="mt-7 max-w-sm text-[15px] font-medium leading-7 text-white/90 drop-shadow-sm">
            Platform administrasi untuk mengelola kampanye, transaksi, dan
            penyaluran dana secara terpusat.
          </p>
        </div>

        <p
          className="login-fade-up relative z-10 text-xs text-white/55"
          style={{ animationDelay: "0.25s" }}
        >
          © {new Date().getFullYear()} LAZIS Sultan Agung
        </p>
      </aside>

      <main className="relative flex flex-1 items-center justify-center bg-[#f3f6f1] px-6 py-10 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 88% 12%, rgba(196,163,90,0.12), transparent 32%), radial-gradient(circle at 8% 88%, rgba(47,107,40,0.08), transparent 34%)",
          }}
        />

        <div
          className="login-fade-up relative z-10 w-full max-w-[400px]"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <img
              src={logoIcon}
              alt=""
              className="h-12 w-auto object-contain"
            />
            <img
              src={logoName}
              alt="LAZIS Sultan Agung"
              className="h-9 w-auto max-w-[210px] object-contain object-left"
            />
          </div>

          {!reset ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="mb-2">
                <h1 className="text-[30px] font-bold tracking-tight text-[#163a12]">
                  Masuk
                </h1>
                <p className="mt-1.5 text-sm font-medium text-[#5b6e57]">
                  Gunakan akun admin untuk mengakses dashboard.
                </p>
              </div>

              <div>
                <label
                  htmlFor="emailOrPhone"
                  className="mb-1.5 block text-[13px] font-semibold text-[#2c3f29]"
                >
                  Email / No. HP
                </label>
                <input
                  value={acount}
                  onChange={(e) => setAcount(e.target.value)}
                  type="text"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  autoComplete="username"
                  placeholder="Masukkan email atau nomor HP"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[13px] font-semibold text-[#2c3f29]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    className={`${inputClass} pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2f6b28] hover:text-[#163a12]"
                  >
                    {showPassword ? "Sembunyi" : "Lihat"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setReset(true)}
                  className="text-[13px] font-semibold text-[#2f6b28] hover:underline"
                >
                  Lupa password?
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-3">
                  <OrbitProgress
                    variant="dotted"
                    color="#2f6b28"
                    style={{ fontSize: "8px" }}
                  />
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#2f6b28] py-3 text-sm font-bold text-white transition hover:bg-[#265821] active:scale-[0.99]"
                >
                  Masuk
                </button>
              )}
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="mb-2">
                <h1 className="text-[30px] font-bold tracking-tight text-[#163a12]">
                  Reset Password
                </h1>
                <p className="mt-1.5 text-sm font-medium text-[#5b6e57]">
                  Masukkan email atau nomor HP yang terdaftar.
                </p>
              </div>

              <div>
                <label
                  htmlFor="resetEmailOrPhone"
                  className="mb-1.5 block text-[13px] font-semibold text-[#2c3f29]"
                >
                  Email / No. HP
                </label>
                <input
                  value={acount}
                  onChange={(e) => setAcount(e.target.value)}
                  type="text"
                  id="resetEmailOrPhone"
                  name="emailOrPhone"
                  placeholder="Masukkan email atau nomor HP"
                  className={inputClass}
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-3">
                  <OrbitProgress
                    variant="dotted"
                    color="#2f6b28"
                    style={{ fontSize: "8px" }}
                  />
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#2f6b28] py-3 text-sm font-bold text-white transition hover:bg-[#265821] active:scale-[0.99]"
                >
                  Kirim Reset
                </button>
              )}

              <p className="pt-1 text-center text-sm text-[#5b6e57]">
                Kembali ke{" "}
                <button
                  type="button"
                  onClick={() => setReset(false)}
                  className="font-semibold text-[#2f6b28] hover:underline"
                >
                  halaman masuk
                </button>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
