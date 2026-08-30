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
  "/compagnie/:compagnieId",authJwt,checkRole("administrateur","OA","SOA"),
  getAllSectionsByCompagnie,
);
router.post("/",createSection);
router.get(
  "/me",authJwt,checkRole("administrateur","OA","SOA"),
  getSectionMe,
);
router.get("/:id",authJwt,checkRole("administrateur","OA","SOA"),getSectionById);
router.put("/:id",authJwt,checkRole("administrateur"),updateSection);
router.delete("/:id",authJwt,checkRole("administrateur"), deleteSection);

export default router;
