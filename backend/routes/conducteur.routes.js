import { Router } from "express";
import {
  addConducteurPlein,
  getConducteurPleins,
  getConducteurVehiculeDetail,
  getConducteurVehicules,
  saveConducteurReleve,
} from "../controller/conducteur.controller.js";

const router = Router();

router.get("/vehicules", getConducteurVehicules);
router.get("/vehicules/:missionVehiculeId", getConducteurVehiculeDetail);
router.put("/vehicules/:missionVehiculeId/releve", saveConducteurReleve);
router.get("/vehicules/:missionVehiculeId/pleins", getConducteurPleins);
router.post("/vehicules/:missionVehiculeId/pleins", addConducteurPlein);

export default router;
