import api from "./axiosConfig";

export const getUsers = () =>
  api.get("/admin/users");

export const updateUser = (id, data) =>
  api.patch(`/admin/users/${id}`, data);

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

export const getLaboratories = () =>
  api.get("/admin/laboratories");

export const updateLaboratory = (id, data) =>
  api.patch(`/admin/laboratories/${id}`, data);

export const deleteLaboratory = (id) =>
  api.delete(`/admin/laboratories/${id}`);