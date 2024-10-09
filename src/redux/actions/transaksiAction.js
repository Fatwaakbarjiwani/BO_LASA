import axios from "axios";
import toast from "react-hot-toast";
import {
  setDistribution,
  setSummaryDashboard,
  setTransaction,
  setTransactionUser,
} from "../reducers/transaction&summaryReducer";
import { setTotalPN, setTotalPNTransaksi } from "../reducers/pageNumberReducer";

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
export const getTransaction = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/transaction?page=${pageNumber}&month=9&year=2024`
    );
    const data = response.data;
    dispatch(setTransaction(data.content));
    dispatch(setTotalPNTransaksi(data.totalPages ));
  } catch (error) {
    return;
  }
};
export const getDistribution = (pageNumber) => async (dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/distribution?page=${pageNumber}`
    );
    const data = response.data;
    dispatch(setDistribution(data.content));
    dispatch(setTotalPN(data.totalPages ));
  } catch (error) {
    return;
  }
};
