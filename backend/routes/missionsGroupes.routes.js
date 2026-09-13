import express from "express";
import {
  getMissionGroupes,
  createMissionGroupe,
  updateMissionGroupe,
  deleteMissionGroupe,
} from "../controller/missionsGroupes.controller.js";
import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js";

const router = express.Router();

router.get(
  "/:missionId",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  getMissionGroupes
);

router.post(
  "/:missionId",
  authJwt,
  checkRole("administrateur","OAL","SOA"),
  createMissionGroupe
);

router.put(
  "/:id",
  authJwt,
  checkRole("administrateur","OAL","SOA"),
  updateMissionGroupe
);

router.delete(
  "/:id",
  authJwt,
  checkRole("administrateur","OAL","SOA"),
  deleteMissionGroupe
);

export default router;