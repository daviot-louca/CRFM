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

router.get("/",authJwt,checkRole("administrateur","OA","SOA"), getMissionsVehicules);
router.post("/",authJwt,checkRole("administrateur","OA","SOA"), createMissionVehicule);
router.get("/:id",authJwt,checkRole("administrateur","OA","SOA"), getMissionVehiculeById);
router.put("/:id",authJwt,checkRole("administrateur","OA","SOA"), updateMissionVehicule);
router.delete("/:id",authJwt,checkRole("administrateur","OA","SOA"), deleteMissionVehicule);

export default router;
