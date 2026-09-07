import { NextFunction, Request,Response } from "express";
import { loginUser, registerUser } from "../services/auth.services.js";
import { deleteSession } from "../services/session.service.js";
import { requestPasswordReset, executePasswordReset } from '../services/password.service.js';
import { generateVerificationToken, executeEmailVerification } from '../services/verification.service.js';
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
    
    // 1. Extract metadata (User-Agent, IP address) for Redis session tracking.
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
    // 7. Hand off to the global error middleware 
    next(error); 
  }
};

export const logout = async(req:Request, res:Response, next: NextFunction) : Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if(refreshToken) {
        await deleteSession(refreshToken);
      }
      const cookieOptions = {
      httpOnly: true, // Prevents client-side JS from reading the tokens (Mitigates XSS)
      secure: process.env.NODE_ENV === 'production', // Only transmit over HTTPS in prod
      sameSite: 'lax' as const, // Prevents Cross-Site Request Forgery (CSRF)
    };
      res.clearCookie('accessToken', {
        ...cookieOptions
      })
      res.clearCookie('refresToken', {
        ...cookieOptions
      })
      res.status(200).json({
        error: false,
        message: 'Logged out successfully'
      })
    } catch (error) {
      next(error);
    }

}


export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    
    await requestPasswordReset(email);

    res.status(200).json({
      error: false,
      message: 'If an account with that email exists, a reset link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    await executePasswordReset(token, newPassword);

    // Optional: If you updated your Redis logic to track sessions by User ID, 
    // you would call a function here like `deleteAllUserSessions(userId)` 
    // to kick the user out of all other devices.

    res.status(200).json({
      error: false,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });
  } catch (error: any) {
    if (error.message === 'Invalid or expired token') {
      res.status(400).json({ error: true, message: error.message });
      return;
    }
    next(error);
  }
};


export const requestEmailVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.user is populated by the requireAuth middleware
    const userId = req.user!.id; 
    
    await generateVerificationToken(userId);

    res.status(200).json({
      error: false,
      message: 'If your account is unverified, a new verification link has been sent.'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;

    await executeEmailVerification(token);

    res.status(200).json({
      error: false,
      message: 'Email successfully verified.'
    });
  } catch (error: any) {
    if (error.message === 'Invalid or expired verification token') {
      res.status(400).json({ error: true, message: error.message });
      return;
    }
    next(error);
  }
};
