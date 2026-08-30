import { Op } from "sequelize";
import sequelize from "../config/db.config.js";

import Compagnie from "../models/compagnie.model.js";
import Mission from "../models/missions.model.js";
import MissionsGroupes from "../models/missionsGroupes.model.js";
import MissionsUsers from "../models/missionsUsers.model.js";
import Section from "../models/sections.model.js";
import User from "../models/user.model.js";
import Role from "../models/roles.model.js";

import {
  verifierAccesMission,
} from "./validation/missions-Access.service.js";

const userAttributes = { exclude: ["password"] };

const normalizeId = (value) => value || null;

const asArray = (value) => (Array.isArray(value) ? value : []);

const roleNameOf = (user) => user?.role?.roleName ?? null;

const getNomUtilisateur = (user, fallbackId) =>
  [user?.grade, user?.lastName].filter(Boolean).join(" ") ||
  `Utilisateur ${fallbackId}`;

const fetchMissionUsers = async (userIds, transaction) => {
  if (userIds.length === 0) {
    return new Map();
  }

  const users = await User.findAll({
    where: {
      id: {
        [Op.in]: userIds,
      },
    },

    attributes: userAttributes,

    include: [
      {
        model: Role,
        as: "role",
        attributes: ["id", "roleName"],
      },

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

export const getByMission = (missionId) => {
  return MissionsGroupes.findAll({
    where: {
      missionId,
    },
    order: [["ordre", "ASC"]],
  });
};

export const create = (data) => {
  return MissionsGroupes.create(data);
};

export const createMany = async (groupes, transaction) => {
  if (!Array.isArray(groupes) || groupes.length === 0) {
    return [];
  }

  return MissionsGroupes.bulkCreate(groupes, {
    transaction,
    returning: true,
  });
};

export const getById = (id) => {
  return MissionsGroupes.findByPk(id);
};

export const update = async (id, data) => {
  const groupe = await MissionsGroupes.findByPk(id);

  if (!groupe) {
    return null;
  }

  await groupe.update(data);

  return groupe;
};

export const remove = async (id) => {
  const groupe = await MissionsGroupes.findByPk(id);

  if (!groupe) {
    return null;
  }

  await groupe.destroy();

  return true;
};

export const removeByMission = async (missionId, transaction) => {
  return MissionsGroupes.destroy({
    where: {
      missionId,
    },
    transaction,
  });
};

/*
 * ==========================================================
 * MISE À JOUR COMPLÈTE DES GROUPES D'UNE MISSION
 * ==========================================================
 *
 * Cette fonction contient désormais toute la logique métier
 * concernant :
 *
 * - les groupes
 * - les SOA
 * - les conducteurs déclarés dans les groupes
 * - les utilisateurs des groupes
 * - les conflits de disponibilité
 *
 * Les véhicules ne sont volontairement PAS modifiés ici.
 */
export const updateMissionGroupes = async (
  mission,
  groupesMission = [],
  user,
) => {
  if (!mission) {
    const error = new Error("Mission introuvable.");
    error.statusCode = 404;
    throw error;
  }

  await verifierAccesMission(mission, user);

  if (!Array.isArray(groupesMission)) {
    const error = new Error(
      "Les groupes de la mission doivent être un tableau.",
    );

    error.statusCode = 400;

    throw error;
  }

  return sequelize.transaction(async (transaction) => {
    /*
     * ======================================================
     * 1. UTILISATEURS À CHARGER
     * ======================================================
     */

    const idsUtilisateurs = [
      ...new Set(
        groupesMission
          .flatMap((groupe) => [
            ...asArray(groupe.userIds),
            normalizeId(groupe.soaId),
            ...asArray(groupe.conducteurIds),
          ])
          .filter(Boolean),
      ),
    ];

    const usersById = await fetchMissionUsers(
      idsUtilisateurs,
      transaction,
    );

    const missingUserId = idsUtilisateurs.find(
      (userId) => !usersById.has(userId),
    );

    if (missingUserId) {
      const error = new Error(
        `Militaire introuvable : ${missingUserId}.`,
      );

      error.statusCode = 404;

      throw error;
    }

    /*
     * ======================================================
     * 2. VALIDATION DES SOA
     * ======================================================
     */

    for (const groupe of groupesMission) {
      const soaId = normalizeId(groupe.soaId);

      if (!soaId) {
        continue;
      }

      const soa = usersById.get(soaId);

      if (roleNameOf(soa) !== "SOA") {
        const error = new Error(
          `${getNomUtilisateur(
            soa,
            soaId,
          )} doit avoir le rôle SOA.`,
        );

        error.statusCode = 400;

        throw error;
      }

      const userIdsGroupe = new Set(
        asArray(groupe.userIds),
      );

      if (!userIdsGroupe.has(soaId)) {
        const error = new Error(
          "Le SOA doit faire partie de son groupe.",
        );

        error.statusCode = 400;

        throw error;
      }

      if (
        groupe.sectionId &&
        String(soa.sectionId) !== String(groupe.sectionId)
      ) {
        const error = new Error(
          "Le SOA sélectionné doit appartenir à la section du groupe.",
        );

        error.statusCode = 400;

        throw error;
      }
    }

    /*
     * ======================================================
     * 3. VALIDATION DES CONDUCTEURS DES GROUPES
     * ======================================================
     */

    for (const groupe of groupesMission) {
      const userIdsGroupe = new Set(
        asArray(groupe.userIds),
      );

      for (const conducteurId of asArray(
        groupe.conducteurIds,
      ).filter(Boolean)) {
        const conducteur = usersById.get(
          conducteurId,
        );

        const role = roleNameOf(conducteur);

        if (
          role !== "conducteur" &&
          role !== "SOA" &&
          role !== "OA"
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
     * ======================================================
     * 4. CONFLITS DE DISPONIBILITÉ
     * ======================================================
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

            attributes: [
              "id",
              "missionName",
              "debutMission",
              "finMission",
            ],
          },

          {
            model: User,
            as: "user",
            required: true,

            attributes: [
              "id",
              "grade",
              "lastName",
            ],
          },
        ],

        transaction,
      });

      if (conflits.length > 0) {
        const details = conflits.map((conflit) => {
          const utilisateur = conflit.user;
          const autreMission = conflit.mission;

          const nomUtilisateur =
            [
              utilisateur?.grade,
              utilisateur?.lastName,
            ]
              .filter(Boolean)
              .join(" ") ||
            `Utilisateur ${conflit.userId}`;

          return `${nomUtilisateur} est déjà affecté à « ${
            autreMission?.missionName ||
            "une autre mission"
          } ».`;
        });

        const error = new Error(
          `Conflit de disponibilité : ${details.join(
            " ; ",
          )}`,
        );

        error.statusCode = 409;

        throw error;
      }
    }

    /*
     * ======================================================
     * 5. SUPPRESSION DES ANCIENS GROUPES
     * ======================================================
     *
     * On supprime d'abord les utilisateurs de la mission,
     * puis les groupes.
     *
     * Les véhicules ne sont PAS touchés.
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
     * ======================================================
     * 6. CRÉATION DES NOUVEAUX GROUPES
     * ======================================================
     */

    const nouveauxGroupes = [];

    for (
      let index = 0;
      index < groupesMission.length;
      index++
    ) {
      const groupe = groupesMission[index];

      const nouveauGroupe =
        await MissionsGroupes.create(
          {
            missionId: mission.id,

            nom:
              groupe.nom?.trim() ||
              groupe.nomGroupe?.trim() ||
              `Groupe ${index + 1}`,

            ordre:
              groupe.ordre ??
              index + 1,

            soaId:
              normalizeId(groupe.soaId),
          },

          {
            transaction,
          },
        );

      nouveauxGroupes.push(nouveauGroupe);
    }

    /*
     * ======================================================
     * 7. UTILISATEURS DES GROUPES
     * ======================================================
     *
     * IMPORTANT :
     *
     * On utilise l'index du tableau pour associer
     * chaque ancien groupe à son nouveau groupe.
     *
     * Cela fonctionne même si le frontend envoie
     * un groupe sans ID.
     */

    const lignesMissionUsers = [];

    groupesMission.forEach(
      (groupe, groupeIndex) => {
        const nouveauGroupe =
          nouveauxGroupes[groupeIndex];

        if (!nouveauGroupe) {
          return;
        }

        const userIdsGroupe = asArray(
          groupe.userIds,
        );

        userIdsGroupe.forEach((userId) => {
          const utilisateur =
            usersById.get(userId);

          if (!utilisateur) {
            return;
          }

          lignesMissionUsers.push({
            missionId: mission.id,

            userId,

            missionGroupeId:
              nouveauGroupe.id,

            sectionId:
              groupe.sectionId ??
              utilisateur.sectionId ??
              null,
          });
        });
      },
    );

    if (lignesMissionUsers.length > 0) {
      await MissionsUsers.bulkCreate(
        lignesMissionUsers,
        {
          transaction,
        },
      );
    }

    /*
     * ======================================================
     * 8. RÉCUPÉRATION DE LA MISSION
     * ======================================================
     */

    const missionUpdated =
      await Mission.findByPk(
        mission.id,
        {
          include: [
            {
              model: MissionsGroupes,
              as: "groupes",
            },
          ],

          transaction,
        },
      );

    return missionUpdated;
  });
};

export const createMissionGroupes = async (
  missionId,
  groupesMission = [],
  transaction,
) => {
  if (!Array.isArray(groupesMission)) {
    const error = new Error(
      "Les groupes de la mission doivent être un tableau.",
    );

    error.statusCode = 400;
    throw error;
  }

  const groupesCrees = [];

  for (let index = 0; index < groupesMission.length; index++) {
    const groupe = groupesMission[index];

    const nouveauGroupe = await MissionsGroupes.create(
      {
        missionId,

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

    groupesCrees.push(nouveauGroupe);
  }

  return groupesCrees;
};