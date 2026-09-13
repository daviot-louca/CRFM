import express from "express";

import {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  updateMissionGroupes,
  updateMissionVehicules,
  updateMissionConducteurs,
  updateMissionCommandement,
  deleteMission,
} from "../controller/missions.controller.js";

import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js";
const router = express.Router();

router.get(
  "/",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  getMissions
);

router.post(
  "/",
  authJwt,
  checkRole("administrateur"),
  createMission
);

router.get(
  "/:id",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  getMissionById
);

router.put(
  "/:id",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  updateMission
);

router.put(
  "/:id/groupes",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  updateMissionGroupes
);

router.put(
  "/:id/vehicules",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  updateMissionVehicules
);

router.put(
  "/:id/conducteurs",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  updateMissionConducteurs
);

router.put(
  "/:id/commandement",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  updateMissionCommandement
);

router.delete(
  "/:id",
  authJwt,
  checkRole("administrateur"),
  deleteMission
);

export default router;