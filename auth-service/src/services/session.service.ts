import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { redisClient } from '../config/redis.js';

const refreshTtlSeconds = 7 * 24 * 60 * 60;
const accessTtlSeconds = 15 * 60;

export const generateTokens = (userId: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is missing in environment variables');
  const accessTokenId = crypto.randomUUID();
  const accessToken = jwt.sign({ userId }, secret, { expiresIn: accessTtlSeconds, jwtid: accessTokenId });
  const refreshToken = crypto.randomBytes(64).toString('hex');
  return { accessToken, refreshToken, accessTokenId };
};

export const createSession = async (userId: string, refreshToken: string, metadata: unknown, accessTokenId: string): Promise<void> => {
  const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const sessionKey = `session:${hashedToken}`;
  const sessionData = JSON.stringify({ userId, metadata, accessTokenId });
  await redisClient.set(sessionKey, sessionData, { EX: refreshTtlSeconds });
  await redisClient.sAdd(`user_sessions:${userId}`, sessionKey);
  await redisClient.expire(`user_sessions:${userId}`, refreshTtlSeconds);
  await redisClient.set(`access:${accessTokenId}`, userId, { EX: accessTtlSeconds });
};

export const deleteSession = async (rawRefreshToken: string): Promise<void> => {
  const hashedToken = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const sessionKey = `session:${hashedToken}`;
  const data = await redisClient.get(sessionKey);
  await redisClient.del(sessionKey);
  if (!data) return;
  const sessionData = JSON.parse(data) as { userId?: string; accessTokenId?: string };
  if (sessionData.userId) await redisClient.sRem(`user_sessions:${sessionData.userId}`, sessionKey);
  if (sessionData.accessTokenId) await redisClient.del(`access:${sessionData.accessTokenId}`);
};

export const getSessionUserId = async (rawRefreshToken: string): Promise<string> => {
  const hashedToken = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const data = await redisClient.get(`session:${hashedToken}`);
  if (!data) throw new Error('Session not found or expired');
  const sessionData = JSON.parse(data) as { userId?: string };
  if (!sessionData.userId) throw new Error('Invalid session data');
  return sessionData.userId;
};

export const deleteAllUserSessions = async (userId: string): Promise<void> => {
  const indexKey = `user_sessions:${userId}`;
  const sessionKeys = await redisClient.sMembers(indexKey);
  for (const sessionKey of sessionKeys) {
    const data = await redisClient.get(sessionKey);
    if (!data) continue;
    const sessionData = JSON.parse(data) as { accessTokenId?: string };
    if (sessionData.accessTokenId) await redisClient.del(`access:${sessionData.accessTokenId}`);
  }
  if (sessionKeys.length) await redisClient.del(sessionKeys);
  await redisClient.del(indexKey);
};

export const isAccessTokenActive = async (accessTokenId: string): Promise<boolean> => {
  return (await redisClient.exists(`access:${accessTokenId}`)) === 1;
};