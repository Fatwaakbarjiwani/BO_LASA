import axios from "axios";
import {
  setAllCampaign,
  setAllCampaignCategory,
  setAllCampaignEmergency,
  setAmilCampaign,
  setCampaignHistory,
  setCampaignPending,
  setChart1,
  setChart2,
  setDetailCampaign,
  setModalCreateActive,
  setModalCreateCategory,
  setModalEditActive,
  setModalEditCategory,
  // setDonatur,
  setTotalPageNumberMessage,
} from "../reducers/campaignReducer";
import {
  setTotalPN1,
  setTotalPN2,
  setTotalPN3,
  setTotalPNActiveCampaign,
  setTotalPNAmilCampaign,
} from "../reducers/pageNumberReducer";
import Swal from "sweetalert2";
import {
  setAmilDskl,
  setAmilInfak,
  setAmilWakaf,
  setAmilZakat,
} from "../reducers/ziswafReducer";
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

export const getCampaignPending = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/campaign/pending?page=${pageNumber}`
    );
    const data = response.data;
    dispatch(setCampaignPending(data.content));
    dispatch(setTotalPN2(data.totalPages));
  } catch (error) {
    console.error("Error fetching campaign data:", error);
  }
};
// operator
export const getCampaignOperator =
  (pageNumber) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const response = await axios.get(
        `${API_URL}/campaign/get-by-operator/active-approve?page${pageNumber}`,
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      const data = response.data;
      dispatch(setAllCampaign(data.content));
      dispatch(setTotalPN1(data.totalPages));
    } catch (error) {
      console.error("Error fetching campaign data:", error);
    }
  };
export const getCampaignPendingOperator =
  (pageNumber) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const response = await axios.get(
        `${API_URL}/campaign/get-by-operator/pending?page=${pageNumber}`,
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      const data = response.data;
      dispatch(setCampaignPending(data.content));
      dispatch(setTotalPN2(data.totalPages));
    } catch (error) {
      console.error("Error fetching campaign data:", error);
    }
  };
export const getCampaignHistory =
  (pageNumber) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const response = await axios.get(
        `${API_URL}/campaign/get-by-operator/history?page=${pageNumber}`,
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      const data = response.data;
      dispatch(setCampaignHistory(data.content));
      dispatch(setTotalPN3(data.totalPages));
    } catch (error) {
      console.error("Error fetching campaign history data:", error);
    }
  };
export const getCampaignHistoryAdmin = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/campaign/history?page=${pageNumber}`
    );
    const data = response.data;
    dispatch(setCampaignHistory(data.content));
    dispatch(setTotalPN3(data.totalPages));
  } catch (error) {
    console.error("Error fetching campaign historyadmin data:", error);
  }
};
export const deleteCampaign = (id) => async (dispatch) => {
  try {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus campaign?",
      text: "Campaign ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yakin Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const response = await axios.delete(`${API_URL}/campaign/delete/${id}`);
      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Campaign berhasil dihapus",
          icon: "success",
        });
      }
    }
  } catch (error) {
    console.error("Error fetching campaign data:", error);
  }
};
export const deleteCategoryCampaign = (id) => async (dispatch) => {
  try {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus kategori campaign ini?",
      text: "Kategori campaign ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yakin Hapus",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const response = await axios.delete(
        `${API_URL}/campaignCategory/delete/${id}`
      );
      if (response) {
        Swal.fire({
          title: "Berhasil",
          text: "Kategori campaign berhasil dihapus",
          icon: "success",
        });
      }
    }
  } catch (error) {
    Swal.fire({
      title: "Proses menghapus kategori campaign gagal",
      text: error.response.data.message,
      icon: "error",
    });
  }
};

// ==================================================================
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
export const getSearchCampaign = (name, page) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/campaign/campaign-name?campaignName=${name}&page=${page}`
    );
    const data = response.data;
    dispatch(setAllCampaign(data.content));
    dispatch(setTotalPNActiveCampaign(data.totalPages));
  } catch (error) {
    return;
  }
};
export const getSearchCampaignPending = (name, page) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/campaign/campaign-name-pending?campaignName=${name}&page=${page}`
    );
    const data = response.data;
    dispatch(setCampaignPending(data.content));
    dispatch(setTotalPN2(data.totalPages));
  } catch (error) {
    return;
  }
};
export const getSearchCampaignNonaktif = (name, page) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/campaign/campaign-name-nonaktif?campaignName=${name}&page=${page}`
    );
    const data = response.data;
    dispatch(setCampaignHistory(data.content));
    dispatch(setTotalPN3(data.totalPages));
  } catch (error) {
    return;
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
export const getApproveCampaign = (id) => async (dispatch, getState) => {
  try {
    const result = await Swal.fire({
      title: "Yakin ingin menyutujui campaign ini?",
      text: "Campaign ini akan disetujui.",
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
        `${API_URL}/campaign/approve-campaign/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      if (response) {
        Swal.fire({
          title: `Berhasil disetujui`,
          text: "Proses menyetujui campaign berhasil",
          icon: "success",
        });
        dispatch(setModalEditActive(false));
      }
    }
  } catch (error) {
    Swal.fire({
      title: "Proses menyetujui campaign gagal",
      text: error.response.data.message,
      icon: "error",
    });
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
export const getChart1 = () => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/income-campaign-ziswaf`);
    const data = response.data;
    dispatch(setChart1(data));
  } catch (error) {
    console.error("Error fetching all chart1", error);
  }
};
export const getChart2 = () => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/campaign-current-and-target-amount`
    );
    const data = response.data;
    dispatch(setChart2(data));
  } catch (error) {
    console.error("Error fetching all chart2", error);
  }
};
export const createCampaignCategory =
  (campaignCategory) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const response = await axios.post(
        `${API_URL}/campaignCategory/create`,
        { campaignCategory: campaignCategory },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      if (response) {
        Swal.fire({
          title: `Berhasil`,
          text: "Proses membuat kategori campaign berhasil",
          icon: "success",
        });
        dispatch(setModalCreateCategory(false));
      }
    } catch (error) {
      Swal.fire({
        title: "Proses membuat kategori campaign gagal",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan saat membuat kategori campaign",
        icon: "error",
      });
    }
  };
export const editCampaignCategory =
  (campaignCategory, id) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const response = await axios.put(
        `${API_URL}/campaignCategory/update/${id}`,
        { campaignCategory: campaignCategory },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      if (response) {
        Swal.fire({
          title: `Berhasil`,
          text: "Proses mengedit kategori campaign berhasil",
          icon: "success",
        });
        dispatch(setModalEditCategory(false));
      }
    } catch (error) {
      Swal.fire({
        title: "Proses mengedit kategori campaign gagal",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan saat mengedit kategori campaign",
        icon: "error",
      });
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
export const getAmilCampaign = (pageNumber, pilih) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/amil/${pilih}?page=${pageNumber}`
    );
    const data = response.data;
    if (pilih == "campaign") {
      dispatch(setAmilCampaign(data.content));
      dispatch(setTotalPNAmilCampaign(data.totalPages));
    }
    if (pilih == "zakat") {
      dispatch(setAmilZakat(data.content));
    }
    if (pilih == "infak") {
      dispatch(setAmilInfak(data.content));
    }
    if (pilih == "wakaf") {
      dispatch(setAmilWakaf(data.content));
    }
    if (pilih == "dskl") {
      dispatch(setAmilDskl(data.content));
    }
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
      const response = await axios.put(
        `${API_URL}/campaign/close/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );

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
