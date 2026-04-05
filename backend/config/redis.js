const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  socket: {
    connectTimeout: 3000,
    reconnectStrategy: (retries) => {
      // Stop retry loop quickly so we don't spam logs when Redis is unavailable.
      if (retries >= 3) return false;
      return Math.min((retries + 1) * 200, 1000);
    },
  },
});

let hasLoggedRedisError = false;

redis.on("connect", () => {
  hasLoggedRedisError = false;
  console.log("redis connected");
});

redis.on("error", (error) => {
  if (hasLoggedRedisError) return;
  hasLoggedRedisError = true;
  console.log("error occured while connecting to redis " + error);
  console.log("redis cache disabled for now; app will continue without cache");
});

// Keep cache optional: app continues even if Redis is down.
(async () => {
  try {
    await redis.connect();
  } catch (error) {
    console.log("redis unavailable, continuing without cache " + error);
  }
})();

redis.safeGet = async (key) => {
  if (!redis.isOpen) return null;
  try {
    return await redis.get(key);
  } catch (error) {
    console.log("redis get failed " + error);
    return null;
  }
};

redis.safeSet = async (key, value, ttlSeconds) => {
  if (!redis.isOpen) return;
  try {
    if (ttlSeconds) {
      await redis.set(key, value, { EX: ttlSeconds });
      return;
    }
    await redis.set(key, value);
  } catch (error) {
    console.log("redis set failed " + error);
  }
};

redis.safeDel = async (key) => {
  if (!redis.isOpen) return;
  try {
    await redis.del(key);
  } catch (error) {
    console.log("redis del failed " + error);
  }
};

module.exports = redis;
