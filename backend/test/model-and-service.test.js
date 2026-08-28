import assert from "node:assert/strict";
import test from "node:test";
import { Op } from "sequelize";
import Compagnie from "../models/compagnie.model.js";
import Mission from "../models/missions.model.js";
import Vehicule from "../models/vehicule.model.js";
import VehiculeType from "../models/vehicules-types.model.js";
import {
  MissionsVehicule,
  MissionsVehiculesPlein,
  MissionsVehiculesReleve,
} from "../models/index.js";
import {
  addConducteurPleinService,
  getConducteurVehiculeDetailService,
  getConducteurVehiculesService,
  saveConducteurReleveService,
} from "../services/conducteur.service.js";
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
  assert.ok(MissionsVehicule.associations.releve);
  assert.ok(MissionsVehicule.associations.pleins);
  assert.ok(MissionsVehiculesReleve.rawAttributes.missionVehiculeId);
  assert.ok(MissionsVehiculesPlein.rawAttributes.litres);
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
      "categorie",
      "UrlImage",
    ]);
  } finally {
    Vehicule.findAll = originalFindAll;
  }
});

test("le service conducteur filtre les véhicules par l'utilisateur authentifié", async () => {
  const originalFindAll = MissionsVehicule.findAll;

  try {
    let query;
    MissionsVehicule.findAll = async (options) => {
      query = options;
      return [
        {
          id: "mission-vehicule-a",
          missionId: "mission-a",
          vehiculeId: "vehicule-a",
          conducteurId: "conducteur-a",
          vehicule: {
            id: "vehicule-a",
            vehiculeName: "VAB 01",
            immatriculation: "123-ABC",
            vehiculeType: {
              typeName: "VAB",
            },
          },
          mission: {
            id: "mission-a",
            missionName: "Mission opérationnelle",
          },
          releve: null,
        },
      ];
    };

    const vehicules = await getConducteurVehiculesService("conducteur-a");

    assert.deepEqual(query.where, { conducteurId: "conducteur-a" });
    assert.equal(vehicules.length, 1);
    assert.equal(vehicules[0].missionVehiculeId, "mission-vehicule-a");
    assert.equal(vehicules[0].conducteurId, "conducteur-a");
    assert.equal(vehicules[0].nom, "VAB 01");
  } finally {
    MissionsVehicule.findAll = originalFindAll;
  }
});

test("le détail conducteur refuse un véhicule affecté à un autre conducteur", async () => {
  const originalFindOne = MissionsVehicule.findOne;

  try {
    let query;
    MissionsVehicule.findOne = async (options) => {
      query = options;
      return null;
    };

    await assert.rejects(
      () =>
        getConducteurVehiculeDetailService(
          "mission-vehicule-b",
          "conducteur-a",
        ),
      (error) => {
        assert.equal(error.statusCode, 404);
        return true;
      },
    );

    assert.deepEqual(query.where, {
      id: "mission-vehicule-b",
      conducteurId: "conducteur-a",
    });
  } finally {
    MissionsVehicule.findOne = originalFindOne;
  }
});

test("le service conducteur sauvegarde un relevé cohérent", async () => {
  const originalMissionVehiculeFindOne = MissionsVehicule.findOne;
  const originalReleveFindOne = MissionsVehiculesReleve.findOne;
  const originalReleveCreate = MissionsVehiculesReleve.create;

  try {
    let createdReleve;

    MissionsVehicule.findOne = async () => ({
      id: "mission-vehicule-a",
      missionId: "mission-a",
      vehiculeId: "vehicule-a",
      conducteurId: "conducteur-a",
      vehicule: {
        id: "vehicule-a",
        vehiculeName: "VAB 01",
        immatriculation: "123-ABC",
        vehiculeType: {
          typeName: "VAB",
        },
      },
      mission: {
        id: "mission-a",
        missionName: "Mission opérationnelle",
      },
      pleins: [],
    });
    MissionsVehiculesReleve.findOne = async () => null;
    MissionsVehiculesReleve.create = async (data) => {
      createdReleve = data;
      return {
        id: "releve-a",
        ...data,
      };
    };

    const vehicule = await saveConducteurReleveService(
      "mission-vehicule-a",
      "conducteur-a",
      {
        modeReleve: "kilometre",
        valeurDepart: 12540,
        valeurArrivee: 12680,
      },
    );

    assert.equal(createdReleve.missionVehiculeId, "mission-vehicule-a");
    assert.equal(createdReleve.modeReleve, "kilometre");
    assert.equal(createdReleve.valeurDepart, 12540);
    assert.equal(createdReleve.valeurArrivee, 12680);
    assert.equal(vehicule.releve.statut, "Terminé");
  } finally {
    MissionsVehicule.findOne = originalMissionVehiculeFindOne;
    MissionsVehiculesReleve.findOne = originalReleveFindOne;
    MissionsVehiculesReleve.create = originalReleveCreate;
  }
});

test("le service conducteur refuse une arrivée inférieure au départ", async () => {
  const originalMissionVehiculeFindOne = MissionsVehicule.findOne;
  const originalReleveFindOne = MissionsVehiculesReleve.findOne;

  try {
    MissionsVehicule.findOne = async () => ({
      id: "mission-vehicule-a",
      conducteurId: "conducteur-a",
      pleins: [],
    });
    MissionsVehiculesReleve.findOne = async () => null;

    await assert.rejects(
      () =>
        saveConducteurReleveService("mission-vehicule-a", "conducteur-a", {
          modeReleve: "kilometre",
          valeurDepart: 200,
          valeurArrivee: 150,
        }),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.match(error.message, /inférieure/);
        return true;
      },
    );
  } finally {
    MissionsVehicule.findOne = originalMissionVehiculeFindOne;
    MissionsVehiculesReleve.findOne = originalReleveFindOne;
  }
});

test("le service conducteur conserve plusieurs pleins indépendants", async () => {
  const originalMissionVehiculeFindOne = MissionsVehicule.findOne;
  const originalPleinCreate = MissionsVehiculesPlein.create;

  try {
    const pleinsCrees = [];
    MissionsVehicule.findOne = async () => ({
      id: "mission-vehicule-a",
      conducteurId: "conducteur-a",
    });
    MissionsVehiculesPlein.create = async (data) => {
      pleinsCrees.push(data);
      return {
        id: `plein-${pleinsCrees.length}`,
        ...data,
      };
    };

    const premierPlein = await addConducteurPleinService(
      "mission-vehicule-a",
      "conducteur-a",
      { litres: 40 },
    );
    const deuxiemePlein = await addConducteurPleinService(
      "mission-vehicule-a",
      "conducteur-a",
      { litres: 25 },
    );

    assert.equal(pleinsCrees.length, 2);
    assert.equal(premierPlein.litres, 40);
    assert.equal(deuxiemePlein.litres, 25);
  } finally {
    MissionsVehicule.findOne = originalMissionVehiculeFindOne;
    MissionsVehiculesPlein.create = originalPleinCreate;
  }
});
