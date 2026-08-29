import { Router } from "express";
import {
  addConducteurPlein,
  getConducteurPleins,
  getConducteurVehiculeDetail,
  getConducteurVehicules,
  saveConducteurReleve,
} from "../controller/conducteur.controller.js";
import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js";

const router = Router();

router.get("/vehicules",authJwt,checkRole("conducteur"), getConducteurVehicules);
router.get("/vehicules/:missionVehiculeId",authJwt,checkRole("conducteur"), getConducteurVehiculeDetail);
router.put("/vehicules/:missionVehiculeId/releve",authJwt,checkRole("conducteur"), saveConducteurReleve);
router.get("/vehicules/:missionVehiculeId/pleins",authJwt,checkRole("conducteur"), getConducteurPleins);
router.post("/vehicules/:missionVehiculeId/pleins",authJwt,checkRole("conducteur"), addConducteurPlein);

export default router;
