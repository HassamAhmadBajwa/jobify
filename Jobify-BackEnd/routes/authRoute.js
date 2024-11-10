import { Router } from "express";
const router = Router();

import {
  validateRegisterInput,
  validateLoginInput,
} from "../middleware/validationMiddleware.js";

import { register, login, logout } from "../controllers/authController.js";

router.post("/register", validateRegisterInput, register);
router.post("/login", validateLoginInput, login);
router.get("/logout", logout);

export default router;
