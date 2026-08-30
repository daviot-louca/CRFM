import { Op } from "sequelize";
import sequelize from "../config/db.config.js";
import Compagnie from "../models/compagnie.model.js";
import Mission from "../models/missions.model.js";
import MissionsGroupes from "../models/missionsGroupes.model.js";
import MissionsUsers from "../models/missionsUsers.model.js";
import MissionsVehicule from "../models/missionsVehicule.model.js";
import Section from "../models/sections.model.js";
import User from "../models/user.model.js";
import Role from "../models/roles.model.js";
import Vehicule from "../models/vehicule.model.js";
import VehiculeType from "../models/vehicules-types.model.js";
import MissionsVehiculesPlein from "../models/missionsVehiculesPlein.model.js";
import MissionsVehiculesReleve from "../models/missionsVehiculesReleve.model.js"

import { updateMissionConducteurs } from "./missionsConducteurs.service.js";

import {
  verifierAccesMission,
  getMissionsAccessFilter,
} from "./validation/missions-Access.service.js";

import {
  updateMissionGroupes,
  createMissionGroupes,
} from "./missionsGroupes.service.js";

import {
  updateMissionVehicules,
  createMissionVehicules,
  deleteMissionVehicules,
} from "./missionsVehicules.service.js";

import { createMissionUsers } from "./missionUser.service.js";

import { validateMissionCommandement } from "./validation/missions-commandement.service.js";

const userAttributes = {
  exclude: ["password"],
};

const getNomUtilisateur = (user, fallbackId) =>
  [user?.grade, user?.lastName].filter(Boolean).join(" ") ||
  `Utilisateur ${fallbackId}`;

const missionIncludes = [
  {
    model: MissionsUsers,
    as: "missionsUsers",
    include: [
      {
        model: User,
        as: "user",
        attributes: userAttributes,
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["id", "roleName"],
          },
        ],
      },
      {
        model: Section,
        as: "sectionMission",
      },
    ],
  },

  {
    model: User,
    as: "oa",
    attributes: userAttributes,
  },

  {
    model: MissionsGroupes,
    as: "groupes",
    include: [
      {
        model: User,
        as: "soa",
        attributes: userAttributes,
      },
      {
        model: MissionsUsers,
        as: "utilisateurs",
        include: [
          {
            model: User,
            as: "user",
            attributes: userAttributes,
            include: [
              {
                model: Role,
                as: "role",
                attributes: ["id", "roleName"],
              },
            ],
          },
          {
            model: Section,
            as: "sectionMission",
          },
        ],
      },
    ],
  },

  {
    model: MissionsVehicule,
    as: "missionsVehicules",
    separate: true,
    include: [
      {
        model: Vehicule,
        as: "vehicule",
        include: [
          {
            model: VehiculeType,
            as: "vehiculeType",
          },
        ],
      },

      {
        model: Compagnie,
        as: "compagnie",
      },

      {
        model: Section,
        as: "section",
      },

      {
        model: MissionsGroupes,
        as: "groupe",
      },

      {
        model: User,
        as: "conducteur",
        attributes: userAttributes,
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["id", "roleName"],
          },
        ],
      },

      {
        model: MissionsVehiculesPlein,
        as: "pleins",
      },
      {
        model: MissionsVehiculesReleve,
        as: "releve",
      },
    ],
  },
];

/*
 * Liste des missions :
 * on ne charge volontairement pas les associations
 * complexes "groupes" et "missionsVehicules".
 *
 * Elles restent disponibles dans missionIncludes
 * pour la page détail.
 */
const missionListIncludes = [
  {
    model: MissionsUsers,
    as: "missionsUsers",
    include: [
      {
        model: User,
        as: "user",
        attributes: userAttributes,
      },
      {
        model: Section,
        as: "sectionMission",
      },
    ],
  },

  {
    model: User,
    as: "oa",
    attributes: userAttributes,
  },
];

