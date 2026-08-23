import apiClient from "../../../api/apiClient";

export const getUsers = async () => {
  const response = await apiClient.get("/users");
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

export const getUsersBySection = async (sectionId) => {
  const response = await apiClient.get(`/users/section/${sectionId}`);
  return response.data;
};

export const getOaByCompagnie = async (compagnieId) => {
  const response = await apiClient.get(`/users/compagnie/${compagnieId}/oa`);
  return response.data;
};

export const getSoaBySection = async (sectionId) => {
  const response = await apiClient.get(`/users/section/${sectionId}/soa`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await apiClient.post("/users", userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await apiClient.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/users/${userId}`);
  return response.data;
};
