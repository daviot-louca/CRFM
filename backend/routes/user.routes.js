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
const router = Router();

router.get("/",allUsers);
router.get(
  "/section/:sectionId/disponibilites",
  allUsersBySectionWithAvailability,
);
router.get("/section/:sectionId", allUsersBySection);
router.get("/compagnie/:compagnieId/oa", allUsersByCompagnie);
router.get("/section/:sectionId/soa", allSoaBySection);
router.post("/",addUser);
router.put("/:id",updateUser);
router.delete("/:id",deleteUser);
router.get("/:id",getUserById);

export default router;
