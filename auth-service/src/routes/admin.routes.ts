import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

// The Chain of Command:
// 1. requireAuth: Are you logged in? (Sets req.user)
// 2. requireRole: Are you an admin? (Checks req.user.role)
// 3. Controller: Send the classified data.
router.get('/dashboard', requireAuth, requireRole(['ADMIN']), (req: Request, res: Response) => {
  res.status(200).json({
    error: false,
    message: 'Welcome to the Admin Dashboard',
    data: { secretIntel: 'Top 1% Execution' }
  });
});

export default router;