

import MissionsGroupes from "../models/missionsGroupes.model.js";

export const getByMission = (missionId) => {
  return MissionsGroupes.findAll({
    where: { missionId },
    order: [["ordre", "ASC"]],
  });
};

export const create = (data) => {
  return MissionsGroupes.create(data);
};

export const getById = (id) => {
  return MissionsGroupes.findByPk(id);
};

export const update = async (id, data) => {
  const groupe = await MissionsGroupes.findByPk(id);

  if (!groupe) {
    return null;
  }

  await groupe.update(data);
  return groupe;
};

export const remove = async (id) => {
  const groupe = await MissionsGroupes.findByPk(id);

  if (!groupe) {
    return null;
  }

  await groupe.destroy();
  return true;
};