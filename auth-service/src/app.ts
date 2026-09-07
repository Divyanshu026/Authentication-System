import cookieParser from "cookie-parser";
import express from "express";
import { timeStamp } from "node:console";
import authRoutes from "./routes/auth.routes.js";
import { globalErrorHandler } from "./middlewares/error.middleware.js";
import adminRoutes from "./routes/admin.routes.js"
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';


const app = express();

// 1. CRITICAL: Trust the reverse proxy to get the real client IP
app.set('trust proxy', 1);

// 2. Apply the general rate limiter to ALL routes under /api or globally
// We will apply it globally to all routes except the ones that override it.
app.use(apiLimiter);

app.use(express.json());
app.use(cookieParser());

app.get('/health',(req,res)=> {
    res.status(200).json({
        status:"Server is up",
        timeStamp: new Date().toISOString()
    })
})

// routes
app.use('/auth',authRoutes);
app.use('/admin',adminRoutes)
app.use(globalErrorHandler);

export default app;