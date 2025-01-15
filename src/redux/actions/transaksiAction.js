import axios from "axios";
import toast from "react-hot-toast";
import {
  setBukuBesar,
  setCreateDokumentasi,
  setDistribution,
  setJurnal,
  setLaporanAktivitas,
  setNeracaSaldo,
  setPersentase,
  setPosisiKeuangan,
  setSummaryDashboard,
  setTransaction,
  setTransactionUser,
} from "../reducers/transaction&summaryReducer";
import { setTotalPN, setTotalPNTransaksi } from "../reducers/pageNumberReducer";
import Swal from "sweetalert2";

export const API_URL = import.meta.env.VITE_API_URL;

export const transaksi =
  (
    name,
    phoneNumber,
    email,
    transactionAmount,
    message,
    campaignId,
    navigate
  ) =>
  async () => {
    try {
      const response = await axios.post(
        `${API_URL}/transaction/campaign/${campaignId}`,
        {
          username: name,
          phoneNumber: phoneNumber,
          email: email,
          transactionAmount: transactionAmount,
          message: message,
        }
      );
      if (response) {
        toast.success("Proses transaksi berhasil");
        navigate(`/detailCampaign/${campaignId}`);
      }
    } catch (error) {
      console.error("Error fetching campaign data:", error);
    }
  };
