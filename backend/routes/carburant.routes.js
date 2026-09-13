import express from "express";
const router = express.Router();

import {
  getAllCartesCarburant,
  getCarteCarburantById,
} from "../controller/carburant.controller.js";

import authJwt from "../middlewares/auth.middleware.js";

router.get(
  "/",
  authJwt,
  getAllCartesCarburant
);

router.get(
  "/:id",
  authJwt,
  getCarteCarburantById
);

export default router;