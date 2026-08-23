import {
    getMissionsService,
    getMissionByIdService,
    deleteMissionService,
    updateMissionService,
    createMissionService,
} from '../services/missions.service.js';

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
    try {
        const mission = await getMissionByIdService(req.params.id);
        res.json(mission);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
}
export const createMission = async (req, res) => {

    console.log("[POST /api/missions] REQUETE RECUE");

    console.log(

        "[POST /api/missions] BODY:",

        JSON.stringify(req.body, null, 2)

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

                    Array.isArray(groupe.userIds)

                        ? groupe.userIds

                        : []

                )

            ),

        ];

        console.log(

            "[POST /api/missions] userIds:",

            userIds

        );

        console.log(

            "[POST /api/missions] groupesMission:",

            groupesMission.length

        );

        console.log(

            "[POST /api/missions] affectationsVehicules:",

            affectationsVehicules.length

        );

        console.log(

            "[POST /api/missions] affectations:",

            affectations.length

        );

        const mission =

            await createMissionService({

                ...missionData,

                groupesMission,

                userIds,

                oaResponsableMissionId,

                affectationsVehicules:

                    affectationsVehicules.length > 0

                        ? affectationsVehicules

                        : affectations,

            });

        console.log(

            "[POST /api/missions] CREATION REUSSIE:",

            mission?.id

        );

        res.status(201).json(mission);

    } catch (error) {

        console.error(

            "[POST /api/missions] ERREUR COMPLETE:",

            error

        );

        console.error(

            "[POST /api/missions] MESSAGE:",

            error?.message

        );

        console.error(

            "[POST /api/missions] STACK:",

            error?.stack

        );

        res.status(error.statusCode || 500).json({

            error:

                error.message ||

                "Erreur interne lors de la création de la mission.",

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
}
export const deleteMission = async (req, res) => {
    try {
        await deleteMissionService(req.params.id);
        res.status(200).json({
            message: 'Mission supprimée avec succès.',
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            error: error.message,
        });
    }
}