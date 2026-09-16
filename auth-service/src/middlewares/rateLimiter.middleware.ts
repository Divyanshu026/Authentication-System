import rateLimit from 'express-rate-limit';

// 1. General API Limiter: 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: true,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

// 2. Strict Auth Limiter: 5 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 25, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }
});