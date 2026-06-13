"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
exports.redisClient = (0, redis_1.createClient)({
    url: redisUrl
});
exports.redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});
exports.redisClient.on('connect', () => {
    console.log('Redis client initiating connection');
});
exports.redisClient.on('ready', () => {
    console.log('Redis client connected and ready to use');
});
const connectRedis = async () => {
    if (!process.env.REDIS_URL) {
        console.log('Redis URL not set. Running in MongoDB-only mode (Caching disabled).');
        return;
    }
    try {
        await exports.redisClient.connect();
    }
    catch (error) {
        console.error('Failed to connect to Redis server:', error);
    }
};
exports.connectRedis = connectRedis;
