import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error('REDIS_URL is missing in environment variables');

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
    await redisClient.connect();
    console.log("Redis connected successfully");
};
