import axios from "axios";
import {
  setAllCampaign,
  setAllCampaignCategory,
  setAllCampaignEmergency,
  setAmilCampaign,
  setCampaignBySearch,
  setDetailCampaign,
  setModalCreateActive,
  setModalEditActive,
  // setDonatur,
  setTotalPageNumberMessage,
} from "../reducers/campaignReducer";
import {
  setTotalPNActiveCampaign,
  setTotalPNAmilCampaign,
} from "../reducers/pageNumberReducer";
import Swal from "sweetalert2";
export const API_URL = import.meta.env.VITE_API_URL;

export const getActiveAproveCampaign = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/campaign/get-active-and-approved-campaign?page=${pageNumber}`
    );
    const data = response.data;
    dispatch(setAllCampaign(data.content));
    dispatch(setTotalPNActiveCampaign(data.totalPages));
  } catch (error) {
    console.error("Error fetching campaign data:", error);
  }
};
export const getAllCampaign = () => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/campaign`);
    const data = response.data;
    dispatch(setAllCampaign(data.content));
    dispatch(setTotalPNActiveCampaign(data.totalPages));
  } catch (error) {
    console.error("Error fetching campaign data:", error);
  }
};
export const getSearchCampaign = (name) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/campaign/campaign-name?campaignName=${name}`
    );
    const data = response.data;
    dispatch(setCampaignBySearch(data.content));
    dispatch(setTotalPNActiveCampaign(data.totalPages));
  } catch (error) {
    console.error("Error fetching campaign data:", error);
  }
};
export const getCampaignByCategory =
  (category, pageNumber) => async (dispatch) => {
    try {
      const response = await axios.get(
        `${API_URL}/campaign/category?campaignCategory=${category}&page=${pageNumber}`
      );
      const data = response.data;
      dispatch(setAllCampaign(data.content));
      dispatch(setTotalPNActiveCampaign(data.totalPages));
    } catch (error) {
      console.error("Error fetching campaignbycategory data:", error);
    }
  };
export const getAllCampaignEmergency = () => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/campaign/emergency`);
    const data = response.data;
    dispatch(setAllCampaignEmergency(data.content));
  } catch (error) {
    console.error("Error fetching campaign Emergency data:", error);
  }
};
export const getDetailCampaign = (id) => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/campaign/${id}`);
    const data = response.data;
    dispatch(setDetailCampaign(data));
  } catch (error) {
    console.error("Error fetching detail campaign", error);
  }
};
export const getAllCampaignCategory = () => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/campaignCategory`);
    const data = response.data;
    dispatch(setAllCampaignCategory(data));
  } catch (error) {
    console.error("Error fetching all campaign category", error);
  }
};
export const getTransactionCampaign = (id, page) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/transaction/campaign/${id}?page=${page}`
    );
    const data = response.data;
    // dispatch(setDonatur(data.content));
    dispatch(setTotalPageNumberMessage(data.totalPages));
  } catch (error) {
    console.error("Error fetching message data:", error);
  }
};
export const getAmilCampaign = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/amil/campaign?page=${pageNumber}`
    );
    const data = response.data;
    dispatch(setAmilCampaign(data.content));
    dispatch(setTotalPNAmilCampaign(data.totalPages));
  } catch (error) {
    console.error("Error fetching amil campaign", error);
  }
};

export const createCampaign =
  (
    category,
    name,
    code,
    image,
    desk,
    location,
    target,
    start,
    end,
    active,
    emergency
  ) =>
  async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const formData = new FormData();
      formData.append("categoryId", category);
      formData.append("campaignName", name);
      formData.append("campaignCode", code);
      {
        image != null && formData.append("campaignImage", image);
      }
      formData.append("description", desk);
      formData.append("location", location);
      formData.append("targetAmount", target);
      formData.append("startDate", start);
      formData.append("endDate", end);
      formData.append("active", active);
      formData.append("emergency", emergency);
      const response = await axios.post(
        `${API_URL}/campaign/create`,
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
          text: "Proses membuat campaign berhasil",
          icon: "success",
        });
        dispatch(setModalCreateActive(false));
      }
    } catch (error) {
      Swal.fire({
        title: "Proses membuat campaign gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };
export const editCampaign =
  (
    category,
    name,
    code,
    image,
    desk,
    location,
    target,
    start,
    end,
    active,
    emergency,
    id
  ) =>
  async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const formData = new FormData();
      formData.append("categoryId", category);
      formData.append("campaignName", name);
      formData.append("campaignCode", code);
      {
        image != null && formData.append("campaignImage", image);
      }
      formData.append("description", desk);
      formData.append("location", location);
      formData.append("targetAmount", target);
      formData.append("startDate", start);
      formData.append("endDate", end);
      formData.append("active", active);
      formData.append("emergency", emergency);
      const response = await axios.put(
        `${API_URL}/campaign/edit/${id}`,
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
          text: "Proses edit campaign berhasil",
          icon: "success",
        });
        dispatch(setModalEditActive(false));
      }
    } catch (error) {
      Swal.fire({
        title: "Proses edit campaign gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };
export const tutupCampaignActive = (id) => async (dispatch, getState) => {
  try {
    const result = await Swal.fire({
      title: "Yakin ingin menutup campaign?",
      text: "Campaign ini akan dinonaktifkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yakin Tutup",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const { tokenAdmin } = getState().auth;

      const response = await axios.put(`${API_URL}/campaign/close/${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${tokenAdmin}`,
        },
      });

      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Campaign berhasil ditutup",
          icon: "success",
        });
      }
    }
  } catch (error) {
    Swal.fire({
      title: "Proses tutup campaign gagal",
      text:
        error.response?.data?.message ||
        "Terjadi kesalahan saat menutup campaign",
      icon: "error",
    });
  }
};
