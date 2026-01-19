import api from "./axiosConfig";

export const createLaboratory = (data) =>
  api.post("/auth/laboratory", data);