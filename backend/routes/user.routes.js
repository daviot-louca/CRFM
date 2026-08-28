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
router.get("/section/:sectionId",authJwt,checkRole("administrateur"), allUsersBySection);
router.get("/compagnie/:compagnieId/oa",authJwt,checkRole("administrateur"), allUsersByCompagnie);
router.get("/section/:sectionId/soa",authJwt,checkRole("administrateur"), allSoaBySection);
router.post("/",authJwt,checkRole("administrateur"),addUser);
router.put("/:id",authJwt,checkRole("administrateur"),updateUser);
router.delete("/:id",authJwt,checkRole("administrateur"),deleteUser);
router.get("/:id",authJwt,checkRole("administrateur"),getUserById);

export default router;
