import {
  getMissionsService,
  getMissionByIdService,
  createMissionService,
  updateMissionService,
  updateMissionGroupesService,
  updateMissionVehiculesService,
  updateMissionConducteursService,
  updateMissionCommandementService,
  deleteMissionService,
} from "../services/missions.service.js";

export const getMissions = async (req, res) => {
  try {
    const user = req.user
    const missions = await getMissionsService(user);
    res.json(missions);
  } catch (error) {
    console.error("[GET /api/missions]", error);

    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
};
export const getMissionById = async (req, res) => {
  try {
    const id = req.params.id
    const user = req.user
    const mission = await getMissionByIdService(id,user);
    res.json(mission);
  } catch (error) {
    console.error("[GET /api/missions/:id] ERREUR COMPLETE:", error);

    console.error("[GET /api/missions/:id] MESSAGE:", error?.message);

    console.error("[GET /api/missions/:id] STACK:", error?.stack);

    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
};
export const createMission = async (req, res) => {


  try {
    const {
      groupesMission = [],

      oalResponsableMissionId = null,

      affectationsVehicules = [],

      affectations = [],

      ...missionData
    } = req.body;

    const userIds = [
      ...new Set(
        groupesMission.flatMap((groupe) =>
          Array.isArray(groupe.userIds) ? groupe.userIds : [],
        ),
      ),
    ];

    const mission = await createMissionService({
      ...missionData,

      groupesMission,

      userIds,

      oalResponsableMissionId,

      affectationsVehicules:
        affectationsVehicules.length > 0 ? affectationsVehicules : affectations,
    });


    res.status(201).json(mission);
  } catch (error) {
    console.error(
      "[POST /api/missions] ERREUR COMPLETE:",

      error,
    );

    console.error(
      "[POST /api/missions] MESSAGE:",

      error?.message,
    );

    console.error(
      "[POST /api/missions] STACK:",

      error?.stack,
    );

    res.status(error.statusCode || 500).json({
      error:
        error.message || "Erreur interne lors de la création de la mission.",
    });
  }
};
export const updateMission = async (req, res) => {
  try {
    const mission = await updateMissionService(req.params.id, req.body);
    res.json(mission);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
};

export const updateMissionGroupes = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user

    const { groupesMission = [] } = req.body;

    const mission = await updateMissionGroupesService(id, groupesMission,user);

    return res.status(200).json({
      message: "Les groupes de la mission ont été sauvegardés.",
      mission,
    });
  } catch (error) {
    console.error("[PUT /api/missions/:id/groupes] ERREUR:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Erreur lors de la sauvegarde des groupes.",
    });
  }
};

export const updateMissionVehicules = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user
    const { affectationsVehicules = [] } = req.body;


    const mission = await updateMissionVehiculesService(
      id,
      affectationsVehicules,
      user
    );

    return res.status(200).json({
      message: "Les véhicules de la mission ont été sauvegardés.",
      mission,
    });
  } catch (error) {
    console.error("[PUT /api/missions/:id/vehicules] ERREUR:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Erreur lors de la sauvegarde des véhicules.",
    });
  }
};

export const updateMissionConducteurs = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user
    const { affectationsVehicules = [], oalId = null } = req.body;


    const mission = await updateMissionConducteursService(
      id,
      affectationsVehicules,
      oalId,
      user
    );

    return res.status(200).json({
      message: "Les conducteurs de la mission ont été sauvegardés.",
      mission,
    });
  } catch (error) {
    console.error("[PUT /api/missions/:id/conducteurs] ERREUR:", error);

    return res.status(error.statusCode || 500).json({
      message: error.message || "Erreur lors de la sauvegarde des conducteurs.",
    });
  }
};

export const updateMissionCommandement = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const {
      oalId = null,
      groupesCommandement = [],
    } = req.body;


    const mission =
      await updateMissionCommandementService(
        id,
        oalId,
        groupesCommandement,
        user,
      );


    return res.status(200).json({
      message:
        "Le commandement de la mission a été sauvegardé.",
      mission,
    });
  } catch (error) {
    console.error(
      "[PUT /api/missions/:id/commandement] ERREUR:",
      error,
    );

    return res.status(
      error.statusCode || 500,
    ).json({
      message:
        error.message ||
        "Erreur lors de la sauvegarde du commandement.",
    });
  }
};

export const deleteMission = async (req, res) => {
  try {
    await deleteMissionService(req.params.id);
    res.status(200).json({
      message: "Mission supprimée avec succès.",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
};
