import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';
import { error } from 'node:console';


// 1. Global Limiter: Protects standard API routes
export const globalLimiter = rateLimit({
  store: new RedisStore({
    // Adapt this depending on your Redis client (node-redis v4 syntax shown below)
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { 
    error: true,
    message: 'Too many requests from this IP, please try again later.'
  }
});


// 2. Strict Auth Limiter: Stops credential stuffing and brute force attacks
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args)
  }),
  windowMs: 15*60*1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: true,
    message: 'Too many authentication attempts. Your IP has been temporarily blocked for 15 minutes.'
  }
})