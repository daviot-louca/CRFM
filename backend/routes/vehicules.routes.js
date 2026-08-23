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

const router = Router();

router.get("/", getAllVehicule);
router.get("/disponibles", getAvailableVehicule);
router.get("/types", getAllVehiculeTypes);
router.get("/:id", getOneVehicule);
router.post("/", createVehicule);
router.put("/:id", updateVehicule);
router.delete("/:id", deleteVehicule);

export default router;
