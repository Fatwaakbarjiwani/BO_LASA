import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { HiExclamation } from "react-icons/hi";
import { IoMdClose } from "react-icons/io";
import { registerAdmin } from "../../redux/actions/authAction";
import { OrbitProgress } from "react-loading-indicators";
import { setModalCreateAdmin } from "../../redux/reducers/authReducer";

export default function ModalAdmin() {
  const { modalCreateAdmin } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const handleRegister = () => {
    if (
      password === "" ||
      phoneNumber === "" ||
      userName === "" ||
      email === ""
    ) {
      setError("Field Tidak Boleh Kosong");
    } else if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password berbeda");
    } else {
      setLoading(true);
      dispatch(
        registerAdmin(userName, phoneNumber, email, password, address)
      ).finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (modalCreateAdmin) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [modalCreateAdmin]);

  useEffect(() => {
    if (error) {
      setTimeout(() => setError(""), 3000);
    }
  }, [error]);

  const handleCloseModal = () => {
    setIsVisible(false);
    setTimeout(() => {
      dispatch(setModalCreateAdmin(false));
    }, 300);
  };

  return (
    <>
      {modalCreateAdmin && (
        <div className="font-Inter bg-black/50 justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none backdrop-blur-sm">
          <div
            className={`relative my-6 mx-auto transition-all duration-300 transform ${
              isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="bg-white sm:w-96 rounded-3xl p-5 font-Inter">
              <div className="flex justify-between items-center">
                <div className="flex justify-end w-4/6">
                  <div className="w-full font-semibold text-gray-500 text-xl">
                    Membuat Admin Keuangan
                  </div>
                </div>
                <button
                  className="rounded-full p-1 hover:scale-105"
                  onClick={handleCloseModal}
                >
                  <IoMdClose />
                </button>
              </div>
              <div className="flex flex-col gap-2 md:gap-3">
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-gray-500">
                    Nama Admin Keuangan
                  </label>
                  <input
                    type="text"
                    className="rounded-md md:rounded-xl ring-1 ring-gray-600 focus:outline-none w-full  py-1 px-5"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="name" className="  text-gray-500">
                    Nomor Handphone
                  </label>
                  <input
                    type="text"
                    className="rounded-md md:rounded-xl ring-1 ring-gray-600 focus:outline-none w-full  py-1 px-5"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="name" className="  text-gray-500">
                    Email
                  </label>
                  <input
                    type="email"
                    className="rounded-md md:rounded-xl ring-1 ring-gray-600 focus:outline-none w-full  py-1 px-5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="name" className="  text-gray-500">
                    Alamat
                  </label>
                  <input
                    type="email"
                    className="rounded-md md:rounded-xl ring-1 ring-gray-600 focus:outline-none w-full  py-1 px-5"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="name" className="  text-gray-500">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    className="rounded-md md:rounded-xl ring-1 ring-gray-600 focus:outline-none w-full  py-1 px-5"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="name" className="  text-gray-500">
                    Konfirmasi Kata Sandi
                  </label>
                  <input
                    type="password"
                    className="rounded-md md:rounded-xl ring-1 ring-gray-600 focus:outline-none w-full  py-1 px-5"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="absolute w-full right-0 top-0">
                    <div className="bg-white flex gap-2 items-center drop-shadow-md p-1 rounded-md">
                      <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                        <HiExclamation className="h-5 w-5" />
                      </div>
                      <div className="text-sm">{error}</div>
                    </div>
                  </div>
                )}
              </div>
              {isLoading ? (
                <div className="w-full flex justify-center mt-4">
                  <OrbitProgress
                    variant="dotted"
                    color="#69c53e"
                    text=""
                    style={{ fontSize: "6px" }}
                    textColor=""
                  />
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  className="w-full bg-primary  text-white mt-8 rounded-md md:rounded-xl px-5 py-2 hover:scale-105 transition-transform duration-300"
                >
                  Daftar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
