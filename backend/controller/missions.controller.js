import {
  getMissionsService,
  getMissionByIdService,
  createMissionService,
  updateMissionService,
  updateMissionGroupesService,
  updateMissionVehiculesService,
  updateMissionConducteursService,
  deleteMissionService,
} from "../services/missions.service.js";

export const getMissions = async (req, res) => {
  try {
    const missions = await getMissionsService();
    res.json(missions);
  } catch (error) {
    console.error("[GET /api/missions]", error);

    res.status(error.statusCode || 500).json({
      error: error.message,
    });
  }
};
export const getMissionById = async (req, res) => {
  console.log("[GET /api/missions/:id] REQUETE RECUE");
  console.log("[GET /api/missions/:id] ID:", req.params.id);

  try {
    const mission = await getMissionByIdService(req.params.id);

    console.log("[GET /api/missions/:id] MISSION TROUVEE:", mission?.id);

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
  console.log("[POST /api/missions] REQUETE RECUE");

  console.log(
    "[POST /api/missions] BODY:",

    JSON.stringify(req.body, null, 2),
  );

  try {
    const {
      groupesMission = [],

      oaResponsableMissionId = null,

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

    console.log(
      "[POST /api/missions] userIds:",

      userIds,
    );

    console.log(
      "[POST /api/missions] groupesMission:",

      groupesMission.length,
    );

    console.log(
      "[POST /api/missions] affectationsVehicules:",

      affectationsVehicules.length,
    );

    console.log(
      "[POST /api/missions] affectations:",

      affectations.length,
    );

    const mission = await createMissionService({
      ...missionData,

      groupesMission,

      userIds,

      oaResponsableMissionId,

      affectationsVehicules:
        affectationsVehicules.length > 0 ? affectationsVehicules : affectations,
    });

    console.log(
      "[POST /api/missions] CREATION REUSSIE:",

      mission?.id,
    );

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

    const { groupesMission = [] } = req.body;

    console.log(`[PUT /api/missions/${id}/groupes] REQUETE RECUE`);

    console.log(
      `[PUT /api/missions/${id}/groupes] groupesMission:`,
      JSON.stringify(groupesMission, null, 2),
    );

    const mission = await updateMissionGroupesService(id, groupesMission);

    console.log(`[PUT /api/missions/${id}/groupes] SAUVEGARDE REUSSIE`);

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

    const { affectationsVehicules = [] } = req.body;

    console.log(`[PUT /api/missions/${id}/vehicules] REQUETE RECUE`);

    console.log(
      `[PUT /api/missions/${id}/vehicules] affectationsVehicules:`,
      JSON.stringify(affectationsVehicules, null, 2),
    );

    const mission = await updateMissionVehiculesService(
      id,
      affectationsVehicules,
    );

    console.log(`[PUT /api/missions/${id}/vehicules] SAUVEGARDE REUSSIE`);

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

    const { affectationsVehicules = [] } = req.body;

    console.log(`[PUT /api/missions/${id}/conducteurs] REQUETE RECUE`);

    console.log(
      `[PUT /api/missions/${id}/conducteurs] affectationsVehicules:`,
      JSON.stringify(affectationsVehicules, null, 2),
    );

    const mission = await updateMissionConducteursService(
      id,
      affectationsVehicules,
    );

    console.log(`[PUT /api/missions/${id}/conducteurs] SAUVEGARDE REUSSIE`);

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
