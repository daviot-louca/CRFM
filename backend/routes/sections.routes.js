import { Router } from "express";
import {
  getAllSectionsByCompagnie,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  getSectionMe,
} from "../controller/sections.controller.js";

const router = Router();

router.get(
  "/compagnie/:compagnieId",
  getAllSectionsByCompagnie,
);
router.post("/",createSection);
router.get(
  "/me",
  getSectionMe,
);
router.get("/:id",getSectionById);
router.put("/:id",updateSection);
router.delete("/:id", deleteSection);

export default router;
