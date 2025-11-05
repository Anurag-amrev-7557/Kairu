import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redis = null;

export function getRedisClient() {
  if (!redis) {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redis.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis Error:', err);
    });

    // Connect immediately
    redis.connect().catch((err) => {
      console.error('Failed to connect to Redis:', err);
    });
  }

  return redis;
}

// Cache helper functions
export const cache = {
  // Get value from cache
  async get(key) {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  },

  // Set value in cache with optional TTL (in seconds)
  async set(key, value, ttl = 3600) {
    const client = getRedisClient();
    const serialized = JSON.stringify(value);
    if (ttl) {
      await client.setex(key, ttl, serialized);
    } else {
      await client.set(key, serialized);
    }
  },

  // Delete from cache
  async del(key) {
    const client = getRedisClient();
    await client.del(key);
  },

  // Delete multiple keys matching pattern
  async delPattern(pattern) {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  },

  // Check if key exists
  async exists(key) {
    const client = getRedisClient();
    return await client.exists(key);
  },

  // Increment value
  async incr(key) {
    const client = getRedisClient();
    return await client.incr(key);
  },

  // Set with expiry
  async expire(key, seconds) {
    const client = getRedisClient();
    await client.expire(key, seconds);
  },
};

export default getRedisClient;
