import { useState } from "react";
import logo from "../assets/logo.svg";
import { useDispatch } from "react-redux";
import { login } from "../redux/actions/authAction";
import { OrbitProgress } from "react-loading-indicators";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const [acount, setAcount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <div className="flex w-full h-screen absolute">
      <div className="w-2/6 h-full bg-primary flex items-center justify-center">
        <img
          src={logo}
          className="bg-white rounded-2xl p-4 w-3/4 md:w-1/2"
          alt="Logo"
        />
      </div>

      <div className="w-4/6 h-full flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-primary">
            Admin Login
          </h2>

          <div>
            <label
              htmlFor="emailOrPhone"
              className="text-sm font-medium text-gray-700"
            >
              Email / Phone Number
            </label>
            <input
              value={acount}
              onChange={(e) => setAcount(e.target.value)}
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              placeholder="Enter email or phone number"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              id="password"
              name="password"
              placeholder="Enter password"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Login Button */}
          <div className="flex justify-center">
            {loading ? (
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
                onClick={() => {
                  setLoading(true);
                  dispatch(login(acount, password,navigate)).finally(() =>
                    setLoading(false)
                  );
                }}
                type="submit"
                className="active:scale-105 duration-300 w-full py-3 mt-6 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition duration-300"
              >
                Login
              </button>
            )}
          </div>

          <div className="text-center">
            <p className="mt-4 text-sm text-gray-600">
              Forgot password?{" "}
              <a href="#" className="font-medium text-primary hover:underline">
                Reset here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
