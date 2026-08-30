import { Op } from "sequelize";
import sequelize from "../config/db.config.js";

import Compagnie from "../models/compagnie.model.js";
import Mission from "../models/missions.model.js";
import MissionsGroupes from "../models/missionsGroupes.model.js";
import MissionsVehicule from "../models/missionsVehicule.model.js";
import Vehicule from "../models/vehicule.model.js";
import { verifierAccesMission } from "./validation/missions-Access.service.js";
const normalizeId = (value) => value || null;

const asArray = (value) => (Array.isArray(value) ? value : []);

export const getByMission = (missionId) => {
  return MissionsVehicule.findAll({
    where: {
      missionId,
    },
  });
};
export const getMissionsVehiculesService = async () => {
  return MissionsVehicule.findAll({
    include: [
      {
        model: Mission,
        as: "mission",
      },
      {
        model: Vehicule,
        as: "vehicule",
      },
    ],
  });
};
export const create = (data) => {
  return MissionsVehicule.create(data);
};

export const getById = (id) => {
  return MissionsVehicule.findByPk(id);
};
export const getMissionVehiculeByIdService = async (id) => {
  const missionVehicule = await MissionsVehicule.findByPk(id);

  if (!missionVehicule) {
    const error = new Error("Affectation du véhicule introuvable.");

    error.statusCode = 404;

    throw error;
  }

  return missionVehicule.toJSON();
};
export const update = async (id, data) => {
  const missionVehicule = await MissionsVehicule.findByPk(id);

  if (!missionVehicule) {
    return null;
  }

  await missionVehicule.update(data);

  return missionVehicule;
};

export const remove = async (id) => {
  const missionVehicule = await MissionsVehicule.findByPk(id);

  if (!missionVehicule) {
    return null;
  }

  await missionVehicule.destroy();

  return true;
};

export const removeByMission = async (missionId, transaction) => {
  return MissionsVehicule.destroy({
    where: {
      missionId,
    },
    transaction,
  });
};

/*
 * ==========================================================
 * MISE À JOUR DES VÉHICULES D'UNE MISSION
 * ==========================================================
 */

