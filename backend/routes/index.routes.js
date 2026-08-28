import express from "express";
import userRoutes from "./user.routes.js";
import compagnieRoutes from "./compagnie.routes.js";
import sectionRoutes from "./sections.routes.js";
import typeVehiculeRoutes from "./typeVehicules.routes.js";
import vehiculeRoutes from "./vehicules.routes.js";
import missionRoutes from "./missions.routes.js";
import missionUserRoutes from "./missionsUsers.routes.js";
import missionVehiculeRoutes from "./missionsVehicules.routes.js";
import missionEquipageRoutes from "./missionsEquipages.routes.js";
import missionsGroupesRoutes from "./missionsGroupes.routes.js"
import roleRoutes from "./role.routes.js";
import conducteurRoutes from "./conducteur.routes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/compagnies", compagnieRoutes);
router.use("/sections", sectionRoutes);
router.use("/types-vehicules", typeVehiculeRoutes);
router.use("/vehicules", vehiculeRoutes);
router.use("/missions", missionRoutes);
router.use("/missions-users", missionUserRoutes);
router.use("/missions-vehicules", missionVehiculeRoutes);
router.use("/missions-equipages", missionEquipageRoutes);
router.use("/missions-groupes", missionsGroupesRoutes)
router.use("/conducteur", conducteurRoutes);

export default router;
