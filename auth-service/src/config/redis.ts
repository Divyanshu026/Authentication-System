import { createClient } from 'redis';

// 1. Initialize the Redis client using process.env.REDIS_URL
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
  
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// 2. Write an async function to connect to Redis
export const connectRedis = async () => {
    await redisClient.connect();
    console.log("Redis connected successfully");
};
