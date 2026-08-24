import { Op } from "sequelize";
import sequelize from "../config/db.config.js";
import Compagnie from "../models/compagnie.model.js";
import Mission from "../models/missions.model.js";
import MissionsGroupes from "../models/missionsGroupes.model.js";
import MissionsEquipages from "../models/missions-equipages.model.js";
import MissionsUsers from "../models/missionsUsers.model.js";
import MissionsVehicule from "../models/missionsVehicule.model.js";
import Section from "../models/sections.model.js";
import User from "../models/user.model.js";
import Role from "../models/roles.model.js";
import Vehicule from "../models/vehicule.model.js";
import VehiculeType from "../models/vehicules-types.model.js";

const userAttributes = { exclude: ["password"] };

const userWithRoleInclude = [
  {
    model: Role,
    as: "role",
    attributes: ["id", "roleName"],
  },
];

const missionIncludes = [
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
        model: MissionsEquipages,
        as: "equipages",
        separate: true,
        include: [
          {
            model: User,
            as: "user",
            attributes: userAttributes,
          },
        ],
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

const normalizeId = (value) => value || null;

const asArray = (value) => (Array.isArray(value) ? value : []);

const roleNameOf = (user) => user?.role?.roleName ?? null;

const getNomUtilisateur = (user, fallbackId) =>
  [user?.grade, user?.lastName].filter(Boolean).join(" ") ||
  `Utilisateur ${fallbackId}`;

const fetchMissionUsers = async (userIds, transaction) => {
  if (userIds.length === 0) return new Map();

  const users = await User.findAll({
    where: {
      id: {
        [Op.in]: userIds,
      },
    },

    attributes: userAttributes,

    include: [
      ...userWithRoleInclude,

      {
        model: Section,
        as: "section",
        include: [
          {
            model: Compagnie,
            as: "compagnie",
            include: [
              {
                model: User,
                as: "oa",
                attributes: userAttributes,
              },
            ],
          },
        ],
      },
    ],

    transaction,
  });

  return new Map(users.map((user) => [user.id, user]));
};

const validateMissionCommandement = async ({
  groupesMission,
  idsUtilisateurs,
  oaResponsableMissionId,
  affectationsVehicules = [],
  transaction,
}) => {
  const idsCommandement = groupesMission.flatMap((groupe) => [
    normalizeId(groupe.soaId),
    ...asArray(groupe.conducteurIds),
  ]);

  // Conducteurs associés directement aux véhicules
  const idsConducteursVehicules = affectationsVehicules.flatMap((affectation) =>
    asArray(affectation?.vehicules).map((vehicule) =>
      normalizeId(vehicule?.conducteurId),
    ),
  );

  const idsACharger = [
    ...new Set(
      [
        ...idsUtilisateurs,
        ...idsCommandement,
        ...idsConducteursVehicules,
      ].filter(Boolean),
    ),
  ];

  const usersById = await fetchMissionUsers(idsACharger, transaction);

  const missingUserId = idsACharger.find((userId) => !usersById.has(userId));

  if (missingUserId) {
    const error = new Error(`Militaire introuvable : ${missingUserId}.`);

    error.statusCode = 404;

    throw error;
  }

  /*
   * Validation des groupes
   */
  for (const groupe of groupesMission) {
    const userIdsGroupe = new Set(asArray(groupe.userIds));

    const soaId = normalizeId(groupe.soaId);

    /*
     * Validation du SOA
     */
    if (soaId) {
      const soa = usersById.get(soaId);

      if (roleNameOf(soa) !== "SOA") {
        const error = new Error(
          `${getNomUtilisateur(soa, soaId)} doit avoir le rôle SOA.`,
        );

        error.statusCode = 400;

        throw error;
      }

      if (!userIdsGroupe.has(soaId)) {
        const error = new Error("Le SOA doit faire partie de son groupe.");

        error.statusCode = 400;

        throw error;
      }

      if (groupe.sectionId && soa.sectionId !== groupe.sectionId) {
        const error = new Error(
          "Le SOA sélectionné doit appartenir à la section du groupe.",
        );

        error.statusCode = 400;

        throw error;
      }
    }

    /*
     * Validation des conducteurs du groupe
     *
     * Un conducteur peut être :
     * - conducteur
     * - SOA
     * - OA
     */
    for (const conducteurId of asArray(groupe.conducteurIds).filter(Boolean)) {
      const conducteur = usersById.get(conducteurId);

      if (
        roleNameOf(conducteur) !== "conducteur" &&
        roleNameOf(conducteur) !== "SOA" &&
        roleNameOf(conducteur) !== "OA"
      ) {
        const error = new Error(
          `${getNomUtilisateur(
            conducteur,
            conducteurId,
          )} doit avoir le rôle conducteur, SOA ou OA.`,
        );

        error.statusCode = 400;

        throw error;
      }

      if (!userIdsGroupe.has(conducteurId)) {
        const error = new Error(
          "Chaque conducteur doit faire partie de son groupe.",
        );

        error.statusCode = 400;

        throw error;
      }
    }
  }

  /*
   * Validation des conducteurs associés
   * directement aux véhicules.
   *
   * Un véhicule peut être conduit par :
   * - conducteur
   * - SOA
   * - OA
   */
  for (const affectation of affectationsVehicules) {
    for (const vehicule of asArray(affectation?.vehicules)) {
      const conducteurId = normalizeId(vehicule?.conducteurId);

      if (!conducteurId) {
        continue;
      }

      const conducteur = usersById.get(conducteurId);

      if (
        roleNameOf(conducteur) !== "conducteur" &&
        roleNameOf(conducteur) !== "SOA" &&
        roleNameOf(conducteur) !== "OA"
      ) {
        const error = new Error(
          `${getNomUtilisateur(
            conducteur,
            conducteurId,
          )} doit avoir le rôle conducteur, SOA ou OA pour conduire ce véhicule.`,
        );

        error.statusCode = 400;

        throw error;
      }
    }
  }

  /*
   * Validation de l'OA responsable
   */
  const oaIdFromPayload = normalizeId(oaResponsableMissionId);

  if (oaIdFromPayload) {
    const oa =
      usersById.get(oaIdFromPayload) ??
      (await User.findByPk(oaIdFromPayload, {
        attributes: userAttributes,
        transaction,
      }));

    if (!oa) {
      const error = new Error("OA responsable introuvable.");

      error.statusCode = 404;

      throw error;
    }

    if (roleNameOf(oa) !== "OA") {
      const error = new Error(
        "L'utilisateur responsable de la mission doit avoir le rôle OA.",
      );

      error.statusCode = 400;

      throw error;
    }

    return {
      oaId: oa.id,
      usersById,
    };
  }

  /*
   * Si aucun OA responsable n'est fourni,
   * on essaie de le récupérer depuis le SOA.
   */
  const firstSoaId = groupesMission
    .map((groupe) => normalizeId(groupe.soaId))
    .find(Boolean);

  if (firstSoaId) {
    const soa = usersById.get(firstSoaId);

    const oaId = soa?.section?.compagnie?.oaId ?? null;

    if (oaId) {
      return {
        oaId,
        usersById,
      };
    }
  }

  /*
   * Dernier fallback :
   * récupérer l'OA directement depuis
   * la compagnie du premier groupe.
   */
  const firstCompagnieId = groupesMission
    .map((groupe) => normalizeId(groupe.compagnieId))
    .find(Boolean);

  if (firstCompagnieId) {
    const compagnie = await Compagnie.findByPk(firstCompagnieId, {
      transaction,
    });

    return {
      oaId: compagnie?.oaId ?? null,
      usersById,
    };
  }

  return {
    oaId: null,
    usersById,
  };
};

export const getMissionsService = async () => {
  const missions = await Mission.findAll({
    include: missionListIncludes,
  });

  await Promise.all(
    missions.map((mission) => synchroniserStatutMission(mission)),
  );

  return missions;
};

export const getMissionByIdService = async (id) => {
  const mission = await Mission.findByPk(id, {
    include: missionIncludes,
  });

  if (!mission) {
    const error = new Error("Mission introuvable.");

    error.statusCode = 404;

    throw error;
  }

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
    (total, mv) =>
      total +
      (mv.equipages ?? []).filter(
        (equipage) => equipage.fonction === "conducteur",
      ).length,
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

    (mv.equipages ?? []).forEach(({ user }) => {
      if (!user?.grade) return;

      if (militairesDuRang.includes(user.grade)) {
        statistiquesEquipage.x++;
      } else if (sousOfficiers.includes(user.grade)) {
        statistiquesEquipage.y++;
      } else if (Officiers.includes(user.grade)) {
        statistiquesEquipage.z++;
      }
    });

    /*
     * Conducteur
     */

    const conducteur = (mv.equipages ?? []).find(
      (equipage) => equipage.fonction === "conducteur",
    )?.user;

    return {
      id: mv.vehicule?.id,

      nom: mv.vehicule?.vehiculeName,

      type: mv.vehicule?.vehiculeType?.typeName,

      immatriculation: mv.vehicule?.immatriculation,

      compagnie: mv.compagnie,

      section: mv.section,

      groupe: mv.groupe?.nom ?? null,

      conducteur: conducteur
        ? getNomUtilisateur(conducteur, conducteur.id)
        : null,

      passagers: (mv.equipages ?? [])
        .filter((equipage) => equipage.fonction !== "conducteur")
        .map((equipage) => getNomUtilisateur(equipage.user, equipage.userId)),

      equipages: mv.equipages ?? [],

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

    const { oaId, usersById } = await validateMissionCommandement({
      groupesMission,
      idsUtilisateurs,
      oaResponsableMissionId,
      affectationsVehicules,
      transaction,
    });

    missionPayload.oaId = oaId;

    if (idsUtilisateurs.length > 0) {
      const conflits = await MissionsUsers.findAll({
        where: {
          userId: {
            [Op.in]: idsUtilisateurs,
          },
        },

        include: [
          {
            model: Mission,
            as: "mission",
            required: true,

            where: {
              debutMission: {
                [Op.lte]: missionPayload.finMission,
              },

              finMission: {
                [Op.gte]: missionPayload.debutMission,
              },
            },

            attributes: ["id", "missionName", "debutMission", "finMission"],
          },

          {
            model: User,
            as: "user",
            required: true,

            attributes: ["id", "grade", "lastName"],
          },
        ],

        transaction,
      });

      if (conflits.length > 0) {
        const details = conflits.map((conflit) => {
          const user = conflit.user;
          const mission = conflit.mission;

          const nomUtilisateur =
            [user?.grade, user?.lastName].filter(Boolean).join(" ") ||
            `Utilisateur ${conflit.userId}`;

          return `${nomUtilisateur} est déjà affecté à « ${
            mission?.missionName || "une autre mission"
          } » du ${mission?.debutMission} au ${mission?.finMission}`;
        });

        const error = new Error(
          `Conflit de disponibilité : ${details.join(" ; ")}.`,
        );

        error.statusCode = 409;

        error.conflicts = conflits.map((conflit) => ({
          userId: conflit.userId,
          missionId: conflit.missionId,
          missionName: conflit.mission?.missionName,
          debutMission: conflit.mission?.debutMission,
          finMission: conflit.mission?.finMission,
        }));

        throw error;
      }
    }

    missionPayload.StatutMission = calculerStatutMission(
      missionPayload.debutMission,
      missionPayload.finMission,
    );

    const newMission = await Mission.create(missionPayload, { transaction });

    const groupeIdMap = new Map();

    if (groupesMission.length > 0) {
      for (let index = 0; index < groupesMission.length; index++) {
        const groupe = groupesMission[index];

        const nouveauGroupe = await MissionsGroupes.create(
          {
            missionId: newMission.id,
            nom: groupe.nom?.trim() || `Groupe ${index + 1}`,
            ordre: groupe.ordre ?? index + 1,
            soaId: normalizeId(groupe.soaId),
          },
          { transaction },
        );

        groupeIdMap.set(groupe.id, nouveauGroupe.id);
      }
    }

    if (idsUtilisateurs.length > 0) {
      const sectionParUtilisateur = new Map();

      groupesMission.forEach((groupe) => {
        if (!Array.isArray(groupe.userIds)) return;

        groupe.userIds.forEach((userId) => {
          if (!sectionParUtilisateur.has(userId)) {
            sectionParUtilisateur.set(
              userId,
              groupe.sectionId || usersById.get(userId)?.sectionId || null,
            );
          }
        });
      });

      const groupeParUtilisateur = new Map();

      groupesMission.forEach((groupe) => {
        if (!Array.isArray(groupe.userIds)) return;

        groupe.userIds.forEach((userId) => {
          groupeParUtilisateur.set(userId, groupeIdMap.get(groupe.id) ?? null);
        });
      });

      const sectionKey = Object.prototype.hasOwnProperty.call(
        MissionsUsers.rawAttributes,
        "sectionId",
      )
        ? "sectionId"
        : Object.keys(MissionsUsers.rawAttributes).find((k) =>
            k.toLowerCase().includes("section"),
          );

      const lignesMissionUsers = idsUtilisateurs.map((userId) => {
        const ligne = {
          missionId: newMission.id,
          userId,

          missionGroupeId: groupeParUtilisateur.get(userId) || null,
        };

        if (sectionKey) {
          ligne[sectionKey] = sectionParUtilisateur.get(userId) || null;
        }

        return ligne;
      });

      await MissionsUsers.bulkCreate(lignesMissionUsers, { transaction });
    }

    const lignesMissionsVehicules = [];

    const vehiculesDejaAffectes = new Set();

    affectationsVehicules.forEach((affectation) => {
      if (!affectation?.compagnieId) return;

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
            (groupe) => groupe.compagnieId === affectation.compagnieId,
          );

          return groupesDeLaCompagnie.length === 1
            ? groupesDeLaCompagnie[0].id
            : null;
        })();

      const missionGroupeId = groupeId
        ? (groupeIdMap.get(groupeId) ?? null)
        : null;

      vehiculesAffectation.forEach((vehiculeAffectation) => {
        const vehiculeId = normalizeId(vehiculeAffectation?.vehiculeId);

        if (!vehiculeId || vehiculesDejaAffectes.has(vehiculeId)) {
          return;
        }

        vehiculesDejaAffectes.add(vehiculeId);

        lignesMissionsVehicules.push({
          missionId: newMission.id,
          vehiculeId,
          compagnieId: affectation.compagnieId,
          sectionId: affectation.sectionId || null,
          missionGroupeId,

          // Conducteur choisi à l'étape 4
          conducteurId: normalizeId(vehiculeAffectation?.conducteurId),
        });
      });
    });

    if (lignesMissionsVehicules.length > 0) {
      const vehiculeIds = lignesMissionsVehicules.map(
        ({ vehiculeId }) => vehiculeId,
      );

      const compagnieIds = [
        ...new Set(
          lignesMissionsVehicules.map(({ compagnieId }) => compagnieId),
        ),
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
        const error = new Error(
          "Une ou plusieurs compagnies sont introuvables.",
        );

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

      const missionsVehicules = await MissionsVehicule.bulkCreate(
        lignesMissionsVehicules,
        {
          transaction,
          returning: true,
        },
      );

      // Création du conducteur associé
      // à chaque véhicule.
      const lignesEquipages = missionsVehicules
        .filter((missionVehicule) => missionVehicule.conducteurId)
        .map((missionVehicule) => ({
          missionVehiculeId: missionVehicule.id,
          userId: missionVehicule.conducteurId,
          fonction: "conducteur",
        }));

      if (lignesEquipages.length > 0) {
        await MissionsEquipages.bulkCreate(lignesEquipages, {
          transaction,
        });
      }

      if (missionPayload.StatutMission === "En cours") {
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
    }

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

export const deleteMissionService = async (id) => {
  const mission = await Mission.findByPk(id);

  if (!mission) {
    const error = new Error("Mission introuvable.");

    error.statusCode = 404;

    throw error;
  }

  await sequelize.transaction(async (transaction) => {
    await MissionsUsers.destroy({
      where: {
        missionId: id,
      },
      transaction,
    });

    const missionsVehicules = await MissionsVehicule.findAll({
      where: {
        missionId: id,
      },
      transaction,
    });

    const vehiculeIds = missionsVehicules.map((mv) => mv.vehiculeId);

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
        missionId: id,
      },
      transaction,
    });

    await mission.destroy({
      transaction,
    });
  });
};