const calculerStatutMission = (debutMission, finMission) => {
  const maintenant = new Date();
  const debut = new Date(debutMission);
  const fin = new Date(finMission);

  if (maintenant < debut) return "En préparation";
  if (maintenant > fin) return "Terminée";

  return "En cours";
};

const synchroniserStatutMission = async (mission) => {
  const statut = calculerStatutMission(
    mission.debutMission,
    mission.finMission,
  );

  if (mission.StatutMission !== statut) {
    await mission.update({
      StatutMission: statut,
    });
  }

  return mission;
};

export const getMissionsService = async (user) => {
  const accessFilter = await getMissionsAccessFilter(user);

  const missions = await Mission.findAll({
    ...(accessFilter ? { where: accessFilter } : {}),
    include: missionListIncludes,
  });

  await Promise.all(
    missions.map((mission) => synchroniserStatutMission(mission)),
  );

  return missions;
};

export const getMissionByIdService = async (id, user) => {
  const mission = await Mission.findByPk(id, {
    include: missionIncludes,
  });

  if (!mission) {
    const error = new Error("Mission introuvable.");

    error.statusCode = 404;

    throw error;
  }
  await verifierAccesMission(mission, user);

  await synchroniserStatutMission(mission);

  // IMPORTANT :
  // À partir d'ici, on travaille uniquement avec un objet simple.
  // On ne modifie plus mission.dataValues.
  const missionData = mission.toJSON();

  /*
   * ==========================================
   * GRADES X / Y / Z
   * ==========================================
   */

  const militairesDuRang = ["SDT", "1CL", "CPL", "CCH", "CC1"];

  const sousOfficiers = ["SGT", "SCH", "ADJ", "ADC", "MAJ"];

  const Officiers = ["SLT", "LTN", "CNE", "CDT", "LCL", "COL"];

  /*
   * ==========================================
   * STATISTIQUES GLOBALES
   * ==========================================
   */

  const statistiques = {
    x: 0,
    y: 0,
    z: 0,
    statut: missionData.StatutMission,
    compagnies: 0,
    groupes: missionData.groupes?.length ?? 0,
    conducteurs: 0,
  };

  /*
   * X / Y / Z de tous les utilisateurs
   * de la mission
   */

  (missionData.missionsUsers ?? []).forEach(({ user }) => {
    if (!user?.grade) return;

    if (militairesDuRang.includes(user.grade)) {
      statistiques.x++;
    } else if (sousOfficiers.includes(user.grade)) {
      statistiques.y++;
    } else if (Officiers.includes(user.grade)) {
      statistiques.z++;
    }
  });

  /*
   * ==========================================
   * COMPAGNIES
   * ==========================================
   */

  const compagniesMission = [
    ...new Map(
      (missionData.missionsVehicules ?? [])
        .filter(({ compagnie }) => compagnie)
        .map((item) => [item.compagnie.id, item.compagnie]),
    ).values(),
  ];

  statistiques.compagnies = compagniesMission.length;

  /*
   * ==========================================
   * CONDUCTEURS
   * ==========================================
   */

  statistiques.conducteurs = (missionData.missionsVehicules ?? []).reduce(
    (total, mv) => total + (mv.conducteurId ? 1 : 0),
    0,
  );

  /*
   * ==========================================
   * STATISTIQUES X / Y / Z PAR GROUPE
   * ==========================================
   */

  const groupesAvecStatistiques = (missionData.groupes ?? []).map((groupe) => {
    const statistiquesGroupe = {
      x: 0,
      y: 0,
      z: 0,
    };

    const utilisateursDuGroupe = (missionData.missionsUsers ?? []).filter(
      (missionUser) => missionUser.missionGroupeId === groupe.id,
    );

    utilisateursDuGroupe.forEach(({ user }) => {
      if (!user?.grade) return;

      if (militairesDuRang.includes(user.grade)) {
        statistiquesGroupe.x++;
      } else if (sousOfficiers.includes(user.grade)) {
        statistiquesGroupe.y++;
      } else if (Officiers.includes(user.grade)) {
        statistiquesGroupe.z++;
      }
    });

    return {
      ...groupe,
      x: statistiquesGroupe.x,
      y: statistiquesGroupe.y,
      z: statistiquesGroupe.z,
    };
  });

  /*
   * ==========================================
   * DONNÉES DE LA MISSION
   * ==========================================
   */

  missionData.statistiques = statistiques;

  missionData.oaResponsable = missionData.oa
    ? getNomUtilisateur(missionData.oa, missionData.oaId)
    : null;

  missionData.compagnies = compagniesMission;

  missionData.groupes = groupesAvecStatistiques;

  /*
   * ==========================================
   * VÉHICULES
   * ==========================================
   */

  missionData.vehicules = (missionData.missionsVehicules ?? []).map((mv) => {
    const statistiquesEquipage = {
      x: 0,
      y: 0,
      z: 0,
    };

    /*
     * Statistiques de l'équipage
     */

    const conducteur = mv.conducteur ?? null;

    if (conducteur?.grade) {
      if (militairesDuRang.includes(conducteur.grade)) {
        statistiquesEquipage.x++;
      } else if (sousOfficiers.includes(conducteur.grade)) {
        statistiquesEquipage.y++;
      } else if (Officiers.includes(conducteur.grade)) {
        statistiquesEquipage.z++;
      }
    }

    /*
     * Conducteur
     */

    return {
      id: mv.vehicule?.id,

      nom: mv.vehicule?.vehiculeName,

      type: mv.vehicule?.vehiculeType?.typeName,

      immatriculation: mv.vehicule?.immatriculation,

      compagnie: mv.compagnie,

      section: mv.section,

      groupe: mv.groupe?.nom ?? null,

      conducteurId: mv.conducteurId ?? null,

      conducteur: conducteur
        ? getNomUtilisateur(conducteur, conducteur.id)
        : null,

      pleins: mv.pleins ?? [],

      nombrePleins: Array.isArray(mv.pleins) ? mv.pleins.length : 0,

      litresPleins: Array.isArray(mv.pleins)
        ? mv.pleins.reduce(
            (total, plein) => total + Number(plein?.litres ?? 0),
            0,
          )
        : 0,
        releve: mv.releve ?? null,

      x: statistiquesEquipage.x,

      y: statistiquesEquipage.y,

      z: statistiquesEquipage.z,
    };
  });

  /*
   * ==========================================
   * MILITAIRES
   * ==========================================
   */

  missionData.militaires = (missionData.missionsUsers ?? []).map(
    ({ user }) => user,
  );

  /*
   * ==========================================
   * IMPORTANT
   * ==========================================
   *
   * On retourne l'objet simple.
   * On ne retourne PAS `mission`.
   */

  return missionData;
};

