import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { getMe } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { register, login, logout, forgotPassword, resetPassword, verifyEmail, requestEmailVerification } from '../controllers/auth.controller.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../schemas/auth.schema.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';


const router = Router();

// post

router.post('/register',authLimiter,validate(registerSchema),register);
router.post('/login',authLimiter,validate(loginSchema),login);
router.post('/logout',requireAuth,logout)
router.get('/me',requireAuth,getMe);

router.post('/forgot-password',authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/verify-email/resend', requireAuth, requestEmailVerification);

export default router;