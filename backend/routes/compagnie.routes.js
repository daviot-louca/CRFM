import { Router } from "express";
import {
  getAllCompagnies,
  getCompagnieById,
  createCompagnie,
  updateCompagnie,
  deleteCompagnie,
  getMyCompagnie,
} from "../controller/compagnie.controller.js";

const router = Router();

router.get("/",getAllCompagnies);
router.post("/",createCompagnie);
router.get("/me", getMyCompagnie);
router.get("/:id",getCompagnieById);
router.put("/:id",updateCompagnie);
router.delete("/:id",deleteCompagnie);

export default router;
