import express from "express";

import {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  updateMissionGroupes,
  updateMissionVehicules,
  updateMissionConducteurs,
  deleteMission,
} from "../controller/missions.controller.js";
import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js";

const router = express.Router();

router.get("/",authJwt,checkRole("administrateur","OA","SOA"), getMissions);

router.post("/",authJwt,checkRole("administrateur"), createMission);

router.get("/:id",authJwt,checkRole("administrateur","OA","SOA"), getMissionById);

router.put("/:id",authJwt,checkRole("administrateur"), updateMission);

router.put("/:id/groupes",authJwt,checkRole("administrateur"), updateMissionGroupes);

router.put("/:id/vehicules",authJwt,checkRole("administrateur","OA","SOA"), updateMissionVehicules);

router.put("/:id/conducteurs",authJwt,checkRole("administrateur","OA","SOA"), updateMissionConducteurs);

router.delete("/:id",authJwt,checkRole("administrateur"), deleteMission);

export default router;
