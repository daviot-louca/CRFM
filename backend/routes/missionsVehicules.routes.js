import express from "express";
const router = express.Router();

import {
  getMissionsVehicules,
  getMissionVehiculeById,
  createMissionVehicule,
  updateMissionVehicule,
  deleteMissionVehicule,
} from "../controller/missionsVehicules.controller.js";

import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js";

router.get(
  "/",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  getMissionsVehicules
);

router.post(
  "/",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  createMissionVehicule
);

router.get(
  "/:id",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  getMissionVehiculeById
);

router.put(
  "/:id",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  updateMissionVehicule
);

router.delete(
  "/:id",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  deleteMissionVehicule
);

export default router;