export const createMissionService = async (missionData) => {
  const {
    groupesMission = [],
    userIds = [],
    oaResponsableMissionId = null,
    affectationsVehicules = [],
    ...missionPayload
  } = missionData;

  if (!missionPayload.missionName?.trim()) {
    const error = new Error("Le nom de la mission est obligatoire.");

    error.statusCode = 400;

    throw error;
  }

  if (!missionPayload.debutMission || !missionPayload.finMission) {
    const error = new Error("Les dates de début et de fin sont obligatoires.");

    error.statusCode = 400;

    throw error;
  }

  const debutMission = new Date(missionPayload.debutMission);

  const finMission = new Date(missionPayload.finMission);

  if (
    Number.isNaN(debutMission.getTime()) ||
    Number.isNaN(finMission.getTime())
  ) {
    const error = new Error("Les dates de la mission sont invalides.");

    error.statusCode = 400;

    throw error;
  }

  if (debutMission > finMission) {
    const error = new Error(
      "La date de début doit être antérieure ou égale à la date de fin.",
    );

    error.statusCode = 400;

    throw error;
  }

  missionPayload.missionName = missionPayload.missionName.trim();

  const idsUtilisateurs = [...new Set(userIds.filter(Boolean))];

  return sequelize.transaction(async (transaction) => {
    const existingMission = await Mission.findOne({
      where: {
        missionName: missionPayload.missionName,
      },
      transaction,
    });

    if (existingMission) {
      const error = new Error("Une mission avec ce nom existe déjà.");

      error.statusCode = 409;

      throw error;
    }

    let oaId = null;
    let usersById = new Map();

    /*
     * La mission peut maintenant être créée
     * uniquement avec les informations de l'étape 1.
     *
     * La validation du commandement n'est effectuée
     * que si des données des étapes suivantes
     * sont réellement fournies.
     */
    const doitValiderCommandement =
      groupesMission.length > 0 ||
      idsUtilisateurs.length > 0 ||
      affectationsVehicules.length > 0 ||
      Boolean(oaResponsableMissionId);

    if (doitValiderCommandement) {
      const validation = await validateMissionCommandement({
        groupesMission,
        idsUtilisateurs,
        oaResponsableMissionId,
        affectationsVehicules,
        transaction,
      });

      oaId = validation.oaId;
      usersById = validation.usersById;
    }

    missionPayload.oaId = oaId;

    missionPayload.StatutMission = calculerStatutMission(
      missionPayload.debutMission,
      missionPayload.finMission,
    );

    const newMission = await Mission.create(missionPayload, { transaction });

    const groupeIdMap = new Map();

    if (groupesMission.length > 0) {
      const groupesCrees = await createMissionGroupes(
        newMission.id,
        groupesMission,
        transaction,
      );

      groupesMission.forEach((groupe, index) => {
        const groupeCree = groupesCrees[index];

        if (!groupeCree) {
          return;
        }

        if (groupe.id) {
          groupeIdMap.set(groupe.id, groupeCree.id);
        }

        groupeIdMap.set(`index:${index}`, groupeCree.id);
      });
    }

    if (idsUtilisateurs.length > 0) {
      await createMissionUsers(
        newMission.id,
        idsUtilisateurs,
        groupesMission,
        groupeIdMap,
        usersById,
        transaction,
      );
    }

    await createMissionVehicules(
      newMission.id,
      affectationsVehicules,
      groupesMission,
      groupeIdMap,
      missionPayload.StatutMission,
      transaction,
    );

    return newMission.toJSON();
  });
};

