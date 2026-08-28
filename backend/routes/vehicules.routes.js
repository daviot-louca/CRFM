import { Router } from "express";
import {
  getAllVehicule,
  getAvailableVehicule,
  getAllVehiculeTypes,
  getOneVehicule,
  createVehicule,
  updateVehicule,
  deleteVehicule,
} from "../controller/vehicule.controller.js";
import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js";

const router = Router();

router.get("/",authJwt,checkRole("administrateur"), getAllVehicule);
router.get("/disponibles",authJwt,checkRole("administrateur"), getAvailableVehicule);
router.get("/types",authJwt,checkRole("administrateur"), getAllVehiculeTypes);
router.get("/:id",authJwt,checkRole("administrateur"), getOneVehicule);
router.post("/",authJwt,checkRole("administrateur"), createVehicule);
router.put("/:id",authJwt,checkRole("administrateur"), updateVehicule);
router.delete("/:id",authJwt,checkRole("administrateur"), deleteVehicule);

export default router;
