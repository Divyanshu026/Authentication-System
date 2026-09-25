import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import jwt from 'jsonwebtoken';

const { JsonWebTokenError, TokenExpiredError } = jwt;

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Handle our custom Operational Errors (AppError)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: true, message: err.message });
    return;
  }

  // 2. Handle Zod Validation Errors (from our validate middleware)
  if (err instanceof ZodError) {
    const issues = err.issues.map(i => `${i.path.join('.')}: ${i.message}`);
    res.status(400).json({ error: true, message: 'Validation failed', details: issues });
    return;
  }

  // 3. Handle PostgreSQL Unique Constraint Violations (e.g., duplicate email)
  // '23505' is the standard Postgres error code for unique_violation
  if (err.code === '23505') {
    res.status(409).json({ error: true, message: 'Resource already exists' });
    return;
  }

  // 4. Handle Cryptographic JWT Errors
  if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    res.status(401).json({ error: true, message: 'Invalid or expired token' });
    return;
  }

  // 5. Fallback: Unhandled / Programming Errors (Database down, syntax error, etc.)
  console.error('UNHANDLED SYSTEM ERROR:', err);
  
  res.status(500).json({ 
    error: true, 
    message: 'Internal Server Error' 
  });
};