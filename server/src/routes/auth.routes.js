import express from "express";
import { register, login, getProfile } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";

import {
    validateRegister,
    validateLogin,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post(
    "/register",
    validate(validateRegister),
    register
);

router.post(
    "/login",
    validate(validateLogin),
    login
);

router.get("/profile", authMiddleware, getProfile);

export default router;