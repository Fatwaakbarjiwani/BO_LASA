import { useState } from "react";
import logoIcon from "../assets/logo.png";
import logoName from "../assets/logo1.jpeg";
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

  return (
    <div className="fixed inset-0 flex w-screen overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <aside className="login-fade-in relative hidden w-[46%] flex-col justify-between overflow-hidden bg-[#1f4d1a] px-12 py-12 text-white xl:px-16 lg:flex">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #163a12 0%, #245c1f 45%, #3d7a32 100%)",
          }}
        />
        <div className="login-float absolute -right-20 top-16 h-72 w-72 rounded-full bg-white/[0.07]" />
        <div className="absolute -left-16 bottom-20 h-52 w-52 rounded-full bg-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(105,197,62,0.2),transparent_55%)]" />

        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
            Back Office
          </p>
        </div>

        <div
          className="login-fade-up relative z-10"
          style={{ animationDelay: "0.12s" }}
        >
          <div className="inline-flex max-w-full items-center gap-4 rounded-2xl bg-white px-5 py-4">
            <img
              src={logoIcon}
              alt=""
              className="h-[72px] w-auto shrink-0 object-contain"
            />
            <img
              src={logoName}
              alt="LAZIS Sultan Agung"
              className="h-[52px] w-auto max-w-[280px] object-contain object-left"
            />
          </div>
          <p className="mt-8 max-w-sm text-[15px] font-medium leading-7 text-white/80">
            Platform administrasi untuk mengelola kampanye, transaksi, dan
            penyaluran dana secara terpusat.
          </p>
        </div>

        <p
          className="login-fade-up relative z-10 text-xs text-white/50"
          style={{ animationDelay: "0.25s" }}
        >
          © {new Date().getFullYear()} LAZIS Sultan Agung
        </p>
      </aside>

      <main className="relative flex flex-1 items-center justify-center bg-[#f5f8f3] px-6 py-10 sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, rgba(105,197,62,0.12), transparent 40%), radial-gradient(circle at 10% 90%, rgba(31,77,26,0.08), transparent 35%)",
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
                <h1 className="text-[28px] font-bold tracking-tight text-[#1a3317]">
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
                  className="w-full rounded-lg border border-[#d0ddd0] bg-white px-3.5 py-3 text-sm text-[#1a3317] outline-none transition placeholder:text-[#9aab96] focus:border-[#69c53e] focus:ring-2 focus:ring-[#69c53e]/20"
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
                    className="w-full rounded-lg border border-[#d0ddd0] bg-white px-3.5 py-3 pr-16 text-sm text-[#1a3317] outline-none transition placeholder:text-[#9aab96] focus:border-[#69c53e] focus:ring-2 focus:ring-[#69c53e]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#4f8f35] hover:text-[#3a6f26]"
                  >
                    {showPassword ? "Sembunyi" : "Lihat"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setReset(true)}
                  className="text-[13px] font-semibold text-[#4f8f35] hover:underline"
                >
                  Lupa password?
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-3">
                  <OrbitProgress
                    variant="dotted"
                    color="#69c53e"
                    style={{ fontSize: "8px" }}
                  />
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#69c53e] py-3 text-sm font-bold text-white transition hover:bg-[#5bb335] active:scale-[0.99]"
                >
                  Masuk
                </button>
              )}
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="mb-2">
                <h1 className="text-[28px] font-bold tracking-tight text-[#1a3317]">
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
                  className="w-full rounded-lg border border-[#d0ddd0] bg-white px-3.5 py-3 text-sm text-[#1a3317] outline-none transition placeholder:text-[#9aab96] focus:border-[#69c53e] focus:ring-2 focus:ring-[#69c53e]/20"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-3">
                  <OrbitProgress
                    variant="dotted"
                    color="#69c53e"
                    style={{ fontSize: "8px" }}
                  />
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#69c53e] py-3 text-sm font-bold text-white transition hover:bg-[#5bb335] active:scale-[0.99]"
                >
                  Kirim Reset
                </button>
              )}

              <p className="pt-1 text-center text-sm text-[#5b6e57]">
                Kembali ke{" "}
                <button
                  type="button"
                  onClick={() => setReset(false)}
                  className="font-semibold text-[#4f8f35] hover:underline"
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
