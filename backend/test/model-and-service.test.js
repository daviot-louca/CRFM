import assert from "node:assert/strict";
import test from "node:test";
import { Op } from "sequelize";
import Compagnie from "../models/compagnie.model.js";
import Mission from "../models/missions.model.js";
import Vehicule from "../models/vehicule.model.js";
import VehiculeType from "../models/vehicules-types.model.js";
import "../models/index.js";
import { createMissionService } from "../services/missions.service.js";
import { createTypeVehiculeService } from "../services/typeVehicules.service.js";
import { getAllVehiculeService } from "../services/vehicule.service.js";

test("les modèles exposent les colonnes et les associations attendues", () => {
  assert.ok(Compagnie.rawAttributes.imageUrl);
  assert.ok(Compagnie.rawAttributes.oaId);
  assert.ok(VehiculeType.rawAttributes.EMAT8);
  assert.equal(VehiculeType.rawAttributes.nombreDePlaces, undefined);
  assert.ok(Mission.associations.missionsUsers);
  assert.ok(Mission.associations.missionsVehicules);
  assert.ok(Vehicule.associations.vehiculeType);
});

test("les services utilisent les champs métier persistés", async () => {
  const originalMissionFindOne = Mission.findOne;
  const originalMissionCreate = Mission.create;
  const originalTypeFindOne = VehiculeType.findOne;
  const originalTypeCreate = VehiculeType.create;

  try {
    let missionQuery;
    Mission.findOne = async (options) => {
      missionQuery = options;
      return null;
    };
    Mission.create = async (data) => ({ toJSON: () => data });

    const mission = await createMissionService({
      missionName: "  Exercice Orion  ",
      missionDescription: "Validation des relations",
      debutMission: new Date(),
      finMission: new Date(),
      typeMission: "Exercice",
      lieuMission: "Paris",
      StatutMission: "Prévue",
    });

    assert.equal(mission.missionName, "Exercice Orion");
    assert.deepEqual(missionQuery.where, { missionName: "Exercice Orion" });

    let typeQuery;
    VehiculeType.findOne = async (options) => {
      typeQuery = options;
      return null;
    };
    VehiculeType.create = async (data) => ({ toJSON: () => data });

    const type = await createTypeVehiculeService({
      EMAT8: "  Z102UE01  ",
      typeName: "  Véhicule de test  ",
    });

    assert.equal(type.EMAT8, "Z102UE01");
    assert.equal(type.typeName, "Véhicule de test");
    assert.deepEqual(typeQuery.where[Op.or], [
      { typeName: "Véhicule de test" },
      { EMAT8: "Z102UE01" },
    ]);
  } finally {
    Mission.findOne = originalMissionFindOne;
    Mission.create = originalMissionCreate;
    VehiculeType.findOne = originalTypeFindOne;
    VehiculeType.create = originalTypeCreate;
  }
});

test("la liste des véhicules utilise une jointure Sequelize", async () => {
  const originalFindAll = Vehicule.findAll;

  try {
    let query;
    Vehicule.findAll = async (options) => {
      query = options;
      return [];
    };

    await getAllVehiculeService();

    assert.equal(query.include[0].model, VehiculeType);
    assert.equal(query.include[0].as, "vehiculeType");
    assert.deepEqual(query.include[0].attributes, [
      "id",
      "EMAT8",
      "typeName",
      "UrlImage",
    ]);
  } finally {
    Vehicule.findAll = originalFindAll;
  }
});
