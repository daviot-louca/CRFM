

import express from "express";
import { getRoles } from "../controller/role.controller.js";
import authJwt from "../middlewares/auth.middleware.js";
import checkRole from "../middlewares/permissions.middleware.js";

const router = express.Router();

router.get("/",authJwt,checkRole("administrateur"), getRoles);

export default router;