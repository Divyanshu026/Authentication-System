import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { getMe } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { register, login, logout, forgotPassword, resetPassword, verifyEmail, requestEmailVerification, refreshToken } from '../controllers/auth.controller.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../schemas/auth.schema.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { requireVerified } from "../middlewares/verified.middleware.js";


const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Divyanshu Shukla
 *               email:
 *                 type: string
 *                 example: test@system.local
 *               password:
 *                 type: string
 *                 example: SuperSecurePassword123!
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Invalid payload formatting
 *       409:
 *         description: Email already in use
 *       429:
 *         description: Too many requests
 */
router.post('/register',authLimiter,validate(registerSchema),register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user and return tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@system.local
 *               password:
 *                 type: string
 *                 example: SuperSecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests
 */
router.post('/login',authLimiter,validate(loginSchema),login);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate session/tokens
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
router.post('/logout',requireAuth,logout)
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retrieve current authenticated user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized - Missing or invalid token
 */
router.get('/me',requireAuth,getMe);

router.post('/forgot-password',authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

router.post('/verify-email', authLimiter, validate(verifyEmailSchema), verifyEmail);
router.post('/verify-email/resend', authLimiter, requireAuth, requestEmailVerification);

router.post('/refresh', authLimiter, refreshToken)

// router.post('/transfer-funds',requireAuth, requireVerified,transferfundController)

export default router;