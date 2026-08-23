import {
    getMissionsUsersService,
    getMissionUserByIdService,
    createMissionUserService,
    updateMissionUserService,
    deleteMissionUserService,
    assignMissionUserToGroupService,
    removeMissionUserFromGroupService,
    getMissionUsersByGroupService,
} from "../services/missionUser.service.js";

export const getMissionsUsers = async (req, res) => {
    try {
        const missionsUsers = await getMissionsUsersService();
        res.json(missionsUsers);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const getMissionUserById = async (req, res) => {
    try {
        const missionUser = await getMissionUserByIdService(req.params.id);
        res.json(missionUser);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const getMissionUsersByGroup = async (req, res) => {
    try {
        const missionUsers = await getMissionUsersByGroupService(req.params.missionGroupeId);
        res.json(missionUsers);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const createMissionUser = async (req, res) => {
    try {
        const missionUser = await createMissionUserService(req.body);
        res.status(201).json(missionUser);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const updateMissionUser = async (req, res) => {
    try {
        const missionUser = await updateMissionUserService(req.params.id, req.body);
        res.json(missionUser);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const assignMissionUserToGroup = async (req, res) => {
    try {
        const missionUser = await assignMissionUserToGroupService(
            req.params.id,
            req.body.missionGroupeId
        );

        res.json(missionUser);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const removeMissionUserFromGroup = async (req, res) => {
    try {
        const missionUser = await removeMissionUserFromGroupService(req.params.id);
        res.json(missionUser);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};

export const deleteMissionUser = async (req, res) => {
    try {
        await deleteMissionUserService(req.params.id);
        res.status(200).json({
            message: "Militaire retiré de la mission avec succès.",
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
};