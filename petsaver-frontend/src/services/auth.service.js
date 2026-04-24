import API from "./api";

// login
export const login = (data) =>
  API.post("/auth/login", data);

// register
export const register = (data) =>
  API.post("/auth/register", data);

// reset password
export const resetPassword = (data) =>
  API.put("/auth/reset-password", data);

