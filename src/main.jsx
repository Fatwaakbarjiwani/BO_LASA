import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import "sweetalert2/dist/sweetalert2.min.css";

// Backend menolak panggilan tanpa token (deny-by-default). Sertakan token admin pada seluruh panggilan ke API,
// kecuali bila halaman sudah menentukan header Authorization sendiri (mis. token donatur).
const API_URL = import.meta.env.VITE_API_URL;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("tokenAdmin");
  const untukApi = typeof config.url === "string" && (config.url.startsWith(API_URL) || !/^https?:/i.test(config.url));
  if (token && untukApi && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Sesi admin kedaluwarsa/dicabut: kembali ke halaman login.
    if (error?.response?.status === 401 && localStorage.getItem("tokenAdmin")) {
      localStorage.removeItem("tokenAdmin");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
