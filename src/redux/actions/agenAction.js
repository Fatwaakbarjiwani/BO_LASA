import axios from "axios";
import {
  setListAgen,
  setDetailAgen,
  setModalCreateAgen,
  setModalEditAgen,
} from "../reducers/agenReducer";
import Swal from "sweetalert2";

export const API_URL = import.meta.env.VITE_API_URL;

export const getAllAgen = () => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const response = await axios.get(`${API_URL}/agen/get-all`, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });
    dispatch(setListAgen(response.data || []));
  } catch (error) {
    console.error("Error fetching agen", error);
    dispatch(setListAgen([]));
  }
};

export const getDetailAgen = (id) => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const response = await axios.get(`${API_URL}/agen/get-by-id/${id}`, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });
    dispatch(setDetailAgen(response.data));
  } catch (error) {
    console.error("Error fetching detail agen", error);
  }
};

export const createAgen =
  ({ username, phoneNumber, email, password, address, targetAmount }) =>
  async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const response = await axios.post(
        `${API_URL}/agen/create`,
        {
          username,
          phoneNumber,
          email,
          password,
          address,
          targetAmount: targetAmount ?? 0,
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );

      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Proses membuat agen berhasil",
          icon: "success",
        });
        dispatch(setModalCreateAgen(false));
        dispatch(getAllAgen());
      }
    } catch (error) {
      Swal.fire({
        title: "Proses membuat agen gagal",
        text: error.response?.data?.message || "Terjadi kesalahan.",
        icon: "error",
      });
    }
  };

export const editAgen =
  (id, { username, phoneNumber, email, password, address, targetAmount }) =>
  async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const payload = {
        username,
        phoneNumber,
        email,
        address,
        targetAmount: targetAmount ?? 0,
        ...(password && { password }),
      };
      const response = await axios.put(
        `${API_URL}/agen/edit/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );

      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Proses edit agen berhasil",
          icon: "success",
        });
        dispatch(setModalEditAgen(false));
        dispatch(setDetailAgen(null));
        dispatch(getAllAgen());
      }
    } catch (error) {
      Swal.fire({
        title: "Proses edit agen gagal",
        text: error.response?.data?.message || "Terjadi kesalahan.",
        icon: "error",
      });
    }
  };

export const deleteAgen = (id) => async (dispatch, getState) => {
  try {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus agen ini?",
      text: "Data agen akan dihapus permanent.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const { tokenAdmin } = getState().auth;
      const response = await axios.delete(`${API_URL}/agen/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
        },
      });

      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Agen berhasil dihapus",
          icon: "success",
        });
        dispatch(getAllAgen());
      }
    }
  } catch (error) {
    Swal.fire({
      title: "Proses menghapus agen gagal",
      text: error.response?.data?.message || "Terjadi kesalahan saat menghapus",
      icon: "error",
    });
  }
};
