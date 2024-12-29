import axios from "axios";
import toast from "react-hot-toast";
import {
  setAdminKeuangan,
  setDonatur,
  setModalCreateAdmin,
  setModalCreateOperator,
  setOperator,
  setTokenAdmin,
  setUser,
} from "../reducers/authReducer";
import Swal from "sweetalert2";
import { setTotalPNDonatur } from "../reducers/pageNumberReducer";
import { setPageImage } from "../reducers/pageReducer";
export const API_URL = import.meta.env.VITE_API_URL;

export const register =
  (username, phoneNumber, email, password, address) => async (dispatch) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup/admin`, {
        username: username,
        phoneNumber: phoneNumber,
        email: email,
        password: password,
        address: address,
        role: "operator",
      });
      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Operator berhasil dibuat",
          icon: "success",
        });
        dispatch(setModalCreateOperator(false));
      }
    } catch (error) {
      Swal.fire({
        title: "Proses register gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };
export const registerAdmin =
  (username, phoneNumber, email, password, address) => async (dispatch) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup/admin`, {
        username: username,
        phoneNumber: phoneNumber,
        email: email,
        password: password,
        address: address,
        role: "keuangan",
      });
      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Admin berhasil dibuat",
          icon: "success",
        });
        dispatch(setModalCreateAdmin(false));
      }
    } catch (error) {
      Swal.fire({
        title: "Proses membuat admin gagal",
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

export const resetPassword = (email) => async () => {
  try {
    const result = await Swal.fire({
      title: "Yakin ingin mereset password operator ini?",
      text: "Operator ini akan direset password",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Reset",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const response = await axios.post(
        `${API_URL}/auth/reset-password-admin`,
        {
          email: email,
        }
      );
      if (response) {
        Swal.fire({
          title: "Reset password berhasil",
          text: "Silahkan cek email anda",
          icon: "success",
        });
      }
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
export const nonActiveOperator = (id) => async (dispatch, getState) => {
  try {
    const result = await Swal.fire({
      title: "Yakin ingin menonaktifkan operator ini?",
      text: "Operator ini akan dinonaktifkan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Setujui",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const { tokenAdmin } = getState().auth;
      const response = await axios.put(
        `${API_URL}/admin/nonaktive-Operator/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      if (response) {
        Swal.fire({
          title: `Berhasil dinonaktifkan`,
          text: "Proses menonaktifan operator berhasil",
          icon: "success",
        });
      }
    }
  } catch (error) {
    Swal.fire({
      title: "Proses menonaktifan operator gagal",
      text: error.response.data.message,
      icon: "error",
    });
  }
};
export const activeOperator = (id) => async (dispatch, getState) => {
  try {
    const result = await Swal.fire({
      title: "Yakin ingin mengaktifkan operator ini?",
      text: "Operator ini akan diaktifkan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Setujui",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const { tokenAdmin } = getState().auth;
      const response = await axios.put(
        `${API_URL}/admin/aktive-Operator/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      if (response) {
        Swal.fire({
          title: `Berhasil diaktifkan`,
          text: "Proses mengaktifkan operator berhasil",
          icon: "success",
        });
      }
    }
  } catch (error) {
    Swal.fire({
      title: "Proses mengaktifkan operator gagal",
      text: error.response.data.message,
      icon: "error",
    });
  }
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
export const getAllOperator = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/get-all-operator?page=${pageNumber}`
    );
    const data = response.data;
    dispatch(setOperator(data.content));
    dispatch(setTotalPNDonatur(data.totalPages));
  } catch (error) {
    console.error("Error fetching Donatur", error);
  }
};
export const getAdminKeuangan = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/get-all-keuangan`
    );
    const data = response.data;
    dispatch(setAdminKeuangan(data.content));
  } catch (error) {
    console.error("Error fetching Donatur", error);
  }
};

export const getSearchDonatur = (name, page) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/donatur/search?search=${name}&page=${page}`
    );
    const data = response.data;
    dispatch(setDonatur(data.content));
    dispatch(setTotalPNDonatur(data.totalPages));
  } catch (error) {
    return;
  }
};

export const getSearchOperator = (name, page) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/search-operator?search=${name}&page=${page}`
    );
    const data = response.data;
    dispatch(setOperator(data.content));
    dispatch(setTotalPNDonatur(data.totalPages));
  } catch (error) {
    return;
  }
};
export const getPageImage = () => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/dashboardImage`);
    const data = response.data;
    dispatch(setPageImage(data));
  } catch (error) {
    return;
  }
};
export const uploadPageImage = (images) => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const formData = new FormData();
    {
      images.image1 != null && formData.append("image_1", images.image1);
    }
    {
      images.image2 != null && formData.append("image_2", images.image2);
    }
    {
      images.image3 != null && formData.append("image_3", images.image3);
    }
    const response = await axios.post(
      `${API_URL}/dashboardImage/create`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${tokenAdmin}`,
        },
      }
    );
    if (response) {
      Swal.fire({
        title: `Berhasil`,
        text: "Proses upload gambar berhasil",
        icon: "success",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "Proses upload gambar gagal",
      text: error.response.data.message,
      icon: "error",
    });
  }
};
export const editPageImage = (images) => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const formData = new FormData();
    {
      images.image1 != null && formData.append("image_1", images.image1);
    }
    {
      images.image2 != null && formData.append("image_2", images.image2);
    }
    {
      images.image3 != null && formData.append("image_3", images.image3);
    }
    const response = await axios.put(
      `${API_URL}/dashboardImage/edit/1`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${tokenAdmin}`,
        },
      }
    );
    if (response) {
      Swal.fire({
        title: `Berhasil`,
        text: "Proses merubah gambar berhasil",
        icon: "success",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "Proses merubah gambar gagal",
      text: error.response.data.message,
      icon: "error",
    });
  }
};
