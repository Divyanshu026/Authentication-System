import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { registerSchema } from "../schemas/auth.schema.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

// post

router.post('/register',validate(registerSchema),register);

export default router;