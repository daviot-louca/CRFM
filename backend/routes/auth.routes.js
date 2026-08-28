import express from 'express';
const router = express.Router();
import { loginController } from '../controller/auth.controller.js';

router.post("/login", loginController);

export default router;