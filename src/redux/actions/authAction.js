import axios from "axios";
import toast from "react-hot-toast";
import { setDonatur, setTokenAdmin, setUser } from "../reducers/authReducer";
import Swal from "sweetalert2";
import { setTotalPNDonatur } from "../reducers/pageNumberReducer";
export const API_URL = import.meta.env.VITE_API_URL;

export const register =
  (username, phoneNumber, email, password) => async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup/donatur`, {
        username: username,
        phoneNumber: phoneNumber,
        email: email,
        password: password,
      });
      if (response) {
        toast.success("Proses Register Berhasil");
      }
    } catch (error) {
      Swal.fire({
        title: "Proses register gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };
export const login = (acount, password, navigate) => async (dispatch) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signin/admin`, {
      emailOrPhoneNumber: acount,
      password: password,
    });
    if (response) {
      const data = response.data;
      Swal.fire({
        title: `Selamat datang ${data.username}`,
        icon: "success",
      });
      dispatch(setTokenAdmin(data.token));
      navigate("/dashboard");
    }
  } catch (error) {
    Swal.fire({
      title: "Proses login gagal",
      text: error.response.data.message,
      icon: "error",
    });
  }
};

export const getMe =
  (navigate, navigatePathSuccess, navigatePathError) =>
  async (dispatch, getState) => {
    const { tokenAdmin } = getState().auth;

    try {
      const response = await axios.get(`${API_URL}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
        },
      });
      const data = response.data;
      dispatch(setUser(data));
      if (navigatePathSuccess) navigate(navigatePathSuccess);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response.status === 400) {
          logout();
          if (navigatePathError) navigate(navigatePathError);
          return;
        }

        toast.error(error?.response?.data?.message);
        return;
      }

      return;
    }
  };

export const editProfileUser =
  (
    username,
    phoneNumber,
    email,
    password,
    profilePicture,
    address,
    setEdit,
    toLogin,
    navigate
  ) =>
  async (dispatch, getState) => {
    const { token } = getState().auth;
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("phoneNumber", phoneNumber);
      formData.append("email", email);
      {
        if (password != null) {
          formData.append("password", password);
        }
      }
      {
        profilePicture != null && formData.append("image", profilePicture);
      }
      formData.append("address", address);
      const response = await axios.post(`${API_URL}/donatur/edit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response) {
        const data = response.data;
        {
          toLogin == true
            ? (toast.success(
                "Proses edit profile berhasil silahkan masuk menggunakan akun dan password terbaru"
              ),
              navigate("/"),
              dispatch(setTokenAdmin(null)),
              dispatch(setUser(null)))
            : (dispatch(setUser(data)),
              setEdit(false),
              toast.success("Proses Edit Profile selesai"));
        }
      }
    } catch (error) {
      toast.error("Proses edit profile gagal");
    }
  };

export const resetPassword = (email, setSucces) => async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      email: email,
    });
    if (response) {
      setSucces(true);
      Swal.fire({
        title: "Reset password berhasil",
        text: "Silahkan cek email anda",
        icon: "success",
      });
    }
  } catch (error) {
    Swal.fire({
      title: error.response.data.message,
      text: "Masukkan ulang email anda",
      icon: "error",
    });
  }
};
export const logout = (navigate) => (dispatch) => {
  Swal.fire({
    title: "Yakin ingin keluar?",
    text: "Anda akan keluar dari akun ini.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yakin Keluar",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      dispatch(setTokenAdmin(null));
      dispatch(setUser(null));
      Swal.fire({
        title: "Logout",
        text: "Berhasil logout",
        icon: "success",
      });
      navigate("/");
    }
  });
};

export const getAllDonatur = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/donatur?page=${pageNumber}`);
    const data = response.data;
    dispatch(setDonatur(data.content));
    dispatch(setTotalPNDonatur(data.totalPages));
  } catch (error) {
    console.error("Error fetching Donatur", error);
  }
};