import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { validate } from "../middlewares/validate.middleware.js";
import { getMe } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// post

router.post('/register',validate(registerSchema),register);
router.post('/login',validate(loginSchema),login);
router.post('/me',requireAuth,getMe);

export default router;