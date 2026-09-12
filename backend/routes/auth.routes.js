import express from "express";
const router = express.Router();

import {
  loginController,
  modifierMotDePasseController,
} from "../controller/auth.controller.js";

import { updateMyProfile } from "../controller/user.controller.js";

import authJwt from "../middlewares/auth.middleware.js";

router.post("/login", loginController);
router.put("/me", authJwt, updateMyProfile);
router.put("/password", authJwt, modifierMotDePasseController);

export default router;
