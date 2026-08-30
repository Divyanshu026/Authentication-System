import { NextFunction, Request,Response } from "express";
import { loginUser, registerUser } from "../services/auth.services.js";
  
// zod validation for inputs


export const register = async (req: Request, res: Response): Promise<any> => {
    try {
        const {email,password} = req.body;
        if(!email || !password) {
            return res.status(400).json({
                error: true,
                message: "Email and password are required"
            })
        }

        const newUser = await registerUser(email, password);
        return res.status(201).json({
            error: false,
            message: 'User registered successfully',
            data: newUser
        })
    } catch (error:any) {
        return res.status(400).json({
            error: true,
            message: error.message
        })
    }
};


export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // 1. Extract metadata (User-Agent, IP address) for Redis session tracking
    const metadata = {
      userAgent: req.headers['user-agent'] || 'unknown',
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
    };

    // 2. Pass credentials and metadata to the Service layer
    const { accessToken, refreshToken, user } = await loginUser(email, password, metadata);

    // 3. Define uncompromisable cookie configurations
    const cookieOptions = {
      httpOnly: true, // Prevents client-side JS from reading the tokens (Mitigates XSS)
      secure: process.env.NODE_ENV === 'production', // Only transmit over HTTPS in prod
      sameSite: 'lax' as const, // Prevents Cross-Site Request Forgery (CSRF)
    };

    // 4. Set the Access Token cookie (15 minutes TTL)
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, 
    });
    
    // 5. Set the Refresh Token cookie (7 days TTL)
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 6. Send a 200 OK JSON response with the sanitized user data
    res.status(200).json({
      error: false,
      message: 'Login successful',
      data: user
    });
  } catch (error) {
    // 7. Hand off to the global error middleware (Assignment 13)
    next(error); 
  }
};

