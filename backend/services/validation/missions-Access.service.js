import { Op } from "sequelize";

import MissionsGroupes from "../../models/missionsGroupes.model.js";
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

  // SOA → uniquement les missions où il est indiqué
  if (role === "SOA") {
    const groupe = await MissionsGroupes.findOne({
      where: {
        missionId: mission.id,
        soaId: user.id,
      },
    });
    if (!groupe) {
      const error = new Error("Vous n'avez pas accès à cette mission.");

      error.statusCode = 403;
      throw error;
    }

    return true;
  }

  // OA
  if (role === "OA") {
    // 1. OA directement affecté à la mission
    if (String(mission.oaId) === String(user.id)) {
      return true;
    }

    // 2. On récupère la compagnie dont cet utilisateur est OA
    const compagnie = await Compagnie.findOne({
      where: {
        oaId: user.id,
      },
    });

    if (!compagnie) {
      const error = new Error("Vous n'avez pas accès à cette mission.");

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

    const error = new Error("Vous n'avez pas accès à cette mission.");

    error.statusCode = 403;
    throw error;
  }

  // Conducteur ou autre rôle
  const error = new Error("Vous n'avez pas accès aux missions.");

  error.statusCode = 403;
  throw error;
};

/** fonction pour getMissions */

export const getMissionsAccessFilter = async (user) => {
  const role = user?.role?.roleName;

  if (!user?.id || !role) {
    const error = new Error("Utilisateur non authentifié.");

    error.statusCode = 401;
    throw error;
  }
  if (role === "administrateur") {
    return null;
  }
  // SOA → uniquement les missions où il est indiqué
  if (role === "SOA") {
    const groupes = await MissionsGroupes.findAll({
      where: {
        soaId: user.id,
      },
      attributes: ["missionId", "soaId"],
    });

    const missionIds = [
      ...new Set(groupes.map((groupe) => groupe.missionId).filter(Boolean)),
    ];

    const filter = {
      id: {
        [Op.in]: missionIds,
      },
    };

    return filter;
  }

  // OA →
  // - missions où il est directement indiqué comme OA
  // OU
  // - missions où un SOA de sa compagnie est présent
  if (role === "OA") {
    const compagnie = await Compagnie.findOne({
      where: {
        oaId: user.id,
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
      ...new Set(groupes.map((groupe) => groupe.missionId).filter(Boolean)),
    ];

    const filter = {
      [Op.or]: [
        {
          oaId: user.id,
        },
        {
          id: {
            [Op.in]: missionIds,
          },
        },
      ],
    };
    return filter;
  }
  return {
    id: {
      [Op.in]: [],
    },
  };
};
