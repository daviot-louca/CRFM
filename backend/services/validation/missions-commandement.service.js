import { Op } from "sequelize";

import Compagnie from "../../models/compagnie.model.js";
import Section from "../../models/sections.model.js";
import User from "../../models/user.model.js";
import Role from "../../models/roles.model.js";

const userAttributes = {
  exclude: ["password"],
};

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

export const validateMissionCommandement = async ({
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
   * ==========================================
   * VALIDATION DES GROUPES
   * ==========================================
   */

  for (const groupe of groupesMission) {
    const userIdsGroupe = new Set(asArray(groupe.userIds));

    const soaId = normalizeId(groupe.soaId);

    /*
     * Validation SOA
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
     * Validation conducteurs
     */

    for (const conducteurId of asArray(groupe.conducteurIds).filter(Boolean)) {
      const conducteur = usersById.get(conducteurId);

      const role = roleNameOf(conducteur);

      if (role !== "conducteur" && role !== "SOA" && role !== "OA") {
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
   * CONDUCTEURS DES VÉHICULES
   * ==========================================
   */

  for (const affectation of affectationsVehicules) {
    for (const vehicule of asArray(affectation?.vehicules)) {
      const conducteurId = normalizeId(vehicule?.conducteurId);

      if (!conducteurId) {
        continue;
      }

      const conducteur = usersById.get(conducteurId);

      const role = roleNameOf(conducteur);

      if (role !== "conducteur" && role !== "SOA" && role !== "OA") {
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
   * ==========================================
   * OA RESPONSABLE
   * ==========================================
   */

  const oaId = normalizeId(oaResponsableMissionId);

  if (oaId) {
    const oa =
      usersById.get(oaId) ??
      (await User.findByPk(oaId, {
        attributes: userAttributes,

        include: [
          {
            model: Role,
            as: "role",
            attributes: ["id", "roleName"],
          },
        ],

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
   * ==========================================
   * OA AUTOMATIQUE VIA LE SOA
   * ==========================================
   */

  const firstSoaId = groupesMission
    .map((groupe) => normalizeId(groupe.soaId))
    .find(Boolean);

  if (firstSoaId) {
    const soa = usersById.get(firstSoaId);

    const compagnieId = soa?.section?.compagnieId;

    if (compagnieId) {
      const compagnie = await Compagnie.findByPk(compagnieId, {
        include: [
          {
            model: User,
            as: "oa",
            attributes: userAttributes,
          },
        ],

        transaction,
      });

      if (compagnie?.oa) {
        return {
          oaId: compagnie.oa.id,

          usersById,
        };
      }
    }
  }

  /*
   * ==========================================
   * FALLBACK COMPAGNIE DU GROUPE
   * ==========================================
   */

  const firstCompagnieId = groupesMission
    .map((groupe) => normalizeId(groupe.compagnieId))
    .find(Boolean);

  if (firstCompagnieId) {
    const compagnie = await Compagnie.findByPk(firstCompagnieId, {
      include: [
        {
          model: User,
          as: "oa",
          attributes: userAttributes,
        },
      ],

      transaction,
    });

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
