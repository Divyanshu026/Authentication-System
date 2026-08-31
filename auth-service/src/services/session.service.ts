import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { redisClient } from '../config/redis.js';
import { configDotenv } from 'dotenv';
import { json } from 'zod';
configDotenv();

export const generateTokens = (userId: string) => {
  // 1. Generate an Access Token (JWT) containing the userId. 
  const secret:any = process.env.JWT_SECRET;
  const accessToken = jwt.sign({userId:userId},secret,{expiresIn:'15m'})
  // Set expiration to 15 minutes. Use process.env.JWT_SECRET.
  
  // 2. Generate a cryptographically secure random string for the Refresh Token (use crypto.randomBytes).
  const refreshToken = crypto.randomBytes(64).toString('hex');
  
  // 3. Return both { accessToken, refreshToken }
  return {accessToken, refreshToken};
};

export const createSession = async (userId: string, refreshToken: string, metadata: any) => {
  // 1. Hash the refresh token before storing it (SHA-256) so if Redis is compromised, tokens are safe.
  const hashedToken = crypto
  .createHash('sha256')
  .update(refreshToken)
  .digest('hex');
  
  // 2. Create a session payload (stringify the userId and metadata).
  const sessionData = JSON.stringify({
    userId,
    metadata
  });

  // 3. Save to Redis with a key like `session:${hashedToken}` and set a TTL (e.g., 7 days).
  const key = `session:${hashedToken}`
  await redisClient.set(
    key,
    sessionData,
    {
        EX : 7 * 24 * 60 * 60
    })
  
};