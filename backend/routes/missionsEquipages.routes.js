import express from "express";
import {
  getMissionsEquipages,
  getMissionEquipageById,
  createMissionEquipage,
  updateMissionEquipage,
  deleteMissionEquipage,
} from "../controller/missionsEquipages.controller.js";

const router = express.Router();

router.get("/", getMissionsEquipages);
router.get("/:id", getMissionEquipageById);
router.post("/", createMissionEquipage);
router.put("/:id", updateMissionEquipage);
router.delete("/:id", deleteMissionEquipage);

export default router;
