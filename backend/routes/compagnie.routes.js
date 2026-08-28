import { Router } from "express";
import {
  getAllCompagnies,
  getCompagnieById,
  createCompagnie,
  updateCompagnie,
  deleteCompagnie,
  getMyCompagnie,
} from "../controller/compagnie.controller.js";
import authJwt from "../middlewares/auth.middleware.js"
import checkRole from "../middlewares/permissions.middleware.js"

const router = Router();

router.get("/",authJwt,checkRole("administrateur"), getAllCompagnies);
router.post("/",authJwt,checkRole("administrateur"), createCompagnie);
router.get("/me",authJwt,checkRole("administrateur"),  getMyCompagnie);
router.get("/:id",authJwt,checkRole("administrateur"), getCompagnieById);
router.put("/:id",authJwt,checkRole("administrateur"), updateCompagnie);
router.delete("/:id",authJwt,checkRole("administrateur"), deleteCompagnie);

export default router;
