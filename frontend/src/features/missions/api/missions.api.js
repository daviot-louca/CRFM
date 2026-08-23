import apiClient from "../../../api/apiClient";

export const getMissions = async () => {
  const response = await apiClient.get("/missions");
  return response.data;
};

export const getMissionById = async (missionId) => {
  const response = await apiClient.get(`/missions/${missionId}`);
  return response.data;
};

export const createMission = async (missionData) => {
  const response = await apiClient.post("/missions", missionData);
  return response.data;
};

export const deleteMission = async (missionId) => {
  const response = await apiClient.delete(`/missions/${missionId}`);
  return response.data;
};

export const createMissionVehicule = async (missionVehiculeData) => {
  const response = await apiClient.post("/missions-vehicules", missionVehiculeData);
  return response.data;
};

export const getSectionsByCompagnie = async (compagnieId) => {
  const response = await apiClient.get(`/sections/compagnie/${compagnieId}`);
  return response.data;
};

export const getUsersBySection = async (sectionId) => {
  const response = await apiClient.get(`/users/section/${sectionId}`);
  return response.data;
};
// Groupes de mission
export const getMissionGroupes = async (missionId) => {
  const response = await apiClient.get(`/missions-groupes/${missionId}`);
  return response.data;
};

export const createMissionGroupe = async (missionId, missionGroupeData) => {
  const response = await apiClient.post(
    `/missions-groupes/${missionId}`,
    missionGroupeData
  );
  return response.data;
};

// Affectations des militaires
export const getMissionUsersByGroup = async (missionGroupeId) => {
  const response = await apiClient.get(
    `/missions-users/groupes/${missionGroupeId}`
  );
  return response.data;
};

export const assignMissionUserToGroup = async (
  missionUserId,
  missionGroupeId
) => {
  const response = await apiClient.patch(
    `/missions-users/${missionUserId}/groupe`,
    { missionGroupeId }
  );
  return response.data;
};

export const removeMissionUserFromGroup = async (missionUserId) => {
  const response = await apiClient.delete(
    `/missions-users/${missionUserId}/groupe`
  );
  return response.data;
};