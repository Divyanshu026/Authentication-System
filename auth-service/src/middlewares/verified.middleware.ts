import { Request, Response, NextFunction } from 'express';

export const requireVerified = (req: Request, res: Response, next: NextFunction): void => {
  // 1. Ensure requireAuth ran first and attached the user
  if (!req.user) {
    res.status(401).json({ error: true, message: 'Authentication required' });
    return;
  }

  // 2. Check the verification status
  if (!req.user.is_verified) {
    res.status(403).json({ 
      error: true, 
      message: 'Account not verified. Please check your email for the verification link.' 
    });
    return;
  }

  // 3. User is verified, proceed
  next();
};