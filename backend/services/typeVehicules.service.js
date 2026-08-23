import VehiculeType from "../models/vehicules-types.model.js";
import Vehicule from "../models/vehicule.model.js";
import { Op } from "sequelize";

export const getTypeVehiculesService = async () => {
  return VehiculeType.findAll();
};

export const getTypeVehiculeByIdService = async (id) => {
  const typeVehicule = await VehiculeType.findByPk(id);

  if (!typeVehicule) {
    const error = new Error("Type de véhicule introuvable.");
    error.statusCode = 404;
    throw error;
  }

  return typeVehicule;
};

export const createTypeVehiculeService = async (data) => {
  if (!data.typeName?.trim()) {
    const error = new Error("Le nom du type de véhicule est obligatoire.");
    error.statusCode = 400;
    throw error;
  }

  if (!data.EMAT8?.trim()) {
    const error = new Error("Le code EMAT8 est obligatoire.");
    error.statusCode = 400;
    throw error;
  }

  data.typeName = data.typeName.trim();
  data.EMAT8 = data.EMAT8.trim();

  const existingType = await VehiculeType.findOne({
    where: {
      [Op.or]: [{ typeName: data.typeName }, { EMAT8: data.EMAT8 }],
    },
  });

  if (existingType) {
    const error = new Error("Ce type de véhicule existe déjà.");
    error.statusCode = 409;
    throw error;
  }

  const newType = await VehiculeType.create(data);

  return newType.toJSON();
};

export const updateTypeVehiculeService = async (id, data) => {
  if (!data || Object.keys(data).length === 0) {
    const error = new Error("Aucune donnée à mettre à jour.");
    error.statusCode = 400;
    throw error;
  }

  const typeVehicule = await getTypeVehiculeByIdService(id);

  if (data.typeName !== undefined) {
    data.typeName = data.typeName.trim();

    if (!data.typeName) {
      const error = new Error("Le nom du type de véhicule est obligatoire.");
      error.statusCode = 400;
      throw error;
    }

    const existingType = await VehiculeType.findOne({
      where: {
        typeName: data.typeName,
        id: {
          [Op.ne]: id,
        },
      },
    });

    if (existingType) {
      const error = new Error("Ce type de véhicule existe déjà.");
      error.statusCode = 409;
      throw error;
    }
  }

  if (data.EMAT8 !== undefined) {
    data.EMAT8 = data.EMAT8.trim();

    if (!data.EMAT8) {
      const error = new Error("Le code EMAT8 est obligatoire.");
      error.statusCode = 400;
      throw error;
    }

    const existingType = await VehiculeType.findOne({
      where: {
        EMAT8: data.EMAT8,
        id: {
          [Op.ne]: id,
        },
      },
    });

    if (existingType) {
      const error = new Error("Ce code EMAT8 existe déjà.");
      error.statusCode = 409;
      throw error;
    }
  }

  await typeVehicule.update(data);

  return typeVehicule.toJSON();
};

export const deleteTypeVehiculeService = async (id) => {
  const typeVehicule = await getTypeVehiculeByIdService(id);

  const vehiculeCount = await Vehicule.count({
    where: {
      vehiculeTypeId: id,
    },
  });

  if (vehiculeCount > 0) {
    const error = new Error(
      "Impossible de supprimer un type de véhicule encore utilisé.",
    );
    error.statusCode = 409;
    throw error;
  }

  await typeVehicule.destroy();

  return;
};
