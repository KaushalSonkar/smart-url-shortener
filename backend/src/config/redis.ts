import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis client initiating connection');
});

redisClient.on('ready', () => {
  console.log('Redis client connected and ready to use');
});

export const connectRedis = async (): Promise<void> => {
  if (!process.env.REDIS_URL) {
    console.log('Redis URL not set. Running in MongoDB-only mode (Caching disabled).');
    return;
  }
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis server:', error);
  }
};
