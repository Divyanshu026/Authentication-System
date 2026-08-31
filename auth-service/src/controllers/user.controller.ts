import { Request, Response } from 'express';

export const getMe = (req: Request, res: Response): void => {
  // 1. Extract req.user (which is guaranteed to exist because of requireAuth)
    const user = req.user;
  // 2. Return a 200 OK JSON response containing the user data
    res.status(200).json({
        data: user
    })
  
};