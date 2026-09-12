import apiClient from "../../../api/apiClient";

export const login = async (data) => {
  const response = await apiClient.post("/auth/login", data);

  return response.data;
};

export const modifierMotDePasse = async (data) => {
  const response = await apiClient.put("/auth/password", data);

  return response.data;
};

export const updateMyProfile = async (data) => {
  const response = await apiClient.put("/auth/me", data);

  return response.data;
}