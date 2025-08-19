const Redis = require('ioredis');
const colors = require('colors');

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    keyPrefix: 'restaurant_app:',
    db: 0
};

// Create Redis client
const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
    console.log('📡 Redis Client Connected'.green.bold);
});

redis.on('ready', () => {
    console.log('✅ Redis Client Ready'.green.bold);
});

redis.on('error', (err) => {
    console.log('❌ Redis Client Error:'.red.bold, err);
});

redis.on('close', () => {
    console.log('🔌 Redis Client Connection Closed'.yellow.bold);
});

redis.on('reconnecting', () => {
    console.log('🔄 Redis Client Reconnecting...'.blue.bold);
});

// Cache helper functions
class CacheService {
    static async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    static async set(key, value, ttl = 3600) {
        try {
            await redis.setex(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    static async del(key) {
        try {
            await redis.del(key);
            return true;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    static async exists(key) {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }

    static async invalidatePattern(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
            return true;
        } catch (error) {
            console.error('Cache pattern invalidation error:', error);
            return false;
        }
    }
}

module.exports = {
    redis,
    CacheService
};
