import {
    getMissionsVehiculesService,
    getMissionVehiculeByIdService,
    createMissionVehiculeService,
    updateMissionVehiculeService,
    deleteMissionVehiculeService,
} from "../services/missionsVehicules.service.js";

export const getMissionsVehicules = async (req, res) => {
    try {
        const missionsVehicules = await getMissionsVehiculesService();

        res.json(missionsVehicules);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const getMissionVehiculeById = async (req, res) => {
    try {
        const missionVehicule = await getMissionVehiculeByIdService(
            req.params.id
        );

        res.json(missionVehicule);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const createMissionVehicule = async (req, res) => {
    try {
        const missionVehicule = await createMissionVehiculeService(req.body);

        res.status(201).json(missionVehicule);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const updateMissionVehicule = async (req, res) => {
    try {
        const missionVehicule = await updateMissionVehiculeService(
            req.params.id,
            req.body
        );

        res.json(missionVehicule);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const deleteMissionVehicule = async (req, res) => {
    try {
        await deleteMissionVehiculeService(req.params.id);

        res.status(200).json({
            message: "Véhicule retiré de la mission avec succès.",
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};