import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
  err: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  
  // 1. Intercept known business logic errors (like auth service throw)
  if (err.message === 'Invalid credentials' || err.message === 'Invalid email or password') {
    res.status(401).json({ 
      error: true, 
      message: 'Invalid email or password' 
    });
    return;
  }

  // 2. Log actual system failures (database down, syntax errors) to your console
  console.error('System Error:', err);

  // 3. Return a generic 500 to the client so you never leak a stack trace
  res.status(500).json({ 
    error: true, 
    message: 'Internal Server Error' 
  });
};