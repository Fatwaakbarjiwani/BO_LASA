import axios from "axios";
import {
  setListEvents,
  setDetailEvent,
  setModalCreateEvent,
  setModalEditEvent,
} from "../reducers/eventReducer";
import Swal from "sweetalert2";

export const API_URL = import.meta.env.VITE_API_URL;

export const getAllEvents = () => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const response = await axios.get(`${API_URL}/events/get-all`, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });
    dispatch(setListEvents(response.data || []));
  } catch (error) {
    console.error("Error fetching events", error);
    dispatch(setListEvents([]));
  }
};

export const getDetailEvent = (id) => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const response = await axios.get(`${API_URL}/events/get-by-id/${id}`, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });
    dispatch(setDetailEvent(response.data));
  } catch (error) {
    console.error("Error fetching detail event", error);
  }
};

export const createEvent = ({ name, location }) => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const response = await axios.post(
      `${API_URL}/events/create`,
      { name, location },
      {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
        },
      }
    );

    if (response) {
      Swal.fire({
        title: "Berhasil",
        text: "Proses membuat event berhasil",
        icon: "success",
      });
      dispatch(setModalCreateEvent(false));
      dispatch(getAllEvents());
    }
  } catch (error) {
    Swal.fire({
      title: "Proses membuat event gagal",
      text: error.response?.data?.message || "Terjadi kesalahan.",
      icon: "error",
    });
  }
};

export const editEvent =
  (id, { name, location }) =>
  async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const response = await axios.put(
        `${API_URL}/events/edit/${id}`,
        { name, location },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );

      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Proses edit event berhasil",
          icon: "success",
        });
        dispatch(setModalEditEvent(false));
        dispatch(setDetailEvent(null));
        dispatch(getAllEvents());
      }
    } catch (error) {
      Swal.fire({
        title: "Proses edit event gagal",
        text: error.response?.data?.message || "Terjadi kesalahan.",
        icon: "error",
      });
    }
  };

export const deleteEvent = (id) => async (dispatch, getState) => {
  try {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus event ini?",
      text: "Data event akan dihapus permanent.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const { tokenAdmin } = getState().auth;
      const response = await axios.delete(`${API_URL}/events/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
        },
      });

      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Event berhasil dihapus",
          icon: "success",
        });
        dispatch(getAllEvents());
      }
    }
  } catch (error) {
    Swal.fire({
      title: "Proses menghapus event gagal",
      text: error.response?.data?.message || "Terjadi kesalahan saat menghapus",
      icon: "error",
    });
  }
};
