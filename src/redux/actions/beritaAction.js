import axios from "axios";
import {
  setAllBerita,
  setCategoryBerita,
  setDetailBerita,
  setModalCreateBerita,
  setModalCreateTopicBerita,
  setModalEditBerita,
  setModalEditTopicBerita,
  setTopBerita,
} from "../reducers/beritaReducer";
import { setTotalPNBerita } from "../reducers/pageNumberReducer";
import Swal from "sweetalert2";

export const API_URL = import.meta.env.VITE_API_URL;

export const getAllBerita = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/news?page=${pageNumber}`);
    const data = response.data;
    dispatch(setAllBerita(data.content));
    dispatch(setTotalPNBerita(data.totalPages));
  } catch (error) {
    console.error("Error fetching news :", error);
  }
};
export const getTopBerita = () => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/news`);
    const data = response.data;
    dispatch(setTopBerita(data.content));
  } catch (error) {
    console.error("Error fetching top news :", error);
  }
};

export const getSearchBerita =
  (title, topic, pageNumber) => async (dispatch) => {
    try {
      const response = await axios.get(
        `${API_URL}/news/search?title=${title}${
          topic ? `&newsTopic=${topic}` : ""
        }&page=${pageNumber}`
      );

      const data = response.data;
      dispatch(setAllBerita(data.content));
      dispatch(setTotalPNBerita(data.totalPages));
    } catch (error) {
      console.error("Error fetching search news :", error);
    }
  };
export const getDetailBerita = (id) => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/news/${id}`);
    const data = response.data;
    dispatch(setDetailBerita(data));
  } catch (error) {
    console.error("Error fetching detaile news :", error);
  }
};
export const getCategoryBerita = () => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/newsTopic`);
    const data = response.data;
    dispatch(setCategoryBerita(data));
  } catch (error) {
    console.error("Error fetching newsCategory :", error);
  }
};
export const createNews =
  (title, image, content, topic, date) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const formData = new FormData();
      formData.append("title", title);
      {
        image !== null && formData.append("newsImage", image);
      }
      formData.append("content", content);
      formData.append("newsTopicId", topic);
      formData.append("date", date);
      const response = await axios.post(`${API_URL}/news/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${tokenAdmin}`,
        },
      });
      if (response) {
        Swal.fire({
          title: `Berhasil`,
          text: "Proses membuat berita berhasil",
          icon: "success",
        });
        dispatch(setModalCreateBerita(false));
      }
    } catch (error) {
      Swal.fire({
        title: "Proses membuat berita gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };
export const editNews =
  (title, image, content, topic, date, id) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const formData = new FormData();
      formData.append("title", title);
      {
        image !== null && formData.append("newsImage", image);
      }
      formData.append("content", content);
      formData.append("newsTopicId", topic);
      formData.append("date", date);
      const response = await axios.put(
        `${API_URL}/news/update/${id}`,
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
          text: "Proses edit berita berhasil",
          icon: "success",
        });
        dispatch(setModalEditBerita(false));
      }
    } catch (error) {
      Swal.fire({
        title: "Proses edit berita gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };
export const deleteNews = (id) => async () => {
  try {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus berita?",
      text: "Berita ini akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yakin hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const response = await axios.delete(`${API_URL}/news/delete/${id}`);

      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Berita berhasil ditutup",
          icon: "success",
        });
      }
    }
  } catch (error) {
    Swal.fire({
      title: "Proses menghapus berita gagal",
      text:
        error.response?.data?.message ||
        "Terjadi kesalahan saat menghapus berita",
      icon: "error",
    });
  }
};
export const createTopicBerita = (newsTopic) => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const response = await axios.post(
      `${API_URL}/newsTopic/create`,
      { newsTopic: newsTopic },
      {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
        },
      }
    );
    if (response) {
      Swal.fire({
        title: `Berhasil`,
        text: "Proses membuat topik berita berhasil",
        icon: "success",
      });
      dispatch(setModalCreateTopicBerita(false));
    }
  } catch (error) {
    Swal.fire({
      title: "Proses membuat topik berita gagal",
      text:
        error.response?.data?.message ||
        "Terjadi kesalahan saat membuat topik berita",
      icon: "error",
    });
  }
};
export const editTopicBerita = (newsTopic, id) => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const response = await axios.put(
      `${API_URL}/newsTopic/update/${id}`,
      { newsTopic: newsTopic },
      {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
        },
      }
    );
    if (response) {
      Swal.fire({
        title: `Berhasil`,
        text: "Proses mengedit topik berita berhasil",
        icon: "success",
      });
      dispatch(setModalEditTopicBerita(false));
    }
  } catch (error) {
    Swal.fire({
      title: "Proses mengedit topik berita gagal",
      text:
        error.response?.data?.message ||
        "Terjadi kesalahan saat mengedit topik berita",
      icon: "error",
    });
  }
};