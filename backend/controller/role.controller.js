

import { getRolesService } from "../services/role.service.js";

export const getRoles = async (req, res) => {
  try {
    const roles = await getRolesService();
    return res.status(200).json(roles);
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles :", error);
    return res.status(500).json({
      message: "Impossible de récupérer les rôles.",
    });
  }
};