export const getTransactionUser = () => async (dispatch, getState) => {
  const { token } = getState().auth;
  try {
    const response = await axios.get(`${API_URL}/transaction/donaturHistory`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data;
    dispatch(setTransactionUser(data));
  } catch (error) {
    return;
  }
};
export const getSummaryDashboard = () => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/summary`, {});
    const data = response.data;
    dispatch(setSummaryDashboard(data));
  } catch (error) {
    return;
  }
};
export const getSummaryDashboardOperator = () => async (dispatch, getState) => {
  try {
    const { tokenAdmin } = getState().auth;
    const response = await axios.get(`${API_URL}/summary-operator`, {
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
      },
    });
    const data = response.data;
    dispatch(setSummaryDashboard(data));
  } catch (error) {
    return;
  }
};
export const getJurnal = (startDate, endDate) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/journal?startDate=${startDate}&endDate=${endDate}`
    );
    const data = response.data;
    dispatch(setJurnal(data));
  } catch (error) {
    dispatch(setJurnal([]));
  }
};
export const getPosisiKeuangan = (m1, m2, y1, y2) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/journal/neraca-report?month1=${m1}&year1=${y1}&month2=${m2}&year2=${y2}`
    );
    const data = response.data;
    dispatch(setPosisiKeuangan(data));
  } catch (error) {
    return;
  }
};
export const getLaporanAktivitas =
  (m1, m2, y1, y2, type) => async (dispatch) => {
    try {

      const response = await axios.get(
        `${API_URL}/journal/${type}-activity-report?month1=${m1}&year1=${y1}&month2=${m2}&year2=${y2}`
      );
      const data = response.data;
      dispatch(setLaporanAktivitas(data));

    } catch (error) {
      console.log(error);
    }
  };
export const getNeracaSaldo = (m1, y1) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/journal/neraca-saldo-report?month1=${m1}&year1=${y1}`
    );
    const data = response.data;
    dispatch(setNeracaSaldo(data));
  } catch (error) {
    dispatch(setNeracaSaldo([]));
  }
};
export const getBukuBesar =
  (coaId, coaId2, startDate, endDate) => async (dispatch) => {
    try {
      const response = await axios.get(
        `${API_URL}/buku-besar?coaId1=${coaId}&coaId2=${coaId2}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = response.data;
      dispatch(setBukuBesar(data));
    } catch (error) {
      return;
    }
  };
export const getTransaction = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/transaction?page=${pageNumber}`
    );
    const data = response.data;
    dispatch(setTransaction(data.content));
    dispatch(setTotalPNTransaksi(data.totalPages));
  } catch (error) {
    return;
  }
};
export const getPresentage = () => async (dispatch) => {
  try {
    const response = await axios.get(`${API_URL}/percentage/rincian/1`);
    const data = response.data;
    dispatch(setPersentase(data));
  } catch (error) {
    return;
  }
};
export const getEditPresentage = (number) => async (dispatch) => {
  try {
    await axios.put(`${API_URL}/percentage/edit/1`, {
      percentage: number,
    });
    Swal.fire({
      title: "Berhasil",
      text: "Proses membuat saldo awal berhasil",
      icon: "success",
    });
  } catch (error) {
    Swal.fire({
      title: "Gagal",
      text: "terjadi kesalahan",
      icon: "error",
    });
  }
};
export const getDistribution = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/distribution?page=${pageNumber}`
    );
    const data = response.data;
    dispatch(setDistribution(data.content));
    dispatch(setTotalPN(data.totalPages));
  } catch (error) {
    return;
  }
};

export const createDistribusiDokumentasi =
  (image, description, receiver, amount, date, type, id) =>
  async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;
      const formData = new FormData();
      {
        image != null && formData.append("campaignImage", image);
      }
      formData.append("description", description);
      formData.append("receiver", receiver);
      formData.append("distributionAmount", amount);
      formData.append("distributionDate", date);
      const response = await axios.post(
        `${API_URL}/distribution/${type}/${id}`,
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
          text: "Proses membuat dokumentasi berhasil",
          icon: "success",
        });
        dispatch(setCreateDokumentasi(false));
      }
    } catch (error) {
      Swal.fire({
        title: "Proses membuat dokumentasi gagal",
        text: error.response.data.message,
        icon: "error",
      });
    }
  };
export const createJurnalUmum =
  (date, keterangan, jenis, kategori, rows) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;

      // Validasi data sebelum mengirim request
      if (!date || !keterangan || !jenis || !kategori || rows.length === 0) {
        Swal.fire({
          title: "Proses gagal",
          text: "Pastikan semua data telah diisi dengan benar.",
          icon: "error",
        });
        return;
      }

      // Format data debit dan kredit
      const debitDetails = rows
        .filter((row) => row.debet > 0)
        .map((row) => ({
          coaId: row.rekening,
          amount: row.debet,
        }));

      const kreditDetails = rows
        .filter((row) => row.kredit > 0)
        .map((row) => ({
          coaId: row.rekening,
          amount: row.kredit,
        }));

      // Validasi debit dan kredit
      if (debitDetails.length === 0 || kreditDetails.length === 0) {
        Swal.fire({
          title: "Proses gagal",
          text: "Pastikan ada data debit dan kredit yang valid.",
          icon: "error",
        });
        return;
      }

      // Kirim permintaan API
      await axios.post(
        `${API_URL}/transaction/jurnal-umum`,
        {
          transactionDate: date,
          description: keterangan,
          categoryType: jenis,
          categoryId: kategori,
          debitDetails,
          kreditDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );

      // Jika berhasil
      Swal.fire({
        title: "Berhasil",
        text: "Proses membuat jurnal umum berhasil",
        icon: "success",
      });
    } catch (error) {
      // Tangani error
      Swal.fire({
        title: "Proses gagal",
        text:
          error?.response?.data?.message ||
          "Terjadi kesalahan. Coba lagi nanti.",
        icon: "error",
      });
    }
  };
export const createLaporanPenyaluran =
  (date, keterangan, jenis, kategori, rows) => async (dispatch, getState) => {
    try {
      const { tokenAdmin } = getState().auth;

      // Validasi data sebelum mengirim request
      if (!date || !keterangan || !jenis || !kategori || rows.length === 0) {
        Swal.fire({
          title: "Proses gagal",
          text: "Pastikan semua data telah diisi dengan benar.",
          icon: "error",
        });
        return;
      }

      // Format data debit dan kredit
      const debitDetails = rows
        .filter((row) => row.debet > 0)
        .map((row) => ({
          coaId: row.rekening,
          amount: row.debet,
        }));

      const kreditDetails = rows
        .filter((row) => row.kredit > 0)
        .map((row) => ({
          coaId: row.rekening,
          amount: row.kredit,
        }));

      // Validasi debit dan kredit
      if (debitDetails.length === 0 || kreditDetails.length === 0) {
        Swal.fire({
          title: "Proses gagal",
          text: "Pastikan ada data debit dan kredit yang valid.",
          icon: "error",
        });
        return;
      }

      // Kirim permintaan API
      await axios.post(
        `${API_URL}/transaction/jurnal-umum`,
        {
          transactionDate: date,
          description: keterangan,
          categoryType: jenis,
          categoryId: kategori,
          penyaluran: true,
          debitDetails,
          kreditDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${tokenAdmin}`,
          },
        }
      );

      // Jika berhasil
      Swal.fire({
        title: "Proses membuat laporan penyaluran berhasil",
        text: "Pastikan membuat dokumentasi penyaluran",
        icon: "success",
      });
    } catch (error) {
      // Tangani error
      Swal.fire({
        title: "Proses gagal",
        text:
          error?.response?.data?.message ||
          "Terjadi kesalahan. Coba lagi nanti.",
        icon: "error",
      });
    }
  };

export const getSearchTransaksi = (name, page) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/transaction/search?search=${name}&page=${page}`
    );
    const data = response.data;
    dispatch(setTransaction(data.content));
    dispatch(setTotalPNTransaksi(data.totalPages));
  } catch (error) {
    return;
  }
};
export const createSaldoAwal = (input) => async (dispatch) => {
  try {
    const hasil = input.map((item) => ({
      coaId: item.id,
      debit: item.debet,
      kredit: item.kredit,
    }));
    const response = await axios.post(`${API_URL}/saldo-awal/input`, hasil);
    if (response) {
      Swal.fire({
        title: "Berhasil",
        text: "Proses membuat saldo awal berhasil",
        icon: "success",
      });
    }
  } catch (error) {
    Swal.fire({
      title: "Gagal",
      text: error?.response?.data?.message || "Proses membuat saldo awal gagal",
      icon: "error",
    });
  }
};
