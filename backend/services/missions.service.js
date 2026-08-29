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
import { verifierAccesMission,getMissionsAccessFilter } from "./validation/missions-Access.service.js";
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

      console.log("DEBUG OA MISSION");
      console.log("SOA ID :", soaId);
      console.log("SOA :", soa);
      console.log("SECTION :", soa?.section);
      console.log("COMPAGNIE :", soa?.section?.compagnie);
      console.log("OA :", soa?.section?.compagnie?.oa);

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

  * on récupère automatiquement l'OA de la

  * compagnie du SOA.

  */

  const firstSoaId = groupesMission

    .map((groupe) => normalizeId(groupe.soaId))

    .find(Boolean);

  if (firstSoaId) {
    const soa = usersById.get(firstSoaId);

    /*

    * Le SOA appartient à une section.

    * La section appartient à une compagnie.

    * La compagnie possède un OA.

    */

    const compagnieId = soa?.section?.compagnieId;

    if (compagnieId) {
      const compagnie = await Compagnie.findByPk(
        compagnieId,

        {
          include: [
            {
              model: User,

              as: "oa",

              attributes: userAttributes,
            },
          ],

          transaction,
        },
      );

      if (compagnie?.oa) {
        return {
          oaId: compagnie.oa.id,

          usersById,
        };
      }
    }
  }

  /*

  * Fallback :

  * si on ne retrouve pas la compagnie via le SOA,

  * on utilise la compagnie indiquée dans le groupe.

  */

  const firstCompagnieId = groupesMission

    .map((groupe) => normalizeId(groupe.compagnieId))

    .find(Boolean);

  if (firstCompagnieId) {
    const compagnie = await Compagnie.findByPk(
      firstCompagnieId,

      {
        include: [
          {
            model: User,

            as: "oa",

            attributes: userAttributes,
          },
        ],

        transaction,
      },
    );

    return {
      oaId: compagnie?.oa?.id ?? null,

      usersById,
    };
  }

  return {
    oaId: null,

    usersById,
  };
};

export const getMissionsService = async (user) => {
  const accessFilter = await getMissionsAccessFilter(user);

  const missions = await Mission.findAll({
    ...(accessFilter ? { where: accessFilter } : {}),
    include: missionListIncludes,
  });

  await Promise.all(
    missions.map((mission) =>
      synchroniserStatutMission(mission),
    ),
  );

  return missions;
};

