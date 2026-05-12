import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: false, // không dùng cookie
});

/* ================= REQUEST INTERCEPTOR ================= */
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR ================= */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔥 Nếu token hết hạn hoặc sai → logout luôn
    if (error.response?.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ");

      // xoá dữ liệu
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // redirect về login
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default API;