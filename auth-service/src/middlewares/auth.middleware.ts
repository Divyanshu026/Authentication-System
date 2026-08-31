import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from '../repositories/user.repository.js';
import { configDotenv } from 'dotenv';

configDotenv();

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Extract the 'accessToken' from req.cookies
        const token = req.cookies?.accessToken;
    
    // 2. If no token exists, return 401 Unauthorized (Error message: "Authentication required")
        if(!token) {
            res.status(401).json({
                message: "Authentication required"
            });
            return;
        }
    // 3. Verify the token using jwt.verify() and process.env.JWT_SECRET
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET is missing in environment variables');
        const decoded = jwt.verify(token, secret) as { userId: string };
    // Tip: The decoded payload should contain the { userId } you signed it with in Assignment 6.
        
    // 4. Fetch the user from the database using the decoded userId
        const user = await findUserById(decoded.userId);
    // 5. If the user no longer exists in the DB (e.g., deleted account), return 401 Unauthorized
        if(!user) {
            res.status(401).json({
                message: 'User no longer exists'
            })
            return;
        }
    // 6. Strip the password_hash from the user object
        const {password_hash, ...safeUser} = user
    // 7. Attach the sanitized user object to req.user
        req.user = safeUser;
    // 8. Call next() to allow the request to proceed to the controller
        next();
  } catch (error) {
    // If jwt.verify() fails (expired, tampered), it throws an error. Catch it and return 401.
    res.status(401).json({ error: true, message: 'Invalid or expired token' });
  }
};