export const getMissionByIdService = async (id,user) => {
  const mission = await Mission.findByPk(id, {
    include: missionIncludes,
  });

  if (!mission) {
    const error = new Error("Mission introuvable.");

    error.statusCode = 404;

    throw error;
  }
  await verifierAccesMission(mission, user)

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
        (equipage) =>
          equipage.fonction === "conducteur" ||
          equipage.fonction === "SOA" ||
          equipage.fonction === "OA",
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

    const conducteur = mv.conducteur ?? null;

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

      // Création du conducteur associé
      // à chaque véhicule.

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

export const updateMissionGroupesService = async (id, groupesMission = [],user) => {
  const mission = await Mission.findByPk(id);

  if (!mission) {
    const error = new Error("Mission introuvable.");

    error.statusCode = 404;

    throw error;
  }
  await verifierAccesMission(mission, user)

  if (!Array.isArray(groupesMission)) {
    const error = new Error(
      "Les groupes de la mission doivent être un tableau.",
    );

    error.statusCode = 400;

    throw error;
  }

  return sequelize.transaction(async (transaction) => {
    /*
     * ==========================================
     * 1. Vérification des utilisateurs
     * ==========================================
     */

    const idsUtilisateurs = [
      ...new Set(
        groupesMission.flatMap((groupe) =>
          asArray(groupe.userIds).filter(Boolean),
        ),
      ),
    ];

    /*
     * On récupère les utilisateurs avec leurs rôles,
     * sections et compagnies.
     */
    const usersById = await fetchMissionUsers(idsUtilisateurs, transaction);

    const missingUserId = idsUtilisateurs.find(
      (userId) => !usersById.has(userId),
    );

    if (missingUserId) {
      const error = new Error(`Militaire introuvable : ${missingUserId}.`);

      error.statusCode = 404;

      throw error;
    }

    /*
     * ==========================================
     * 2. Validation des SOA
     * ==========================================
     */

    for (const groupe of groupesMission) {
      const soaId = normalizeId(groupe.soaId);

      if (!soaId) {
        continue;
      }

      const soa = usersById.get(soaId);

      if (roleNameOf(soa) !== "SOA") {
        const error = new Error(
          `${getNomUtilisateur(soa, soaId)} doit avoir le rôle SOA.`,
        );

        error.statusCode = 400;

        throw error;
      }

      const userIdsGroupe = new Set(asArray(groupe.userIds));

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
     * ==========================================
     * 3. Vérification des conducteurs
     * ==========================================
     */

    for (const groupe of groupesMission) {
      const userIdsGroupe = new Set(asArray(groupe.userIds));

      for (const conducteurId of asArray(groupe.conducteurIds).filter(
        Boolean,
      )) {
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
     * ==========================================
     * 4. Vérification des conflits de mission
     * ==========================================
     */

    if (idsUtilisateurs.length > 0) {
      const conflits = await MissionsUsers.findAll({
        where: {
          userId: {
            [Op.in]: idsUtilisateurs,
          },

          missionId: {
            [Op.ne]: mission.id,
          },
        },

        include: [
          {
            model: Mission,
            as: "mission",
            required: true,

            where: {
              debutMission: {
                [Op.lte]: mission.finMission,
              },

              finMission: {
                [Op.gte]: mission.debutMission,
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
          const autreMission = conflit.mission;

          const nomUtilisateur =
            [user?.grade, user?.lastName].filter(Boolean).join(" ") ||
            `Utilisateur ${conflit.userId}`;

          return `${nomUtilisateur} est déjà affecté à « ${
            autreMission?.missionName || "une autre mission"
          } ».`;
        });

        const error = new Error(
          `Conflit de disponibilité : ${details.join(" ; ")}`,
        );

        error.statusCode = 409;

        throw error;
      }
    }

    /*
     * ==========================================
     * 5. Suppression des anciennes données
     * ==========================================
     *
     * On remplace uniquement les groupes et
     * les utilisateurs de groupes.
     *
     * Les véhicules de l'étape 3 ne sont PAS
     * touchés.
     */

    await MissionsUsers.destroy({
      where: {
        missionId: mission.id,
      },

      transaction,
    });

    await MissionsGroupes.destroy({
      where: {
        missionId: mission.id,
      },

      transaction,
    });

    /*
     * ==========================================
     * 6. Création des nouveaux groupes
     * ==========================================
     */

    const groupeIdMap = new Map();

    for (let index = 0; index < groupesMission.length; index++) {
      const groupe = groupesMission[index];

      const nouveauGroupe = await MissionsGroupes.create(
        {
          missionId: mission.id,

          nom:
            groupe.nom?.trim() ||
            groupe.nomGroupe?.trim() ||
            `Groupe ${index + 1}`,

          ordre: groupe.ordre ?? index + 1,

          soaId: normalizeId(groupe.soaId),
        },
        {
          transaction,
        },
      );

      /*
       * On conserve la correspondance
       * frontend → BDD.
       */
      if (groupe.id) {
        groupeIdMap.set(groupe.id, nouveauGroupe.id);
      }
    }

    /*
     * ==========================================
     * 7. Création des utilisateurs
     * ==========================================
     */

    const lignesMissionUsers = [];

    groupesMission.forEach((groupe) => {
      const missionGroupeId = groupeIdMap.get(groupe.id) ?? null;

      const userIdsGroupe = asArray(groupe.userIds);

      userIdsGroupe.forEach((userId) => {
        const user = usersById.get(userId);

        if (!user) {
          return;
        }

        lignesMissionUsers.push({
          missionId: mission.id,

          userId,

          missionGroupeId,

          sectionId: groupe.sectionId ?? user.sectionId ?? null,
        });
      });
    });

    if (lignesMissionUsers.length > 0) {
      await MissionsUsers.bulkCreate(lignesMissionUsers, {
        transaction,
      });
    }

    const missionUpdated = await Mission.findByPk(mission.id, {
      include: missionIncludes,

      transaction,
    });

    return missionUpdated.toJSON();
  });
};

export const updateMissionVehiculesService = async (
  id,
  affectationsVehicules = [],
  user
) => {
  const mission = await Mission.findByPk(id);

  if (!mission) {
    const error = new Error("Mission introuvable.");
    error.statusCode = 404;
    throw error;
  }
  await verifierAccesMission(mission, user)

  if (!Array.isArray(affectationsVehicules)) {
    const error = new Error(
      "Les affectations de véhicules doivent être un tableau.",
    );

    error.statusCode = 400;

    throw error;
  }

  await sequelize.transaction(async (transaction) => {


    const groupes = await MissionsGroupes.findAll({
      where: {
        missionId: mission.id,
      },

      transaction,
    });

    const groupesById = new Map(groupes.map((groupe) => [groupe.id, groupe]));

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

    console.log(
      "[MISSIONS VEHICULES] Affectations reçues :",
      affectationsVehicules,
    );

    console.log(
      "[MISSIONS VEHICULES] Affectations normalisées :",
      affectationsNormalisees,
    );

    /*
     * ==========================================
     * 3. CONSTRUCTION DES LIGNES
     * ==========================================
     */

    const lignesMissionsVehicules = [];

    const vehiculesDejaAffectes = new Set();

    for (const affectation of affectationsNormalisees) {
      const groupeId = normalizeId(affectation?.groupeId);

      /*
       * Si un groupe est fourni,
       * il doit appartenir à la mission.
       */

      if (groupeId && !groupesById.has(groupeId)) {
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
       * Un véhicule ne peut être affecté
       * qu'une seule fois à la mission.
       */

      if (vehiculesDejaAffectes.has(vehiculeId)) {
        const error = new Error(
          "Un même véhicule ne peut pas être affecté plusieurs fois à la même mission.",
        );

        error.statusCode = 400;

        throw error;
      }

      vehiculesDejaAffectes.add(vehiculeId);

      lignesMissionsVehicules.push({
        missionId: mission.id,

        vehiculeId,

        sectionId: normalizeId(affectation?.sectionId),

        missionGroupeId: groupeId,

        /*
         * Le conducteur sera choisi
         * à l'étape 4.
         */
        conducteurId: null,
      });
    }

    /*
     * ==========================================
     * 4. VALIDATION DES VÉHICULES
     * ==========================================
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
      /*
       * Vérification des véhicules.
       */

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
     * ==========================================
     * 5. LIBÉRATION DES ANCIENS VÉHICULES
     * ==========================================
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
     * ==========================================
     * 7. SUPPRESSION DES ANCIENNES AFFECTATIONS
     * ==========================================
     */

    await MissionsVehicule.destroy({
      where: {
        missionId: mission.id,
      },

      transaction,
    });

    /*
     * ==========================================
     * 8. CRÉATION DES NOUVELLES AFFECTATIONS
     * ==========================================
     */

    if (lignesMissionsVehicules.length > 0) {
      await MissionsVehicule.bulkCreate(lignesMissionsVehicules, {
        transaction,
      });

      console.log(
        "[MISSIONS VEHICULES] Véhicules enregistrés :",
        lignesMissionsVehicules,
      );

      /*
       * Si la mission est actuellement
       * en cours, les véhicules deviennent
       * indisponibles.
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
  });

  /*
   * ==========================================
   * 9. RETOUR DE LA MISSION
   * ==========================================
   */

  const missionUpdated = await Mission.findByPk(mission.id, {
    include: missionIncludes,
  });

  return missionUpdated.toJSON();
};

export const updateMissionConducteursService = async (
  id,
  affectationsVehicules = [],
  oaId = null,
  user
) => {
  const mission = await Mission.findByPk(id);

  if (!mission) {
    const error = new Error("Mission introuvable.");
    error.statusCode = 404;
    throw error;
  }
  await verifierAccesMission(mission, user)

  if (!Array.isArray(affectationsVehicules)) {
    const error = new Error(
      "Les affectations de véhicules doivent être un tableau.",
    );

    error.statusCode = 400;
    throw error;
  }

  return sequelize
    .transaction(async (transaction) => {
      /*
       * ==========================================
       * 1. OA RESPONSABLE DE LA MISSION
       * ==========================================
       */

      const oaResponsableId = normalizeId(oaId);

      if (oaResponsableId) {
        const oa = await User.findByPk(oaResponsableId, {
          attributes: userAttributes,

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

        if (roleNameOf(oa) !== "OA") {
          const error = new Error(
            "L'utilisateur responsable de la mission doit avoir le rôle OA.",
          );

          error.statusCode = 400;
          throw error;
        }

        await mission.update(
          {
            oaId: oaResponsableId,
          },
          {
            transaction,
          },
        );

        console.log(
          "[ÉTAPE 4 BACKEND] OA responsable enregistré :",
          oaResponsableId,
        );
      }

      /*
       * ==========================================
       * 2. VÉHICULES DE LA MISSION
       * ==========================================
       */

      const missionsVehicules = await MissionsVehicule.findAll({
        where: {
          missionId: mission.id,
        },

        transaction,
      });

      const missionsVehiculesByVehiculeId = new Map(
        missionsVehicules.map((missionVehicule) => [
          String(missionVehicule.vehiculeId),
          missionVehicule,
        ]),
      );

      console.log(
        "[ÉTAPE 4 BACKEND] Véhicules de la mission :",
        missionsVehicules.map((mv) => ({
          id: mv.id,
          vehiculeId: mv.vehiculeId,
          missionGroupeId: mv.missionGroupeId,
          conducteurId: mv.conducteurId,
        })),
      );

      /*
       * ==========================================
       * 3. CONDUCTEURS DEMANDÉS
       * ==========================================
       */

      const conducteurIds = [
        ...new Set(
          affectationsVehicules
            .map((affectation) => normalizeId(affectation?.conducteurId))
            .filter(Boolean),
        ),
      ];

      /*
       * ==========================================
       * 4. UTILISATEURS DE LA MISSION
       * ==========================================
       */

      const missionsUsers = await MissionsUsers.findAll({
        where: {
          missionId: mission.id,
        },

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
        ],

        transaction,
      });

      const missionsUsersByUserId = new Map(
        missionsUsers.map((missionUser) => [
          String(missionUser.userId),
          missionUser,
        ]),
      );

      /*
       * ==========================================
       * 5. VÉRIFICATION DES CONDUCTEURS
       * ==========================================
       */

      for (const conducteurId of conducteurIds) {
        const missionUser = missionsUsersByUserId.get(String(conducteurId));

        if (!missionUser) {
          const error = new Error(
            `Le conducteur ${conducteurId} n'est pas affecté à cette mission.`,
          );

          error.statusCode = 404;
          throw error;
        }

        if (!missionUser.user) {
          const error = new Error(
            `L'utilisateur ${conducteurId} existe dans missions_users mais son utilisateur est introuvable.`,
          );

          error.statusCode = 404;
          throw error;
        }
      }

      /*
       * ==========================================
       * 6. VALIDATION ET ENREGISTREMENT
       * ==========================================
       */

      const conducteursDejaAffectes = new Set();

      for (const affectation of affectationsVehicules) {
        const vehiculeId = normalizeId(affectation?.vehiculeId);

        const conducteurId = normalizeId(affectation?.conducteurId);

        if (!vehiculeId) {
          continue;
        }

        /*
         * Le véhicule doit appartenir
         * à la mission.
         */

        const missionVehicule = missionsVehiculesByVehiculeId.get(
          String(vehiculeId),
        );

        if (!missionVehicule) {
          const error = new Error(
            `Le véhicule ${vehiculeId} n'appartient pas à cette mission.`,
          );

          error.statusCode = 400;
          throw error;
        }

        /*
         * Conducteur obligatoire.
         */

        if (!conducteurId) {
          const error = new Error("Chaque véhicule doit avoir un conducteur.");

          error.statusCode = 400;
          throw error;
        }

        /*
         * Récupération du conducteur
         * depuis missions_users.
         */

        const missionUser = missionsUsersByUserId.get(String(conducteurId));

        const conducteur = missionUser?.user;

        if (!conducteur) {
          const error = new Error(`Conducteur introuvable : ${conducteurId}.`);

          error.statusCode = 404;
          throw error;
        }

        /*
         * ==========================================
         * UN CONDUCTEUR = UN VÉHICULE
         * ==========================================
         */

        if (conducteursDejaAffectes.has(String(conducteurId))) {
          const error = new Error(
            `${getNomUtilisateur(
              conducteur,
              conducteurId,
            )} est déjà affecté à un autre véhicule de cette mission.`,
          );

          error.statusCode = 409;
          throw error;
        }

        conducteursDejaAffectes.add(String(conducteurId));

        /*
         * ==========================================
         * GROUPE
         * ==========================================
         */

        const groupeId =
          normalizeId(affectation?.groupeId) ??
          normalizeId(missionVehicule.missionGroupeId);

        console.log("[ÉTAPE 4 BACKEND] Vérification groupe :", {
          conducteurId,
          groupeId,
          groupeDuConducteur: missionUser.missionGroupeId,
          groupeDuVehicule: missionVehicule.missionGroupeId,
        });

        if (groupeId) {
          const missionGroupe = await MissionsGroupes.findOne({
            where: {
              id: groupeId,
              missionId: mission.id,
            },

            transaction,
          });

          if (!missionGroupe) {
            const error = new Error(
              "Le groupe associé au véhicule n'appartient pas à cette mission.",
            );

            error.statusCode = 400;
            throw error;
          }

          /*
           * Le conducteur doit appartenir
           * au même groupe que le véhicule.
           */

          if (String(missionUser.missionGroupeId) !== String(groupeId)) {
            const error = new Error(
              `${getNomUtilisateur(
                conducteur,
                conducteurId,
              )} n'appartient pas au groupe sélectionné pour ce véhicule.`,
            );

            error.statusCode = 400;
            throw error;
          }
        }

        await missionVehicule.update(
          {
            conducteurId,
          },
          {
            transaction,
          },
        );

        console.log(
          "[ÉTAPE 4 BACKEND] Affectation validée et conducteur enregistré :",
          {
            vehiculeId,
            conducteurId,
            missionVehiculeId: missionVehicule.id,
            groupeId,
            conducteur: getNomUtilisateur(conducteur, conducteurId),
          },
        );
      }

      console.log(
        "[ÉTAPE 4 BACKEND] Conducteurs enregistrés directement dans missions_vehicules.",
      );

      /*
       * ==========================================
       * 7. RETOUR DE LA MISSION
       * ==========================================
       */

      const missionUpdated = await Mission.findByPk(mission.id, {
        include: missionIncludes,

        transaction,
      });

      return missionUpdated;
    })
    .then((missionUpdated) => missionUpdated.toJSON());
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