export const updateMissionVehicules = async (
  mission,
  affectationsVehicules = [],
  user,
) => {
  if (!mission) {
    const error = new Error("Mission introuvable.");

    error.statusCode = 404;

    throw error;
  }

  await verifierAccesMission(mission, user);

  if (!Array.isArray(affectationsVehicules)) {
    const error = new Error(
      "Les affectations de véhicules doivent être un tableau.",
    );

    error.statusCode = 400;

    throw error;
  }

  return sequelize.transaction(async (transaction) => {
    /*
     * ======================================================
     * 1. GROUPES DE LA MISSION
     * ======================================================
     */

    const groupes = await MissionsGroupes.findAll({
      where: {
        missionId: mission.id,
      },

      transaction,
    });

    const groupesById = new Map(
      groupes.map((groupe) => [String(groupe.id), groupe]),
    );

    /*
     * ======================================================
     * 2. NORMALISATION DES AFFECTATIONS
     * ======================================================
     *
     * Formats acceptés :
     *
     * {
     *   vehiculeId,
     *   compagnieId,
     *   sectionId,
     *   groupeId
     * }
     *
     * ou :
     *
     * {
     *   compagnieId,
     *   sectionId,
     *   groupeId,
     *   vehicules: [
     *      { vehiculeId }
     *   ]
     * }
     */

    const affectationsNormalisees = affectationsVehicules.flatMap(
      (affectation) => {
        if (affectation?.vehiculeId) {
          return [
            {
              vehiculeId: normalizeId(affectation.vehiculeId),

              compagnieId: normalizeId(affectation.compagnieId),

              sectionId: normalizeId(affectation.sectionId),

              groupeId: normalizeId(
                affectation.groupeId ?? affectation.missionGroupeId,
              ),
            },
          ];
        }

        return asArray(affectation?.vehicules).map((vehicule) => ({
          vehiculeId: normalizeId(vehicule?.vehiculeId ?? vehicule),

          compagnieId: normalizeId(affectation?.compagnieId),

          sectionId: normalizeId(affectation?.sectionId),

          groupeId: normalizeId(
            affectation?.groupeId ?? affectation?.missionGroupeId,
          ),
        }));
      },
    );

    /*
     * ======================================================
     * 3. CONSTRUCTION DES LIGNES
     * ======================================================
     */

    const lignesMissionsVehicules = [];

    const vehiculesDejaAffectes = new Set();

    for (const affectation of affectationsNormalisees) {
      const groupeId = normalizeId(affectation?.groupeId);

      /*
       * Le groupe doit appartenir
       * à la mission.
       */

      if (groupeId && !groupesById.has(String(groupeId))) {
        const error = new Error(
          "Le groupe sélectionné n'appartient pas à cette mission.",
        );

        error.statusCode = 400;

        throw error;
      }

      const vehiculeId = normalizeId(affectation?.vehiculeId);

      if (!vehiculeId) {
        continue;
      }

      /*
       * Un véhicule ne peut apparaître
       * qu'une seule fois.
       */

      if (vehiculesDejaAffectes.has(String(vehiculeId))) {
        const error = new Error(
          "Un même véhicule ne peut pas être affecté plusieurs fois à la même mission.",
        );

        error.statusCode = 400;

        throw error;
      }

      vehiculesDejaAffectes.add(String(vehiculeId));

      lignesMissionsVehicules.push({
        missionId: mission.id,

        vehiculeId,

        sectionId: normalizeId(affectation?.sectionId),

        missionGroupeId: groupeId,

        /*
         * Le conducteur est affecté
         * lors de l'étape suivante.
         */

        conducteurId: null,
      });
    }

    /*
     * ======================================================
     * 4. VÉRIFICATION DES VÉHICULES
     * ======================================================
     */

    if (lignesMissionsVehicules.length > 0) {
      const vehiculeIds = lignesMissionsVehicules.map(
        ({ vehiculeId }) => vehiculeId,
      );

      const vehicules = await Vehicule.findAll({
        where: {
          id: {
            [Op.in]: vehiculeIds,
          },
        },

        transaction,
      });

      if (vehicules.length !== vehiculeIds.length) {
        const error = new Error("Un ou plusieurs véhicules sont introuvables.");

        error.statusCode = 404;

        throw error;
      }

      /*
       * Vérification de disponibilité.
       */

      const vehiculeIndisponible = vehicules.find(
        (vehicule) => vehicule.disponibilite === false,
      );

      if (vehiculeIndisponible) {
        const error = new Error(
          "Un ou plusieurs véhicules sélectionnés sont indisponibles.",
        );

        error.statusCode = 409;

        throw error;
      }
    }

    /*
     * ======================================================
     * 5. LIBÉRATION DES ANCIENS VÉHICULES
     * ======================================================
     */

    const anciennesAffectations = await MissionsVehicule.findAll({
      where: {
        missionId: mission.id,
      },

      transaction,
    });

    const anciensVehiculeIds = anciennesAffectations.map((mv) => mv.vehiculeId);

    if (anciensVehiculeIds.length > 0) {
      await Vehicule.update(
        {
          disponibilite: true,
        },

        {
          where: {
            id: {
              [Op.in]: anciensVehiculeIds,
            },
          },

          transaction,
        },
      );
    }

    /*
     * ======================================================
     * 6. SUPPRESSION DES ANCIENNES AFFECTATIONS
     * ======================================================
     */

    await MissionsVehicule.destroy({
      where: {
        missionId: mission.id,
      },

      transaction,
    });

    /*
     * ======================================================
     * 7. CRÉATION DES NOUVELLES AFFECTATIONS
     * ======================================================
     */

    if (lignesMissionsVehicules.length > 0) {
      await MissionsVehicule.bulkCreate(lignesMissionsVehicules, {
        transaction,
      });

      /*
       * Une mission en cours bloque
       * immédiatement les véhicules.
       */

      if (mission.StatutMission === "En cours") {
        await Vehicule.update(
          {
            disponibilite: false,
          },

          {
            where: {
              id: {
                [Op.in]: [...vehiculesDejaAffectes],
              },
            },

            transaction,
          },
        );
      }
    }

    /*
     * ======================================================
     * 8. RETOUR DE LA MISSION
     * ======================================================
     *
     * On recharge uniquement ici.
     * Le format détaillé final est toujours construit
     * par missions.service.js.
     */

    const missionUpdated = await Mission.findByPk(mission.id, {
      transaction,
    });

    return missionUpdated;
  });
};
export const updateMissionVehiculeService = async (id, missionVehiculeData) => {
  const missionVehicule = await MissionsVehicule.findByPk(id);

  if (!missionVehicule) {
    const error = new Error("Affectation du véhicule introuvable.");

    error.statusCode = 404;

    throw error;
  }

  if (missionVehiculeData && Object.keys(missionVehiculeData).length > 0) {
    await missionVehicule.update(missionVehiculeData);
  }

  return missionVehicule.toJSON();
};

