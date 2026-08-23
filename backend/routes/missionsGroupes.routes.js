

import express from "express";
import {
  getMissionGroupes,
  createMissionGroupe,
  updateMissionGroupe,
  deleteMissionGroupe,
} from "../controller/missionsGroupes.controller.js";

const router = express.Router();

router.get("/:missionId", getMissionGroupes);
router.post("/:missionId", createMissionGroupe);
router.put("/:id", updateMissionGroupe);
router.delete("/:id", deleteMissionGroupe);

export default router;