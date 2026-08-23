

import {
    getMissionsEquipagesService,
    getMissionEquipageByIdService,
    createMissionEquipageService,
    updateMissionEquipageService,
    deleteMissionEquipageService,
} from "../services/missionsEquipages.service.js";

export const getMissionsEquipages = async (req, res) => {
    try {
        const missionsEquipages = await getMissionsEquipagesService();
        res.json(missionsEquipages);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const getMissionEquipageById = async (req, res) => {
    try {
        const missionEquipage = await getMissionEquipageByIdService(req.params.id);
        res.json(missionEquipage);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const createMissionEquipage = async (req, res) => {
    try {
        const missionEquipage = await createMissionEquipageService(req.body);
        res.status(201).json(missionEquipage);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const updateMissionEquipage = async (req, res) => {
    try {
        const missionEquipage = await updateMissionEquipageService(req.params.id, req.body);
        res.json(missionEquipage);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const deleteMissionEquipage = async (req, res) => {
    try {
        await deleteMissionEquipageService(req.params.id);
        res.status(200).json({
            message: "Membre d'équipage supprimé avec succès.",
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};