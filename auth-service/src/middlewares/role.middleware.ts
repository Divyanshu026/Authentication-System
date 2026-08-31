import { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Check if req.user exists (this middleware MUST be placed after requireAuth)
    if (!req.user) {
      res.status(401).json({ error: true, message: 'Authentication required' });
      return;
    }

    // 2. Check if req.user.role is inside the allowedRoles array
    if (!allowedRoles.includes(req.user.role)) {
      // 403 Forbidden means "I know who you are, but you don't have clearance."
      res.status(403).json({ error: true, message: 'Access denied: Insufficient permissions' });
      return;
    }

    // 3. User has the correct role. Let them pass.
    next();
  };
};