import axios from "axios";
import {
  setCoaCategory,
  setDetailZiswaf,
  setDskl,
  setInfak,
  setModalCreateZiswaf,
  setModalEditZiswaf,
  setWakaf,
  setZakat,
} from "../reducers/ziswafReducer";
import Swal from "sweetalert2";
export const API_URL = import.meta.env.VITE_API_URL;

export const getCategoryZiswaf = (type) => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/${type}`);
    const data = response.data;
    if (type == "zakat") {
      dispatch(setZakat(data));
    } else if (type == "wakaf") {
      dispatch(setWakaf(data));
    } else if (type == "infak") {
      dispatch(setInfak(data));
    } else {
      dispatch(setDskl(data));
    }
  } catch (error) {
    console.error("Error fetching all yiswaf category", error);
  }
};
export const getCategoryCoa = () => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/coa`);
    const data = response.data;
    dispatch(setCoaCategory(data));
  } catch (error) {
    console.error("Error fetching coa category", error);
  }
};
export const getDetailZiswaf = (type, id) => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/${type}/${id}`);
    const data = response.data;
    dispatch(setDetailZiswaf(data));
  } catch (error) {
    console.error("Error fetching detail Ziswaf", error);
  }
};
export const deleteZiswaf = (type, id) => async (dispatch, getState) => {
  try {
    const result = await Swal.fire({
      title: `Yakin ingin menghapus ${type} ini?`,
      text: `${type} ini akan dihapus permanent.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yakin Tutup",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const { tokenAdmin } = getState().auth;
      const response = await axios.delete(`${API_URL}/${type}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
        },
      });

      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: `${type} berhasil ditutup`,
          icon: "success",
        });
      }
    }
  } catch (error) {
    Swal.fire({
      title: `Proses menghapus ${type} gagal`,
      text: error.response?.data?.message || "Terjadi kesalahan saat menghapus",
      icon: "error",
    });
  }
};

export const createZiswaf =
  (type, category, coa) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const response = await axios.post(
        `${API_URL}/${type}/create`,
        {
          categoryName: category,
          amount: "0",
          distribution: "0",
          emergency: false,
          coa: {
            id: coa,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );

      if (response) {
        Swal.fire({
          title: `Berhasil`,
          text: `Proses membuat ${type} berhasil`,
          icon: "success",
        });
        dispatch(setModalCreateZiswaf(false));
      }
    } catch (error) {
      Swal.fire({
        title: `Proses membuat ${type} gagal`,
        text: error.response?.data?.message || "Terjadi kesalahan.",
        icon: "error",
      });
    }
  };
export const editZiswaf =
  (type, category, coa, amount, distribution, id) =>
  async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const response = await axios.put(
        `${API_URL}/${type}/update/${id}`,
        {
          categoryName: category,
          amount: amount,
          distribution: distribution,
          emergency: false,
          coa: {
            id: coa,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );

      if (response) {
        Swal.fire({
          title: `Berhasil`,
          text: `Proses edit ${type} berhasil`,
          icon: "success",
        });
        dispatch(setModalEditZiswaf(false));
      }
    } catch (error) {
      Swal.fire({
        title: `Proses edit ${type} gagal`,
        text: error.response?.data?.message || "Terjadi kesalahan.",
        icon: "error",
      });
    }
  };
