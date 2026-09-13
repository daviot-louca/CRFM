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
import checkRole from "../middlewares/permissions.middleware.js";
const router = express.Router();

router.get(
  "/",
  authJwt,
  checkRole("administrateur"),
  getMissionsUsers
);

router.get(
  "/groupes/:missionGroupeId",
  authJwt,
  checkRole("administrateur","OAL","SOA"),
  getMissionUsersByGroup
);

router.get(
  "/:id",
  authJwt,
  checkRole("administrateur","OAL","SOA"),
  getMissionUserById
);

router.post(
  "/",
  authJwt,
  checkRole("administrateur","OAL","SOA"),
  createMissionUser
);

router.put(
  "/:id",
  authJwt,
  checkRole("administrateur","OAL","SOA"),
  updateMissionUser
);

router.patch(
  "/:id/groupe",
  authJwt,
  checkRole("administrateur","OAL","SOA"),
  assignMissionUserToGroup
);

router.delete(
  "/:id/groupe",
  authJwt,
  checkRole("administrateur"),
  removeMissionUserFromGroup
);

router.delete(
  "/:id",
  authJwt,
  checkRole("administrateur"),
  deleteMissionUser
);

export default router;