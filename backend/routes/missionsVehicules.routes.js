import express from "express";
const router = express.Router();
import {
  getMissionsVehicules,
  getMissionVehiculeById,
  createMissionVehicule,
  updateMissionVehicule,
  deleteMissionVehicule,
} from "../controller/missionsVehicules.controller.js";

router.get("/", getMissionsVehicules);
router.post("/", createMissionVehicule);
router.get("/:id", getMissionVehiculeById);
router.put("/:id", updateMissionVehicule);
router.delete("/:id", deleteMissionVehicule);

export default router;
