

import apiClient from "../../../api/apiClient";

export const getRoles = async () => {
  const response = await apiClient.get("/roles");
  return response.data;
};