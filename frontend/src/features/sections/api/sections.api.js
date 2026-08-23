import apiClient from "../../../api/apiClient";

export const getSectionsByCompagnie = async (compagnieId) => {
    const reponse = await apiClient.get(`/sections/compagnie/${compagnieId}`);
    return reponse.data;
};

export const getSectionById = async (sectionId) => {
    const reponse = await apiClient.get(`/sections/${sectionId}`);
    return reponse.data;
};

export const createSection = async (sectionData) => {
    const reponse = await apiClient.post("/sections", sectionData);
    return reponse.data;
};

export const updateSection = async (sectionId, sectionData) => {
    const reponse = await apiClient.put(`/sections/${sectionId}`, sectionData);
    return reponse.data;
};

export const deleteSection = async (sectionId) => {
    const reponse = await apiClient.delete(`/sections/${sectionId}`);
    return reponse.data;
};