import express from "express";
import rateLimit from "express-rate-limit";

const router = express.Router();

import {
  loginController,
  modifierMotDePasseController,
} from "../controller/auth.controller.js";

import { updateMyProfile } from "../controller/user.controller.js";

import authJwt from "../middlewares/auth.middleware.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de tentatives de connexion. Réessayez plus tard.",
  },
});

router.post(
  "/login",
  loginLimiter,
  loginController
);

router.put(
  "/me",
  authJwt,
  updateMyProfile
);

router.put(
  "/password",
  authJwt,
  modifierMotDePasseController
);

export default router;