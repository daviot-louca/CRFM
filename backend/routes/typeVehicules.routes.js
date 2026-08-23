import { Router } from "express";
import {
  getTypeVehicules,
  getTypeVehiculeById,
  createTypeVehicule,
  updateTypeVehicule,
  deleteTypeVehicule,
} from "../controller/typeVehicules.controller.js";

const router = Router();

import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js";

router.get("/", authJwt, checkRole("administrateur"), getTypeVehicules);
router.get("/:id", authJwt, checkRole("administrateur"), getTypeVehiculeById);
router.post("/", authJwt, checkRole("administrateur"), createTypeVehicule);
router.put("/:id", authJwt, checkRole("administrateur"), updateTypeVehicule);
router.delete("/:id", authJwt, checkRole("administrateur"), deleteTypeVehicule);
export default router;