export const createMissionVehicules = async (
  missionId,
  affectationsVehicules = [],
  groupesMission = [],
  groupeIdMap = new Map(),
  statutMission,
  transaction,
) => {
  if (!Array.isArray(affectationsVehicules)) {
    const error = new Error(
      "Les affectations de véhicules doivent être un tableau.",
    );

    error.statusCode = 400;
    throw error;
  }

  const lignesMissionsVehicules = [];
  const vehiculesDejaAffectes = new Set();

  affectationsVehicules.forEach((affectation) => {
    if (!affectation?.compagnieId) {
      return;
    }

    const vehiculesAffectation = Array.isArray(affectation.vehicules)
      ? affectation.vehicules
      : asArray(affectation.vehiculesIds).map((vehiculeId) => ({
          vehiculeId,
          conducteurId: null,
        }));

    const groupeId =
      normalizeId(affectation.groupeId) ??
      (() => {
        const groupesDeLaCompagnie = groupesMission.filter(
          (groupe) =>
            String(groupe.compagnieId) === String(affectation.compagnieId),
        );

        return groupesDeLaCompagnie.length === 1
          ? groupesDeLaCompagnie[0].id
          : null;
      })();

    const missionGroupeId = groupeId
      ? (groupeIdMap.get(groupeId) ??
        groupeIdMap.get(
          `index:${groupesMission.findIndex(
            (groupe) => String(groupe.id) === String(groupeId),
          )}`,
        ) ??
        null)
      : null;

    vehiculesAffectation.forEach((vehiculeAffectation) => {
      const vehiculeId = normalizeId(vehiculeAffectation?.vehiculeId);

      if (!vehiculeId) {
        return;
      }

      if (vehiculesDejaAffectes.has(String(vehiculeId))) {
        return;
      }

      vehiculesDejaAffectes.add(String(vehiculeId));

      lignesMissionsVehicules.push({
        missionId,
        vehiculeId,

        compagnieId: affectation.compagnieId,

        sectionId: affectation.sectionId || null,

        missionGroupeId,

        conducteurId: normalizeId(vehiculeAffectation?.conducteurId),
      });
    });
  });

  if (lignesMissionsVehicules.length === 0) {
    return [];
  }

  const vehiculeIds = lignesMissionsVehicules.map(
    ({ vehiculeId }) => vehiculeId,
  );

  const compagnieIds = [
    ...new Set(lignesMissionsVehicules.map(({ compagnieId }) => compagnieId)),
  ];

  const [vehicules, compagnies] = await Promise.all([
    Vehicule.findAll({
      where: {
        id: {
          [Op.in]: vehiculeIds,
        },
      },
      transaction,
    }),

    Compagnie.findAll({
      where: {
        id: {
          [Op.in]: compagnieIds,
        },
      },
      transaction,
    }),
  ]);

  if (vehicules.length !== vehiculeIds.length) {
    const error = new Error("Un ou plusieurs véhicules sont introuvables.");

    error.statusCode = 404;
    throw error;
  }

  if (compagnies.length !== compagnieIds.length) {
    const error = new Error("Une ou plusieurs compagnies sont introuvables.");

    error.statusCode = 404;
    throw error;
  }

  const vehiculeIndisponible = vehicules.find(
    (vehicule) => vehicule.disponibilite === false,
  );

  if (vehiculeIndisponible) {
    const error = new Error(
      "Un ou plusieurs véhicules sélectionnés sont indisponibles.",
    );

    error.statusCode = 409;
    throw error;
  }

  await MissionsVehicule.bulkCreate(lignesMissionsVehicules, {
    transaction,
  });

  if (statutMission === "En cours") {
    await Vehicule.update(
      {
        disponibilite: false,
      },
      {
        where: {
          id: {
            [Op.in]: vehiculeIds,
          },
        },
        transaction,
      },
    );
  }

  return lignesMissionsVehicules;
};

export const deleteMissionVehicules = async (missionId, transaction) => {
  const affectations = await MissionsVehicule.findAll({
    where: {
      missionId,
    },
    transaction,
  });

  const vehiculeIds = affectations
    .map((affectation) => affectation.vehiculeId)
    .filter(Boolean);

  if (vehiculeIds.length > 0) {
    await Vehicule.update(
      {
        disponibilite: true,
      },
      {
        where: {
          id: {
            [Op.in]: vehiculeIds,
          },
        },
        transaction,
      },
    );
  }

  await MissionsVehicule.destroy({
    where: {
      missionId,
    },
    transaction,
  });
};

export const createMissionVehiculeService = async (missionVehiculeData) => {
  if (!missionVehiculeData?.missionId || !missionVehiculeData?.vehiculeId) {
    const error = new Error("La mission et le véhicule sont obligatoires.");

    error.statusCode = 400;

    throw error;
  }

  const mission = await Mission.findByPk(missionVehiculeData.missionId);

  if (!mission) {
    const error = new Error("Mission introuvable.");

    error.statusCode = 404;

    throw error;
  }

  const vehicule = await Vehicule.findByPk(missionVehiculeData.vehiculeId);

  if (!vehicule) {
    const error = new Error("Véhicule introuvable.");

    error.statusCode = 404;

    throw error;
  }

  const existing = await MissionsVehicule.findOne({
    where: {
      missionId: missionVehiculeData.missionId,

      vehiculeId: missionVehiculeData.vehiculeId,
    },
  });

  if (existing) {
    const error = new Error("Ce véhicule est déjà affecté à cette mission.");

    error.statusCode = 409;

    throw error;
  }

  const missionVehicule = await MissionsVehicule.create(missionVehiculeData);

  return missionVehicule.toJSON();
};

export const deleteMissionVehiculeService = async (id) => {
  const missionVehicule = await MissionsVehicule.findByPk(id);

  if (!missionVehicule) {
    const error = new Error("Affectation du véhicule introuvable.");

    error.statusCode = 404;

    throw error;
  }

  await missionVehicule.destroy();

  return true;
};
