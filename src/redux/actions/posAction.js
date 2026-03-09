import axios from "axios";
import Swal from "sweetalert2";

export const API_URL = import.meta.env.VITE_API_URL;

/**
 * Download template Excel untuk import donatur POS
 */
export const downloadTemplatePos = () => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const response = await axios.get(`${API_URL}/pos/download-template`, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
      responseType: "blob",
    });
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_import_donatur_pos.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Template berhasil diunduh",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error downloading template", error);
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: error?.response?.data?.message || "Gagal mengunduh template",
    });
  }
};

/**
 * GET history transaksi by agent (query: agentId, startDate, endDate, category, eventId, paymentMethod, page)
 */
export const getHistoryByAgent =
  (params = {}) =>
  async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const {
        agentId,
        startDate,
        endDate,
        category,
        eventId,
        paymentMethod,
        page = 0,
      } = params;
      const query = new URLSearchParams();
      if (agentId != null && agentId !== "") query.append("agenId", agentId);
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);
      if (category) query.append("category", category);
      if (eventId != null && eventId !== "") query.append("eventId", eventId);
      if (paymentMethod) query.append("paymentMethod", paymentMethod);
      query.append("page", page);
      const response = await axios.get(
        `${API_URL}/pos/history-by-agent?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching history by agent", error);
      throw error;
    }
  };

/**
 * GET history recap admin (rekap transaksi agen) - query: agenId, startDate, endDate, category, eventId, paymentMethod, page
 * Returns array of transaction objects
 */
export const getHistoryRecapAdmin =
  (params = {}) =>
  async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const {
        agenId,
        startDate,
        endDate,
        category,
        eventId,
        paymentMethod,
        page,
      } = params;
      const query = new URLSearchParams();
      if (agenId != null && agenId !== "") query.append("agenId", agenId);
      if (startDate) query.append("startDate", startDate);
      if (endDate) query.append("endDate", endDate);
      if (category) query.append("category", category);
      if (eventId != null && eventId !== "") query.append("eventId", eventId);
      if (paymentMethod) query.append("paymentMethod", paymentMethod);
      if (page != null && page !== "") query.append("page", page);
      const response = await axios.get(
        `${API_URL}/pos/history-recap-admin?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching history recap admin", error);
      throw error;
    }
  };

/**
 * Import Excel donatur POS (form-data, key: file)
 */
export const importExcelDonatur = (file) => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(
      `${API_URL}/pos/import-excel`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text:
        response?.data?.message ||
        "Import donatur berhasil diproses",
      timer: 3000,
      showConfirmButton: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error importing excel", error);
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Gagal mengimpor file. Pastikan format Excel sesuai template.";
    Swal.fire({
      icon: "error",
      title: "Gagal Import",
      text: msg,
    });
    throw error;
  }
};
