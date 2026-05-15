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

// get current user profile
export const getMe = () =>
  API.get("/auth/me");

// update profile
export const updateProfile = (data) =>
  API.put("/auth/update-profile", data);

export const getSuggestions = () =>
  API.get("/auth/suggestions");

export const getUserProfile = (id) =>
  API.get(`/auth/profile/${id}`);

