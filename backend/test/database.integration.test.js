import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import db, {
  Compagnie,
  Mission,
  MissionsEquipages,
  MissionsUsers,
  MissionsVehicule,
  Section,
  User,
  Vehicule,
  VehiculeType,
} from "../models/index.js";
import { getAllCompagniesService } from "../services/compagnie.service.js";
import { getMissionsService } from "../services/missions.service.js";
import { getMissionsEquipagesService } from "../services/missionsEquipages.service.js";
import { getMissionsUsersService } from "../services/missionUser.service.js";
import { getMissionsVehiculesService } from "../services/missionsVehicules.service.js";
import { getAllVehiculeService } from "../services/vehicule.service.js";

before(async () => {
  await db.sequelize.authenticate();
});

after(async () => {
  await db.sequelize.close();
});

test("le schéma de la base correspond aux modèles Sequelize", async () => {
  const queryInterface = db.sequelize.getQueryInterface();
  const models = [
    Compagnie,
    Mission,
    MissionsEquipages,
    MissionsUsers,
    MissionsVehicule,
    Section,
    User,
    Vehicule,
    VehiculeType,
  ];

  for (const model of models) {
    const columns = await queryInterface.describeTable(model.getTableName());
    for (const attribute of Object.values(model.getAttributes())) {
      const columnName = attribute.field || attribute.fieldName;
      assert.ok(
        columns[columnName],
        `${model.getTableName()}.${columnName} est absent de la base`,
      );
    }
  }
});

test("tous les includes du backend peuvent être exécutés", async () => {
  await Promise.all([
    getAllCompagniesService(),
    getAllVehiculeService(),
    getMissionsService(),
    getMissionsUsersService(),
    getMissionsVehiculesService(),
    getMissionsEquipagesService(),
  ]);
});
