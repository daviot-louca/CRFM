import { Op } from "sequelize";

import MissionsGroupes from "../../models/missionsGroupes.model.js";
import MissionsVehicule from "../../models/missionsVehicule.model.js";
import Compagnie from "../../models/compagnie.model.js";
import Section from "../../models/sections.model.js";
import User from "../../models/user.model.js";

export const verifierAccesMission = async (mission, user) => {
  const role = user?.role?.roleName;

  if (!user?.id || !role) {
    const error = new Error("Utilisateur non authentifié.");
    error.statusCode = 401;
    throw error;
  }

  // ADMIN → toutes les missions
  if (role === "administrateur") {
    return true;
  }

  // SOA →
  // - mission où il est SOA d'un groupe
  // OU
  // - mission où il est conducteur d'un véhicule
  if (role === "SOA") {
    const [groupe, vehicule] = await Promise.all([
      MissionsGroupes.findOne({
        where: {
          missionId: mission.id,
          soaId: user.id,
        },
        attributes: ["id"],
      }),

      MissionsVehicule.findOne({
        where: {
          missionId: mission.id,
          conducteurId: user.id,
        },
        attributes: ["id"],
      }),
    ]);

    if (!groupe && !vehicule) {
      const error = new Error(
        "Vous n'avez pas accès à cette mission."
      );

      error.statusCode = 403;
      throw error;
    }

    return true;
  }

  // OA
  if (role === "OAL") {
    // 1. OAL directement affecté à la mission
    if (String(mission.oalId) === String(user.id)) {
      return true;
    }

    // 2. On récupère la compagnie dont cet utilisateur est OAL
    const compagnie = await Compagnie.findOne({
      where: {
        oalId: user.id,
      },
      attributes: ["id"],
    });

    if (!compagnie) {
      const error = new Error(
        "Vous n'avez pas accès à cette mission."
      );

      error.statusCode = 403;
      throw error;
    }

    // 3. On récupère les groupes de la mission
    //    et leurs SOA
    const groupes = await MissionsGroupes.findAll({
      where: {
        missionId: mission.id,
        soaId: {
          [Op.ne]: null,
        },
      },
      include: [
        {
          model: User,
          as: "soa",
          required: true,

          include: [
            {
              model: Section,
              as: "section",
              required: true,

              where: {
                compagnieId: compagnie.id,
              },
            },
          ],
        },
      ],
    });

    // Au moins un SOA appartient à la compagnie de l'OA
    if (groupes.length > 0) {
      return true;
    }

    const error = new Error(
      "Vous n'avez pas accès à cette mission."
    );

    error.statusCode = 403;
    throw error;
  }

  // Conducteur ou autre rôle
  const error = new Error(
    "Vous n'avez pas accès aux missions."
  );

  error.statusCode = 403;
  throw error;
};


/**
 * Filtre utilisé par getMissions()
 */
export const getMissionsAccessFilter = async (user) => {
  const role = user?.role?.roleName;

  if (!user?.id || !role) {
    const error = new Error("Utilisateur non authentifié.");
    error.statusCode = 401;
    throw error;
  }

  // ADMIN → toutes les missions
  if (role === "administrateur") {
    return null;
  }

  // SOA →
  // - missions où il est SOA d'un groupe
  // OU
  // - missions où il est conducteur d'un véhicule
  if (role === "SOA") {
    const [groupes, vehicules] = await Promise.all([
      MissionsGroupes.findAll({
        where: {
          soaId: user.id,
        },
        attributes: ["missionId"],
      }),

      MissionsVehicule.findAll({
        where: {
          conducteurId: user.id,
        },
        attributes: ["missionId"],
      }),
    ]);

    const missionIds = [
      ...groupes.map((groupe) => groupe.missionId),
      ...vehicules.map((vehicule) => vehicule.missionId),
    ].filter(Boolean);

    const uniqueMissionIds = [
      ...new Set(missionIds),
    ];

    return {
      id: {
        [Op.in]: uniqueMissionIds,
      },
    };
  }

  // OA →
  // - missions où il est directement indiqué comme OA
  // OU
  // - missions où un SOA de sa compagnie est présent
  if (role === "OAL") {
    const compagnie = await Compagnie.findOne({
      where: {
        oalId: user.id,
      },
      attributes: ["id"],
    });

    if (!compagnie) {
      return {
        id: {
          [Op.in]: [],
        },
      };
    }

    const groupes = await MissionsGroupes.findAll({
      where: {
        soaId: {
          [Op.ne]: null,
        },
      },
      attributes: ["missionId"],
      include: [
        {
          model: User,
          as: "soa",
          required: true,
          attributes: [],

          include: [
            {
              model: Section,
              as: "section",
              required: true,
              attributes: [],

              where: {
                compagnieId: compagnie.id,
              },
            },
          ],
        },
      ],
    });

    const missionIds = [
      ...new Set(
        groupes
          .map((groupe) => groupe.missionId)
          .filter(Boolean)
      ),
    ];

    return {
      [Op.or]: [
        {
          oalId: user.id,
        },
        {
          id: {
            [Op.in]: missionIds,
          },
        },
      ],
    };
  }

  // Conducteur ou autre rôle
  return {
    id: {
      [Op.in]: [],
    },
  };
};