export const updateMissionService = async (id, missionData) => {
  if (Object.keys(missionData).length === 0) {
    const error = new Error("Aucune donnée à mettre à jour.");

    error.statusCode = 400;

    throw error;
  }

  if (missionData.missionName !== undefined) {
    missionData.missionName = missionData.missionName.trim();

    if (!missionData.missionName) {
      const error = new Error("Le nom de la mission est obligatoire.");

      error.statusCode = 400;

      throw error;
    }

    const existingMission = await Mission.findOne({
      where: {
        missionName: missionData.missionName,

        id: {
          [Op.ne]: id,
        },
      },
    });

    if (existingMission) {
      const error = new Error("Une mission avec ce nom existe déjà.");

      error.statusCode = 409;

      throw error;
    }
  }

  const mission = await Mission.findByPk(id);

  if (!mission) {
    const error = new Error("Mission introuvable.");

    error.statusCode = 404;

    throw error;
  }

  const debutMission = missionData.debutMission ?? mission.debutMission;

  const finMission = missionData.finMission ?? mission.finMission;

  missionData.StatutMission = calculerStatutMission(debutMission, finMission);

  await mission.update(missionData);

  const missionsVehicules = await MissionsVehicule.findAll({
    where: {
      missionId: mission.id,
    },
  });

  const vehiculeIds = missionsVehicules.map((mv) => mv.vehiculeId);

  if (vehiculeIds.length > 0) {
    await Vehicule.update(
      {
        disponibilite: missionData.StatutMission === "En cours",
      },
      {
        where: {
          id: {
            [Op.in]: vehiculeIds,
          },
        },
      },
    );
  }

  return mission.toJSON();
};

