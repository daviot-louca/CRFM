import express from "express";
import {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
} from "../controller/missions.controller.js";
const router = express.Router();

router.get("/", getMissions);
router.post("/", createMission);
router.get("/:id", getMissionById);
router.put("/:id", updateMission);
router.delete("/:id", deleteMission);

export default router;
