import api from "./axiosConfig";

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginAdmin = (data) =>
  api.post("/auth/login-admin", data);

export const registerAdmin = (data) =>
  api.post("/auth/register-admin", data);

export const logout = () =>
  api.post("/auth/logout");