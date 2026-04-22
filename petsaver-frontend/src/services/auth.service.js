import API from "./api";

// LOGIN
export const login = (data) => API.post("/auth/login", data);

// REGISTER
export const register = (data) => API.post("/auth/register", data);

// FORGOT PASSWORD
export const forgotPassword = (email) =>
  API.post("/auth/forgot-password", { email });