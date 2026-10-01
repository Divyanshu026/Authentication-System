import cookieParser from "cookie-parser";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import adminRoutes from "./routes/admin.routes.js"
import {  globalLimiter } from './middlewares/rateLimiter.middleware.js';
import { setupSwagger } from './config/swagger.js';
import helmet from 'helmet';
import cors from 'cors';
import db from './config/db.js';
import { redisClient } from './config/redis.js';

const app = express();

// 1. CRITICAL: Trust the reverse proxy to get the real client IP
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Only allow your frontend
  credentials: true, // CRITICAL: Required to allow your HttpOnly cookies to pass through
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    await redisClient.ping();
    res.status(200).json({ status: 'Server is up', timeStamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ error: true, status: 'Dependencies unavailable' });
  }
})

setupSwagger(app);

// routes
app.use('/auth',authRoutes);
app.use('/admin', globalLimiter, adminRoutes)
app.use(globalErrorHandler);

export default app;