export const updateMissionGroupesService = async (
  id,
  groupesMission = [],
  user,
) => {
  const mission = await Mission.findByPk(id);

  if (!mission) {
    const error = new Error("Mission introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const missionUpdated = await updateMissionGroupes(
    mission,
    groupesMission,
    user,
  );

  const missionComplete = await Mission.findByPk(missionUpdated.id, {
    include: missionIncludes,
  });

  return missionComplete.toJSON();
};

export const updateMissionVehiculesService = async (
  id,
  affectationsVehicules = [],
  user,
) => {
  const mission = await Mission.findByPk(id);

  if (!mission) {
    const error = new Error("Mission introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const missionUpdated = await updateMissionVehicules(
    mission,
    affectationsVehicules,
    user,
  );

  const missionComplete = await Mission.findByPk(missionUpdated.id, {
    include: missionIncludes,
  });

  return missionComplete.toJSON();
};

export const updateMissionConducteursService = async (
  id,
  affectationsVehicules = [],
  oaId = null,
  user,
) => {
  const mission = await Mission.findByPk(id);

  if (!mission) {
    const error = new Error("Mission introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const missionUpdated = await updateMissionConducteurs(
    mission,
    affectationsVehicules,
    oaId,
    user,
    verifierAccesMission,
  );

  const missionComplete = await Mission.findByPk(missionUpdated.id, {
    include: missionIncludes,
  });

  return missionComplete.toJSON();
};

export const updateMissionCommandementService = async (
  id,
  oaId = null,
  groupesCommandement = [],
  user,
) => {
  const mission = await Mission.findByPk(id);

  if (!mission) {
    const error = new Error("Mission introuvable.");
    error.statusCode = 404;
    throw error;
  }

  await verifierAccesMission(mission, user);

  if (!Array.isArray(groupesCommandement)) {
    const error = new Error(
      "Les groupes du commandement doivent être un tableau.",
    );
    error.statusCode = 400;
    throw error;
  }

  return sequelize.transaction(async (transaction) => {
    /*
     * ======================================================
     * 1. OA RESPONSABLE
     * ======================================================
     */

    let oa = null;

    if (oaId) {
      oa = await User.findByPk(oaId, {
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["id", "roleName"],
          },
        ],
        transaction,
      });

      if (!oa) {
        const error = new Error("OA responsable introuvable.");
        error.statusCode = 404;
        throw error;
      }

      if (oa.role?.roleName !== "OA") {
        const error = new Error("L'utilisateur sélectionné n'est pas un OA.");
        error.statusCode = 400;
        throw error;
      }

      /*
       * L'OA doit appartenir à une compagnie
       * utilisée par la mission.
       */

      const compagnieAvecCetOA = await Compagnie.findOne({
        where: {
          oaId: oaId,
        },
        transaction,
      });

      if (!compagnieAvecCetOA) {
        const error = new Error(
          "L'OA sélectionné n'est désigné dans aucune compagnie.",
        );

        error.statusCode = 400;

        throw error;
      }
    }

    /*
     * ======================================================
     * 2. GROUPES
     * ======================================================
     */

    const groupes = await MissionsGroupes.findAll({
      where: {
        missionId: id,
      },
      transaction,
    });

    const groupesById = new Map(
      groupes.map((groupe) => [String(groupe.id), groupe]),
    );

    /*
     * ======================================================
     * 3. SOA DE CHAQUE GROUPE
     * ======================================================
     */

    for (const commandement of groupesCommandement) {
      const groupeId = commandement?.groupeId;
      const soaId = commandement?.soaId;

      if (!groupeId) {
        continue;
      }

      const groupe = groupesById.get(String(groupeId));

      if (!groupe) {
        const error = new Error(
          `Le groupe ${groupeId} n'appartient pas à cette mission.`,
        );

        error.statusCode = 400;

        throw error;
      }

      if (!soaId) {
        await groupe.update(
          {
            soaId: null,
          },
          {
            transaction,
          },
        );

        continue;
      }

      const soa = await User.findByPk(soaId, {
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["id", "roleName"],
          },
        ],
        transaction,
      });

      if (!soa) {
        const error = new Error("SOA introuvable.");

        error.statusCode = 404;

        throw error;
      }

      if (soa.role?.roleName !== "SOA") {
        const error = new Error("L'utilisateur sélectionné n'est pas un SOA.");

        error.statusCode = 400;

        throw error;
      }

      /*
       * Le SOA doit être affecté
       * au groupe concerné.
       */

      const missionUser = await MissionsUsers.findOne({
        where: {
          missionId: id,
          userId: soaId,
        },
        transaction,
      });

      if (!missionUser) {
        const error = new Error(
          "Le SOA sélectionné n'est pas affecté à cette mission.",
        );

        error.statusCode = 400;

        throw error;
      }

      await groupe.update(
        {
          soaId,
        },
        {
          transaction,
        },
      );
    }

    /*
     * ======================================================
     * 4. MISSION
     * ======================================================
     */

    await mission.update(
      {
        oaId: oaId || null,
      },
      {
        transaction,
      },
    );

    return mission.toJSON();
  });
};

