import cookieParser from "cookie-parser";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import adminRoutes from "./routes/admin.routes.js"
import {  globalLimiter } from './middlewares/rateLimiter.middleware.js';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

// 1. CRITICAL: Trust the reverse proxy to get the real client IP
app.set('trust proxy', 1);

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Only allow your frontend
  credentials: true, // CRITICAL: Required to allow your HttpOnly cookies to pass through
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health',(req,res)=> {
    res.status(200).json({
        status:"Server is up",
        timeStamp: new Date().toISOString()
    })
})

app.use(globalLimiter)

// routes
app.use('/auth',authRoutes);
app.use('/admin',adminRoutes)
app.use(globalErrorHandler);

export default app;