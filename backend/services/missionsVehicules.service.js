import { Op } from "sequelize";
import Compagnie from "../models/compagnie.model.js";
import Mission from "../models/missions.model.js";
import MissionsVehicule from "../models/missionsVehicule.model.js";
import Section from "../models/sections.model.js";
import Vehicule from "../models/vehicule.model.js";
import VehiculeType from "../models/vehicules-types.model.js";

const missionVehiculeIncludes = [
  { model: Mission, as: "mission" },
  {
    model: Vehicule,
    as: "vehicule",
    include: [{ model: VehiculeType, as: "vehiculeType" }],
  },
  { model: Compagnie, as: "compagnie" },
  { model: Section, as: "section" },
];

export const getMissionsVehiculesService = async () => {
  return MissionsVehicule.findAll({ include: missionVehiculeIncludes });
};

export const getMissionVehiculeByIdService = async (id) => {
  const missionVehicule = await MissionsVehicule.findByPk(id, {
    include: missionVehiculeIncludes,
  });

  if (!missionVehicule) {
    const error = new Error("Affectation du véhicule introuvable.");
    error.statusCode = 404;
    throw error;
  }

  return missionVehicule;
};

export const createMissionVehiculeService = async (missionVehiculeData) => {
  if (
    !missionVehiculeData.missionId ||
    !missionVehiculeData.vehiculeId ||
    !missionVehiculeData.compagnieId
  ) {
    const error = new Error(
      "La mission, le véhicule et la compagnie sont obligatoires.",
    );
    error.statusCode = 400;
    throw error;
  }

  const mission = await Mission.findByPk(missionVehiculeData.missionId);
  if (!mission) {
    const error = new Error("Mission introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const vehicule = await Vehicule.findByPk(missionVehiculeData.vehiculeId);
  if (!vehicule) {
    const error = new Error("Véhicule introuvable.");
    error.statusCode = 404;
    throw error;
  }
  if (vehicule.disponibilite === false) {
    const error = new Error("Ce véhicule est indisponible.");
    error.statusCode = 409;
    throw error;
  }

  const compagnie = await Compagnie.findByPk(missionVehiculeData.compagnieId);
  if (!compagnie) {
    const error = new Error("Compagnie introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (missionVehiculeData.sectionId) {
    const section = await Section.findByPk(missionVehiculeData.sectionId);
    if (!section) {
      const error = new Error("Section introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  const existingMissionVehicule = await MissionsVehicule.findOne({
    where: {
      missionId: missionVehiculeData.missionId,
      vehiculeId: missionVehiculeData.vehiculeId,
    },
  });
  if (existingMissionVehicule) {
    const error = new Error("Ce véhicule est déjà affecté à cette mission.");
    error.statusCode = 409;
    throw error;
  }

  const newMissionVehicule = await MissionsVehicule.create(missionVehiculeData);
  await vehicule.update({ disponibilite: false });
  return newMissionVehicule.toJSON();
};

export const updateMissionVehiculeService = async (id, missionVehiculeData) => {
  if (Object.keys(missionVehiculeData).length === 0) {
    const error = new Error("Aucune donnée à mettre à jour.");
    error.statusCode = 400;
    throw error;
  }

  const missionVehicule = await MissionsVehicule.findByPk(id);
  if (!missionVehicule) {
    const error = new Error("Affectation du véhicule introuvable.");
    error.statusCode = 404;
    throw error;
  }

  if (missionVehiculeData.missionId) {
    const mission = await Mission.findByPk(missionVehiculeData.missionId);
    if (!mission) {
      const error = new Error("Mission introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (missionVehiculeData.vehiculeId) {
    const vehicule = await Vehicule.findByPk(missionVehiculeData.vehiculeId);
    if (!vehicule) {
      const error = new Error("Véhicule introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (missionVehiculeData.compagnieId) {
    const compagnie = await Compagnie.findByPk(missionVehiculeData.compagnieId);
    if (!compagnie) {
      const error = new Error("Compagnie introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  if (missionVehiculeData.sectionId) {
    const section = await Section.findByPk(missionVehiculeData.sectionId);
    if (!section) {
      const error = new Error("Section introuvable.");
      error.statusCode = 404;
      throw error;
    }
  }

  const existingMissionVehicule = await MissionsVehicule.findOne({
    where: {
      missionId: missionVehiculeData.missionId || missionVehicule.missionId,
      vehiculeId: missionVehiculeData.vehiculeId || missionVehicule.vehiculeId,
      id: { [Op.ne]: id },
    },
  });
  if (existingMissionVehicule) {
    const error = new Error("Ce véhicule est déjà affecté à cette mission.");
    error.statusCode = 409;
    throw error;
  }

  await missionVehicule.update(missionVehiculeData);
  return missionVehicule.toJSON();
};

export const deleteMissionVehiculeService = async (id) => {
  const missionVehicule = await MissionsVehicule.findByPk(id);

  if (!missionVehicule) {
    const error = new Error("Affectation du véhicule introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const vehiculeId = missionVehicule.vehiculeId;

  await missionVehicule.destroy();

  const autreAffectation = await MissionsVehicule.findOne({
    where: { vehiculeId },
  });

  if (!autreAffectation) {
    const vehicule = await Vehicule.findByPk(vehiculeId);
    if (vehicule) {
      await vehicule.update({ disponibilite: true });
    }
  }
};
