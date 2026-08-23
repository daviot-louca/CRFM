import Compagnie from "../models/compagnie.model.js";
import User from "../models/user.model.js";
import Section from "../models/sections.model.js";
import Role from "../models/roles.model.js";

const verifierUtilisateurOA = async (oaId, compagnieId = null) => {
  const oa = await User.findByPk(oaId, {
    include: {
      model: Role,
      as: "role",
      attributes: ["roleName"],
    },
  });

  if (!oa) {
    const error = new Error("OA introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (oa.role?.roleName !== "OA") {
    const error = new Error("L'utilisateur sélectionné doit avoir le rôle OA.");
    error.statusCode = 400;
    throw error;
  }

  const compagnieExistante = await Compagnie.findOne({
    where: { oaId },
  });

  if (compagnieExistante && compagnieExistante.id !== compagnieId) {
    const error = new Error("Cet OA est déjà affecté à une autre compagnie.");
    error.statusCode = 409;
    throw error;
  }

  return oa;
};

export const getAllCompagniesService = async () => {
  const compagnies = await Compagnie.findAll({
    order: [["ordre", "ASC"]],
    include: [
      {
        model: Section,
        as: "sections",
        include: [
          {
            model: User,
            as: "users",
            attributes: ["id", "grade", "lastName", "sectionId", "roleId"],
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
      {
        model: User,
        as: "oa",
        attributes: ["id", "grade", "lastName", "sectionId", "roleId"],
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["id", "roleName"],
          },
        ],
      },
    ],
  });

  return compagnies;
};

export const getCompagnieByIdService = async (id) => {
  const compagnie = await Compagnie.findByPk(id);
  if (!compagnie) {
    const error = new Error("Compagnie non trouvée.");
    error.statusCode = 404;
    throw error;
  }
  return compagnie;
};

export const createCompagnieService = async (compagnieData) => {
  if (!compagnieData.nom?.trim()) {
    const error = new Error("Le nom de la compagnie est obligatoire.");
    error.statusCode = 400;
    throw error;
  }
  compagnieData.nom = compagnieData.nom.trim();

  if (compagnieData.oaId) {
    await verifierUtilisateurOA(compagnieData.oaId);
  }

  const existingCompagnie = await Compagnie.findOne({
    where: { nom: compagnieData.nom },
  });
  if (existingCompagnie) {
    const error = new Error("Cette compagnie existe déjà.");
    error.statusCode = 409;
    throw error;
  }
  const newCompagnie = await Compagnie.create(compagnieData);
  const compagnieResponse = newCompagnie.toJSON();
  return compagnieResponse;
};

export const updateCompagnieService = async (id, compagnieData) => {
  if (Object.keys(compagnieData).length === 0) {
    const error = new Error("Aucune donnée à mettre à jour.");
    error.statusCode = 400;
    throw error;
  }
  if (compagnieData.oaId) {
    await verifierUtilisateurOA(compagnieData.oaId, id);
  }
  if (compagnieData.nom) {
    compagnieData.nom = compagnieData.nom.trim();

    if (!compagnieData.nom) {
      const error = new Error("Le nom de la compagnie est obligatoire.");
      error.statusCode = 400;
      throw error;
    }
    const existingCompagnie = await Compagnie.findOne({
      where: { nom: compagnieData.nom },
    });
    if (existingCompagnie && existingCompagnie.id !== id) {
      const error = new Error("Cette compagnie existe déjà.");
      error.statusCode = 409;
      throw error;
    }
  }
  const compagnie = await Compagnie.findByPk(id);
  if (!compagnie) {
    const error = new Error("Compagnie non trouvée.");
    error.statusCode = 404;
    throw error;
  }
  await compagnie.update(compagnieData);
  const compagnieResponse = compagnie.toJSON();
  return compagnieResponse;
};

export const deleteCompagnieService = async (id) => {
  const compagnie = await Compagnie.findByPk(id);
  if (!compagnie) {
    const error = new Error("Compagnie non trouvée.");
    error.statusCode = 404;
    throw error;
  }
  const sectionCount = await Section.count({
    where: { compagnieId: id },
  });
  if (sectionCount > 0) {
    const error = new Error(
      "Impossible de supprimer une compagnie contenant encore des sections.",
    );
    error.statusCode = 409;
    throw error;
  }
  await compagnie.destroy();
  return;
};

export const getMyCompagnieService = async (userId) => {
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
  if (!user || !user.section || !user.section.compagnie) {
    const error = new Error("Compagnie de l’utilisateur non trouvée.");
    error.statusCode = 404;
    throw error;
  }
  return user.section.compagnie;
};
