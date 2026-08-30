import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";
import { validate } from "../middlewares/validate.middleware.js";


const router = Router();

// post

router.post('/register',validate(registerSchema),register);
router.post('/login',validate(loginSchema),login);

export default router;