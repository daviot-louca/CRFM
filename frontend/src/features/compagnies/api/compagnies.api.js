import apiClient from "../../../api/apiClient";

export const getCompagnies = async () => {
  const response = await apiClient.get("/compagnies");
  return response.data;
};

export const getCompagnieById = async (compagnieId) => {
  const response = await apiClient.get(`/compagnies/${compagnieId}`);
  return response.data;
};

export const createCompagnie = async (compagnieData) => {
  const response = await apiClient.post("/compagnies", compagnieData);
  return response.data;
};

export const updateCompagnie = async (compagnieId, compagnieData) => {
  const response = await apiClient.put(`/compagnies/${compagnieId}`, compagnieData);
  return response.data;
};

export const deleteCompagnie = async (compagnieId) => {
  const response = await apiClient.delete(`/compagnies/${compagnieId}`);
  return response.data;
};