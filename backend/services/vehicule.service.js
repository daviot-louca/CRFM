import {
  Vehicule,
  VehiculeType,
  MissionsVehicule,
  Mission,
  Compagnie,
  Section,
} from "../models/index.js";
import { Op } from "sequelize";

const vehiculeTypeInclude = {
  model: VehiculeType,
  as: "vehiculeType",
  attributes: ["id", "EMAT8", "typeName", "categorie", "UrlImage"],
};

const missionVehiculeInclude = {
  model: MissionsVehicule,
  as: "missionsVehicules",
  required: false,
  include: [
    {
      model: Mission,
      as: "mission",
      required: false,
    },
    {
      model: Compagnie,
      as: "compagnie",
      required: false,
    },
    {
      model: Section,
      as: "section",
      required: false,
      attributes: ["id", "sectionName"],
    },
  ],
};

export const getAllVehiculeTypesService = async () => {
  return VehiculeType.findAll({
    attributes: ["id", "EMAT8", "typeName", "categorie", "UrlImage"],
    order: [["typeName", "ASC"]],
  });
};

export const getAllVehiculeService = async () => {
  return Vehicule.findAll({
    include: [vehiculeTypeInclude, missionVehiculeInclude],
  });
};

export const getAvailableVehiculeService = async () => {
  return Vehicule.findAll({
    where: {
      disponibilite: true,
    },
    include: [vehiculeTypeInclude, missionVehiculeInclude],
  });
};

export const getOneVehiculeService = async (id) => {
  const vehicule = await Vehicule.findByPk(id, {
    include: [vehiculeTypeInclude, missionVehiculeInclude],
  });

  if (!vehicule) {
    const error = new Error("Véhicule introuvable.");
    error.statusCode = 404;
    throw error;
  }

  return vehicule;
};

export const createVehiculeService = async (vehiculeData) => {
  if (!vehiculeData.vehiculeName?.trim()) {
    const error = new Error("Le nom du véhicule est obligatoire.");
    error.statusCode = 400;
    throw error;
  }

  vehiculeData.vehiculeName = vehiculeData.vehiculeName.trim();

  if (!vehiculeData.immatriculation?.trim()) {
    const error = new Error("L'immatriculation est obligatoire.");
    error.statusCode = 400;
    throw error;
  }

  vehiculeData.immatriculation = vehiculeData.immatriculation.trim();

  if (!vehiculeData.vehiculeTypeId) {
    const error = new Error("Le type de véhicule est obligatoire.");
    error.statusCode = 400;
    throw error;
  }

  const existingVehicule = await Vehicule.findOne({
    where: { immatriculation: vehiculeData.immatriculation },
  });

  if (existingVehicule) {
    const error = new Error("Cette immatriculation existe déjà.");
    error.statusCode = 409;
    throw error;
  }

  const vehiculeType = await VehiculeType.findByPk(vehiculeData.vehiculeTypeId);

  if (!vehiculeType) {
    const error = new Error("Type de véhicule introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (vehiculeData.kilometrage !== undefined && vehiculeData.kilometrage < 0) {
    const error = new Error("Le kilométrage ne peut pas être négatif.");
    error.statusCode = 400;
    throw error;
  }

  if (vehiculeData.horametre !== undefined && vehiculeData.horametre < 0) {
    const error = new Error("L'horamètre ne peut pas être négatif.");
    error.statusCode = 400;
    throw error;
  }

  const newVehicule = await Vehicule.create(vehiculeData);
  return newVehicule.toJSON();
};

export const updateVehiculeService = async (id, vehiculeData) => {
  if (!vehiculeData || Object.keys(vehiculeData).length === 0) {
    const error = new Error("Aucune donnée à mettre à jour.");
    error.statusCode = 400;
    throw error;
  }

  const vehicule = await Vehicule.findByPk(id);

  if (!vehicule) {
    const error = new Error("Véhicule introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (vehiculeData.vehiculeName !== undefined) {
    if (!vehiculeData.vehiculeName.trim()) {
      const error = new Error("Le nom du véhicule est obligatoire.");
      error.statusCode = 400;
      throw error;
    }
    vehiculeData.vehiculeName = vehiculeData.vehiculeName.trim();
  }

  if (vehiculeData.immatriculation !== undefined) {
    if (!vehiculeData.immatriculation.trim()) {
      const error = new Error("L'immatriculation est obligatoire.");
      error.statusCode = 400;
      throw error;
    }

    vehiculeData.immatriculation = vehiculeData.immatriculation.trim();

    const existingVehicule = await Vehicule.findOne({
      where: {
        immatriculation: vehiculeData.immatriculation,
        id: { [Op.ne]: id },
      },
    });

    if (existingVehicule) {
      const error = new Error("Cette immatriculation existe déjà.");
      error.statusCode = 409;
      throw error;
    }
  }

  if (vehiculeData.vehiculeTypeId) {
    const vehiculeType = await VehiculeType.findByPk(
      vehiculeData.vehiculeTypeId,
    );
    if (!vehiculeType) {
      const error = new Error("Type de véhicule introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (vehiculeData.kilometrage !== undefined && vehiculeData.kilometrage < 0) {
    const error = new Error("Le kilométrage ne peut pas être négatif.");
    error.statusCode = 400;
    throw error;
  }

  if (vehiculeData.horametre !== undefined && vehiculeData.horametre < 0) {
    const error = new Error("L'horamètre ne peut pas être négatif.");
    error.statusCode = 400;
    throw error;
  }

  await vehicule.update(vehiculeData);
  return vehicule.toJSON();
};

export const deleteVehiculeService = async (id) => {
  const vehicule = await Vehicule.findByPk(id);

  if (!vehicule) {
    const error = new Error("Véhicule introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const missionCount = await MissionsVehicule.count({
    where: { vehiculeId: id },
  });

  if (missionCount > 0) {
    const error = new Error(
      "Impossible de supprimer un véhicule encore utilisé dans une mission.",
    );
    error.statusCode = 409;
    throw error;
  }

  await vehicule.destroy();
};
