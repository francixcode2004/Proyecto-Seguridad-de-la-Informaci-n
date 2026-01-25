import api from "./axiosConfig";

export const createLaboratory = (data) =>
  api.post("/auth/laboratory", data);

export const fetchLaboratoryReservations = () =>
  api.get("/auth/laboratory/reservations");