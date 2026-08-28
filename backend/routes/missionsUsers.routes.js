import express from "express";
import {
  getMissionsUsers,
  getMissionUserById,
  createMissionUser,
  updateMissionUser,
  deleteMissionUser,
  assignMissionUserToGroup,
  removeMissionUserFromGroup,
  getMissionUsersByGroup,
} from "../controller/missionUser.controller.js";
import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js"
const router = express.Router();

router.get("/",authJwt,checkRole("administrateur"), getMissionsUsers);
router.get("/groupes/:missionGroupeId",authJwt,checkRole("administrateur"), getMissionUsersByGroup);
router.get("/:id",authJwt,checkRole("administrateur"), getMissionUserById);
router.post("/",authJwt,checkRole("administrateur"), createMissionUser);
router.put("/:id",authJwt,checkRole("administrateur"), updateMissionUser);
router.patch("/:id/groupe",authJwt,checkRole("administrateur"), assignMissionUserToGroup);
router.delete("/:id/groupe",authJwt,checkRole("administrateur"), removeMissionUserFromGroup);
router.delete("/:id",authJwt,checkRole("administrateur"), deleteMissionUser);

export default router;
