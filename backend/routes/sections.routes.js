import { Router } from "express";
import {
  getAllSectionsByCompagnie,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getSectionMe,
} from "../controller/sections.controller.js";
import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js";


const router = Router();

router.get(
  "/compagnie/:compagnieId",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  getAllSectionsByCompagnie,
);

router.post(
  "/",
  authJwt,
  checkRole("administrateur"),
  createSection,
);

router.get(
  "/me",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  getSectionMe,
);

router.get(
  "/:id",
  authJwt,
  checkRole("administrateur", "OAL", "SOA"),
  getSectionById,
);

router.put(
  "/:id",
  authJwt,
  checkRole("administrateur"),
  updateSection,
);

router.delete(
  "/:id",
  authJwt,
  checkRole("administrateur"),
  deleteSection,
);

export default router;