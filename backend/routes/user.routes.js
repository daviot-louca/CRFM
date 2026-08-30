import {
  allUsers,
  allUsersBySection,
  allUsersBySectionWithAvailability,
  allUsersByCompagnie,
  allSoaBySection,
  addUser,
  updateUser,
  deleteUser,
  getUserById,
} from "../controller/user.controller.js";
import { Router } from "express";
import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js";

const router = Router();

router.get("/",authJwt,checkRole("administrateur"),allUsers);
router.get(
  "/section/:sectionId/disponibilites",authJwt,checkRole("administrateur"),
  allUsersBySectionWithAvailability,
);
router.get("/section/:sectionId",authJwt,checkRole("administrateur","OA"), allUsersBySection);
router.get("/compagnie/:compagnieId/oa",authJwt,checkRole("administrateur","OA"), allUsersByCompagnie);
router.get("/section/:sectionId/soa",authJwt,checkRole("administrateur","OA"), allSoaBySection);
router.post("/",authJwt,checkRole("administrateur"),addUser);
router.put("/:id",authJwt,checkRole("administrateur","OA"),updateUser);
router.delete("/:id",authJwt,checkRole("administrateur"),deleteUser);
router.get("/:id",authJwt,checkRole("administrateur"),getUserById);

export default router;
