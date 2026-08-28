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

router.get("/",authJwt,checkRole("administrateur"), getMissionsVehicules);
router.post("/",authJwt,checkRole("administrateur"), createMissionVehicule);
router.get("/:id",authJwt,checkRole("administrateur"), getMissionVehiculeById);
router.put("/:id",authJwt,checkRole("administrateur"), updateMissionVehicule);
router.delete("/:id",authJwt,checkRole("administrateur"), deleteMissionVehicule);

export default router;
