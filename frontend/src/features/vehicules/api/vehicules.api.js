import apiClient from "../../../api/apiClient";

export const getVehicules = async () => {
  const response = await apiClient.get("/vehicules");

  console.log("RÉPONSE API :", response.data);

  return response.data;
};

export const getVehiculesDisponibles = async () => {
  const response = await apiClient.get("/vehicules/disponibles");
  return response.data;
};

export const createVehicule = async (vehiculeData) => {
  const response = await apiClient.post("/vehicules", vehiculeData);
  return response.data;
};

export const getVehiculeTypes = async () => {
  const response = await apiClient.get("/vehicules/types");
  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    if (Array.isArray(data.vehiculeTypes)) return data.vehiculeTypes;
    if (Array.isArray(data.vehiculesTypes)) return data.vehiculesTypes;
    if (Array.isArray(data.types)) return data.types;
    if (Array.isArray(data.data)) return data.data;
  }

  return [];
};