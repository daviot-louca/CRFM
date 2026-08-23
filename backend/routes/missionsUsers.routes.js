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

const router = express.Router();

router.get("/", getMissionsUsers);
router.get("/groupes/:missionGroupeId", getMissionUsersByGroup);
router.get("/:id", getMissionUserById);
router.post("/", createMissionUser);
router.put("/:id", updateMissionUser);
router.patch("/:id/groupe", assignMissionUserToGroup);
router.delete("/:id/groupe", removeMissionUserFromGroup);
router.delete("/:id", deleteMissionUser);

export default router;
