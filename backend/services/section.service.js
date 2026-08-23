import { Op } from "sequelize";
import Section from "../models/sections.model.js";
import Compagnie from "../models/compagnie.model.js";
import MissionsUsers from "../models/missionsUsers.model.js";
import MissionsVehicule from "../models/missionsVehicule.model.js";
import User from "../models/user.model.js";
import Role from "../models/roles.model.js";

const verifierUtilisateurSOA = async (chefSectionId, sectionId) => {
  const soa = await User.findByPk(chefSectionId, {
    include: {
      model: Role,
      as: "role",
      attributes: ["roleName"],
    },
  });

  if (!soa) {
    const error = new Error("SOA introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (soa.role?.roleName !== "SOA") {
    const error = new Error("L'utilisateur sélectionné doit avoir le rôle SOA.");
    error.statusCode = 400;
    throw error;
  }

  if (soa.sectionId !== sectionId) {
    const error = new Error("Le SOA sélectionné doit appartenir à cette section.");
    error.statusCode = 400;
    throw error;
  }

  const autreSection = await Section.findOne({
    where: {
      chefSectionId,
      id: { [Op.ne]: sectionId },
    },
  });

  if (autreSection) {
    const error = new Error("Ce SOA est déjà affecté à une autre section.");
    error.statusCode = 409;
    throw error;
  }

  return soa;
};

export const createSectionService = async (sectionData) => {
  if (!sectionData.sectionName?.trim()) {
    const error = new Error("Le nom de la section est obligatoire.");
    error.statusCode = 400;
    throw error;
  }
  sectionData.sectionName = sectionData.sectionName.trim();

  const compagnie = await Compagnie.findByPk(sectionData.compagnieId);
  if (!compagnie) {
    const error = new Error("Compagnie introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const existingSection = await Section.findOne({
    where: {
      sectionName: sectionData.sectionName,
      compagnieId: sectionData.compagnieId,
    },
  });
  if (existingSection) {
    const error = new Error("Cette section existe déjà dans cette compagnie.");
    error.statusCode = 409;
    throw error;
  }

  const section = await Section.create(sectionData);
  return section.toJSON();
};

export const getAllSectionsByCompagnieService = async (compagnieId) => {
  const compagnie = await Compagnie.findByPk(compagnieId);

  if (!compagnie) {
    const error = new Error("Compagnie introuvable.");
    error.statusCode = 404;
    throw error;
  }

  return Section.findAll({
    where: { compagnieId },
  });
};

export const getSectionByIdService = async (id) => {
  const section = await Section.findByPk(id, {
    include: [{ model: Compagnie, as: "compagnie" }],
  });
  if (!section) {
    const error = new Error("Section introuvable.");
    error.statusCode = 404;
    throw error;
  }
  return section.toJSON();
};

export const updateSectionService = async (id, updateData) => {
  if (!updateData || Object.keys(updateData).length === 0) {
    const error = new Error("Aucune donnée à mettre à jour.");
    error.statusCode = 400;
    throw error;
  }

  const section = await Section.findByPk(id);
  if (!section) {
    const error = new Error("Section introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (updateData.chefSectionId !== undefined && updateData.chefSectionId !== null && updateData.chefSectionId !== "") {
    await verifierUtilisateurSOA(updateData.chefSectionId, id);
  }

  if (updateData.chefSectionId === "") {
    updateData.chefSectionId = null;
  }

  if (updateData.compagnieId) {
    const compagnie = await Compagnie.findByPk(updateData.compagnieId);
    if (!compagnie) {
      const error = new Error("Compagnie introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (updateData.sectionName !== undefined) {
    if (!updateData.sectionName?.trim()) {
      const error = new Error("Le nom de la section est obligatoire.");
      error.statusCode = 400;
      throw error;
    }
    updateData.sectionName = updateData.sectionName.trim();

    const checkCompagnieId = updateData.compagnieId || section.compagnieId;

    const existingSection = await Section.findOne({
      where: {
        sectionName: updateData.sectionName,
        compagnieId: checkCompagnieId,
        id: {
          [Op.ne]: id,
        },
      },
    });
    if (existingSection) {
      const error = new Error(
        "Cette section existe déjà dans cette compagnie.",
      );
      error.statusCode = 409;
      throw error;
    }
  }

  await section.update(updateData);
  return section.toJSON();
};

export const deleteSectionService = async (id) => {
  const section = await Section.findByPk(id);
  if (!section) {
    const error = new Error("Section introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const userCount = await User.count({ where: { sectionId: id } });
  if (userCount > 0) {
    const error = new Error(
      "Impossible de supprimer une section contenant encore des utilisateurs.",
    );
    error.statusCode = 409;
    throw error;
  }

  await Promise.all([
    MissionsUsers.destroy({ where: { sectionId: id } }),
    MissionsVehicule.destroy({ where: { sectionId: id } }),
  ]);

  await section.destroy();
  return;
};

export const getSectionMeService = async (userId) => {
  const user = await User.findByPk(userId, {
    include: {
      model: Section,
      as: "section",
      include: {
        model: Compagnie,
        as: "compagnie",
      },
    },
  });

  if (!user || !user.section) {
    const error = new Error("Section introuvable.");
    error.statusCode = 404;
    throw error;
  }

  return user.section;
};
