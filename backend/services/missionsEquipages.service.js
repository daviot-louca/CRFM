import { Op } from "sequelize";
import MissionsEquipages from "../models/missions-equipages.model.js";
import MissionsVehicule from "../models/missionsVehicule.model.js";
import User from "../models/user.model.js";

export const getMissionsEquipagesService = async () => {
  return await MissionsEquipages.findAll({
    include: [
      {
        model: MissionsVehicule,
        as: "missionVehicule",
      },
      {
        model: User,
        as: "user",
        attributes: { exclude: ["password"] },
      },
    ],
  });
};

export const getMissionEquipageByIdService = async (id) => {
  const missionEquipage = await MissionsEquipages.findByPk(id, {
    include: [
      {
        model: MissionsVehicule,
        as: "missionVehicule",
      },
      {
        model: User,
        as: "user",
        attributes: { exclude: ["password"] },
      },
    ],
  });

  if (!missionEquipage) {
    const error = new Error("Membre d'équipage introuvable.");
    error.statusCode = 404;
    throw error;
  }

  return missionEquipage;
};

export const createMissionEquipageService = async (missionEquipageData) => {
  if (
    !missionEquipageData.missionVehiculeId ||
    !missionEquipageData.userId ||
    !missionEquipageData.fonction
  ) {
    const error = new Error(
      "Le véhicule, le militaire et la fonction sont obligatoires.",
    );
    error.statusCode = 400;
    throw error;
  }

  const missionVehicule = await MissionsVehicule.findByPk(
    missionEquipageData.missionVehiculeId,
  );
  if (!missionVehicule) {
    const error = new Error("Affectation du véhicule introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findByPk(missionEquipageData.userId);
  if (!user) {
    const error = new Error("Militaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const existingMissionEquipage = await MissionsEquipages.findOne({
    where: {
      missionVehiculeId: missionEquipageData.missionVehiculeId,
      userId: missionEquipageData.userId,
    },
  });
  if (existingMissionEquipage) {
    const error = new Error("Ce militaire fait déjà partie de cet équipage.");
    error.statusCode = 409;
    throw error;
  }

  const missionEquipage = await MissionsEquipages.create(missionEquipageData);
  return missionEquipage.toJSON();
};

export const updateMissionEquipageService = async (id, missionEquipageData) => {
  if (Object.keys(missionEquipageData).length === 0) {
    const error = new Error("Aucune donnée à mettre à jour.");
    error.statusCode = 400;
    throw error;
  }

  const missionEquipage = await MissionsEquipages.findByPk(id);
  if (!missionEquipage) {
    const error = new Error("Membre d'équipage introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (missionEquipageData.missionVehiculeId) {
    const missionVehicule = await MissionsVehicule.findByPk(
      missionEquipageData.missionVehiculeId,
    );
    if (!missionVehicule) {
      const error = new Error("Affectation du véhicule introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (missionEquipageData.userId) {
    const user = await User.findByPk(missionEquipageData.userId);
    if (!user) {
      const error = new Error("Militaire introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  const existingMissionEquipage = await MissionsEquipages.findOne({
    where: {
      missionVehiculeId:
        missionEquipageData.missionVehiculeId ||
        missionEquipage.missionVehiculeId,
      userId: missionEquipageData.userId || missionEquipage.userId,
      id: { [Op.ne]: id },
    },
  });
  if (existingMissionEquipage) {
    const error = new Error("Ce militaire fait déjà partie de cet équipage.");
    error.statusCode = 409;
    throw error;
  }

  await missionEquipage.update(missionEquipageData);
  return missionEquipage.toJSON();
};

export const deleteMissionEquipageService = async (id) => {
  const missionEquipage = await MissionsEquipages.findByPk(id);

  if (!missionEquipage) {
    const error = new Error("Membre d'équipage introuvable.");
    error.statusCode = 404;
    throw error;
  }

  await missionEquipage.destroy();
};
