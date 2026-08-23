import { Op } from "sequelize";
import Mission from "../models/missions.model.js";
import MissionsGroupes from "../models/missionsGroupes.model.js";
import MissionsUsers from "../models/missionsUsers.model.js";
import Section from "../models/sections.model.js";
import User from "../models/user.model.js";

export const getMissionsUsersService = async () => {
  return await MissionsUsers.findAll({
    include: [
      {
        model: Mission,
        as: "mission",
      },
      {
        model: MissionsGroupes,
        as: "missionGroupe",
      },
      {
        model: User,
        as: "user",
        attributes: { exclude: ["password"] },
      },
      {
        model: Section,
        as: "sectionMission",
      },
    ],
  });
};

export const getMissionUserByIdService = async (id) => {
  const missionUser = await MissionsUsers.findByPk(id, {
    include: [
      {
        model: Mission,
        as: "mission",
      },
      {
        model: MissionsGroupes,
        as: "missionGroupe",
      },
      {
        model: User,
        as: "user",
        attributes: { exclude: ["password"] },
      },
      {
        model: Section,
        as: "sectionMission",
      },
    ],
  });

  if (!missionUser) {
    const error = new Error("Affectation du militaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  return missionUser;
};

export const createMissionUserService = async (missionUserData) => {
  if (!missionUserData.missionId || !missionUserData.userId) {
    const error = new Error("La mission et le militaire sont obligatoires.");
    error.statusCode = 400;
    throw error;
  }

  const mission = await Mission.findByPk(missionUserData.missionId);
  if (!mission) {
    const error = new Error("Mission introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findByPk(missionUserData.userId);
  if (!user) {
    const error = new Error("Militaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (missionUserData.sectionId) {
    const section = await Section.findByPk(missionUserData.sectionId);
    if (!section) {
      const error = new Error("Section introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (missionUserData.missionGroupeId) {
    const missionGroupe = await MissionsGroupes.findByPk(missionUserData.missionGroupeId);
    if (!missionGroupe) {
      const error = new Error("Groupe de mission introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  const existingMissionUser = await MissionsUsers.findOne({
    where: {
      missionId: missionUserData.missionId,
      userId: missionUserData.userId,
    },
  });
  if (existingMissionUser) {
    const error = new Error("Ce militaire est déjà affecté à cette mission.");
    error.statusCode = 409;
    throw error;
  }

  const missionUser = await MissionsUsers.create(missionUserData);
  return missionUser.toJSON();
};

export const updateMissionUserService = async (id, missionUserData) => {
  if (Object.keys(missionUserData).length === 0) {
    const error = new Error("Aucune donnée à mettre à jour.");
    error.statusCode = 400;
    throw error;
  }

  const missionUser = await MissionsUsers.findByPk(id);
  if (!missionUser) {
    const error = new Error("Affectation du militaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (missionUserData.missionId) {
    const mission = await Mission.findByPk(missionUserData.missionId);
    if (!mission) {
      const error = new Error("Mission introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (missionUserData.userId) {
    const user = await User.findByPk(missionUserData.userId);
    if (!user) {
      const error = new Error("Militaire introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (missionUserData.sectionId) {
    const section = await Section.findByPk(missionUserData.sectionId);
    if (!section) {
      const error = new Error("Section introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (missionUserData.missionGroupeId) {
    const missionGroupe = await MissionsGroupes.findByPk(missionUserData.missionGroupeId);
    if (!missionGroupe) {
      const error = new Error("Groupe de mission introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  const existingMissionUser = await MissionsUsers.findOne({
    where: {
      missionId: missionUserData.missionId || missionUser.missionId,
      userId: missionUserData.userId || missionUser.userId,
      id: { [Op.ne]: id },
    },
  });
  if (existingMissionUser) {
    const error = new Error("Ce militaire est déjà affecté à cette mission.");
    error.statusCode = 409;
    throw error;
  }

  await missionUser.update(missionUserData);
  return missionUser.toJSON();
};


export const deleteMissionUserService = async (id) => {
  const missionUser = await MissionsUsers.findByPk(id);

  if (!missionUser) {
    const error = new Error("Affectation du militaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  await missionUser.destroy();
};

export const getMissionUsersByGroupService = async (missionGroupeId) => {
  return await MissionsUsers.findAll({
    where: { missionGroupeId },
    include: [
      {
        model: User,
        as: "user",
        attributes: { exclude: ["password"] },
      },
      {
        model: Section,
        as: "sectionMission",
      },
    ],
  });
};

export const assignMissionUserToGroupService = async (id, missionGroupeId) => {
  const missionUser = await MissionsUsers.findByPk(id);

  if (!missionUser) {
    const error = new Error("Affectation du militaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const missionGroupe = await MissionsGroupes.findByPk(missionGroupeId);

  if (!missionGroupe) {
    const error = new Error("Groupe de mission introuvable.");
    error.statusCode = 404;
    throw error;
  }

  await missionUser.update({ missionGroupeId });

  return missionUser;
};

export const removeMissionUserFromGroupService = async (id) => {
  const missionUser = await MissionsUsers.findByPk(id);

  if (!missionUser) {
    const error = new Error("Affectation du militaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  await missionUser.update({ missionGroupeId: null });

  return missionUser;
};