export const deleteMissionService = async (id) => {
  const mission = await Mission.findByPk(id);

  if (!mission) {
    const error = new Error("Mission introuvable.");

    error.statusCode = 404;

    throw error;
  }

  await sequelize.transaction(async (transaction) => {
    // Récupérer les véhicules affectés à la mission
    // avant de supprimer les associations.
    const missionsVehicules = await MissionsVehicule.findAll({
      where: {
        missionId: id,
      },
      attributes: ["vehiculeId"],
      transaction,
    });

    const vehiculeIds = [
      ...new Set(
        missionsVehicules
          .map((mv) => mv.vehiculeId)
          .filter(Boolean),
      ),
    ];

    // Supprimer les utilisateurs de la mission
    await MissionsUsers.destroy({
      where: {
        missionId: id,
      },
      transaction,
    });

    // Supprimer les véhicules de la mission
    await deleteMissionVehicules(id, transaction);

    // Supprimer les groupes de la mission
    await MissionsGroupes.destroy({
      where: {
        missionId: id,
      },
      transaction,
    });

    /*
     * Les véhicules de cette mission doivent redevenir disponibles.
     *
     * On vérifie d'abord s'ils sont encore affectés
     * à une autre mission.
     */
    if (vehiculeIds.length > 0) {
      const autresAffectations = await MissionsVehicule.findAll({
        where: {
          vehiculeId: {
            [Op.in]: vehiculeIds,
          },
        },
        transaction,
      });

      const vehiculesEncoreAffectes = new Set(
        autresAffectations.map((mv) =>
          String(mv.vehiculeId),
        ),
      );

      const vehiculesARepasserDisponibles =
        vehiculeIds.filter(
          (vehiculeId) =>
            !vehiculesEncoreAffectes.has(
              String(vehiculeId),
            ),
        );

      if (vehiculesARepasserDisponibles.length > 0) {
        await Vehicule.update(
          {
            disponibilite: true,
          },
          {
            where: {
              id: {
                [Op.in]:
                  vehiculesARepasserDisponibles,
              },
            },
            transaction,
          },
        );
      }
    }

    // Supprimer définitivement la mission
    await mission.destroy({
      transaction,
    });
  });
};
