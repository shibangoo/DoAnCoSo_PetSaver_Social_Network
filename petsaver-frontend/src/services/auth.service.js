import API from "./api";

// đăng nhập
export const login = (data) => API.post("/auth/login", data);

// đăng ký
export const register = (data) => API.post("/auth/register", data);

// lấy user hiện tại
export const getMe = () => API.get("/auth/me");