import apiClient from "../../../api/apiClient";

export const getConducteurVehicules = async () => {
  const response = await apiClient.get("/conducteur/vehicules");
  return response.data;
};

export const getConducteurVehicule = async (missionVehiculeId) => {
  const response = await apiClient.get(
    `/conducteur/vehicules/${missionVehiculeId}`,
  );
  return response.data;
};

export const saveConducteurReleve = async (missionVehiculeId, releveData) => {
  const response = await apiClient.put(
    `/conducteur/vehicules/${missionVehiculeId}/releve`,
    releveData,
  );
  return response.data;
};

export const getConducteurPleins = async (missionVehiculeId) => {
  const response = await apiClient.get(
    `/conducteur/vehicules/${missionVehiculeId}/pleins`,
  );
  return response.data;
};

export const addConducteurPlein = async (missionVehiculeId, pleinData) => {
  const response = await apiClient.post(
    `/conducteur/vehicules/${missionVehiculeId}/pleins`,
    pleinData,
  );
  return response.data;
};
