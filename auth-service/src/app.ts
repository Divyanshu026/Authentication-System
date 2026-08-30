import cookieParser from "cookie-parser";
import express from "express";
import { timeStamp } from "node:console";
import authRoutes from "./routes/auth.routes.js";
const app = express();
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

export default app;