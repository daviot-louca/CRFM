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

router.get("/vehicules",authJwt,checkRole("administrateur"), getConducteurVehicules);
router.get("/vehicules/:missionVehiculeId",authJwt,checkRole("administrateur"), getConducteurVehiculeDetail);
router.put("/vehicules/:missionVehiculeId/releve",authJwt,checkRole("administrateur"), saveConducteurReleve);
router.get("/vehicules/:missionVehiculeId/pleins",authJwt,checkRole("administrateur"), getConducteurPleins);
router.post("/vehicules/:missionVehiculeId/pleins",authJwt,checkRole("administrateur"), addConducteurPlein);

export default router;
