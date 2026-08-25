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

const router = express.Router();

router.get("/", getMissions);

router.post("/", createMission);

router.get("/:id", getMissionById);

router.put("/:id", updateMission);

router.put("/:id/groupes", updateMissionGroupes);

router.put("/:id/vehicules", updateMissionVehicules);

router.put("/:id/conducteurs", updateMissionConducteurs);

router.delete("/:id", deleteMission);

export default router;
