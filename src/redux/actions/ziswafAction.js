import axios from "axios";
import {
  setAllCoaCategory,
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
import {
  setDetailCoa,
  setModalCreateCoa,
  setModalEditCoa,
} from "../reducers/transaction&summaryReducer";
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
export const getAllCategoryCoa = (list) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/coa${list && `/list?accountType=${list}`}`
    );
    const data = response.data;
    dispatch(setAllCoaCategory(data));
  } catch (error) {
    console.error("Error fetching coa category", error);
  }
};
export const getDetailCoa = (id) => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/coa/${id}`);
    const data = response.data;
    dispatch(setDetailCoa(data));
  } catch (error) {
    console.error("Error fetching coa category", error);
  }
};
export const createCategoryCoa =
  (code, name, type, idParent) => async (dispatch) => {
    try {
      // Validasi input
      if (!code || !name || !type) {
        Swal.fire({
          title: "Data Tidak Lengkap",
          text: "Pastikan semua data terisi dengan benar.",
          icon: "warning",
        });
        return;
      }

      // Buat payload untuk permintaan API
      const payload = {
        accountCode: code,
        accountName: name,
        accountType: type,
        ...(idParent && { parentAccount: { id: idParent } }),
      };

      // Kirim permintaan ke API
      const response = await axios.post(`${API_URL}/coa/create`, payload);

      // Tampilkan pesan sukses jika berhasil
      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Proses membuat COA berhasil.",
          icon: "success",
        });
        dispatch(setModalCreateCoa(false)); // Tutup modal
      }
    } catch (error) {
      // Tangani kesalahan
      Swal.fire({
        title: "Proses membuat COA gagal",
        text: error.response?.data?.message || "Terjadi kesalahan.",
        icon: "error",
      });
    }
  };
export const editCategoryCoa =
  (code, name, type, idParent, id) => async (dispatch) => {
    try {
      // Validasi input
      if (!code || !name || !type) {
        Swal.fire({
          title: "Data Tidak Lengkap",
          text: "Pastikan semua data terisi dengan benar.",
          icon: "warning",
        });
        return;
      }

      // Buat payload untuk permintaan API
      const payload = {
        accountCode: code,
        accountName: name,
        accountType: type,
        ...(idParent && { parentAccount: { id: idParent } }),
      };

      // Kirim permintaan ke API
      const response = await axios.put(`${API_URL}/coa/edit/${id}`, payload);

      // Tampilkan pesan sukses jika berhasil
      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Proses mengedit COA berhasil.",
          icon: "success",
        });
        dispatch(setModalEditCoa(false)); // Tutup modal
      }
    } catch (error) {
      // Tangani kesalahan
      Swal.fire({
        title: "Proses mengedit COA gagal",
        text: error.response?.data?.message || "Terjadi kesalahan.",
        icon: "error",
      });
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
export const deleteCoa = (id) => async (dispatch) => {
  try {
    const result = await Swal.fire({
      title: `Yakin ingin menghapus coa ini?`,
      text: `coa ini akan dihapus permanent.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yakin Tutup",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      // const { tokenAdmin } = getState().auth;
      const response = await axios.delete(
        `${API_URL}/coa/delete/${id}`
        //   ,
        //   {
        //   headers: {
        //     Authorization: `Bearer ${tokenAdmin}`,
        //   },
        // }
      );

      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: `Coa berhasil dihapus`,
          icon: "success",
        });
      }
    }
  } catch (error) {
    Swal.fire({
      title: `Proses menghapus coa gagal`,
      text: error.response?.data?.message || "Terjadi kesalahan saat menghapus",
      icon: "error",
    });
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

export const createZiswaf = (type, category) => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const response = await axios.post(
      `${API_URL}/${type}/create`,
      {
        categoryName: category,
        amount: "0",
        distribution: "0",
        emergency: false,
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
  (type, category, amount, distribution, id) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const response = await axios.put(
        `${API_URL}/${type}/update/${id}`,
        {
          categoryName: category,
          amount: amount,
          distribution: distribution,
          emergency: false,
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
