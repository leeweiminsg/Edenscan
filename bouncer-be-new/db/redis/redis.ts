import redis from "redis";

import { redisLogger } from "../../logger/logger.js";
import { config } from "../../config/config.js";

export const redisClient = redis.createClient({ url: config.REDIS_URL! });
export let subRedisClient;

redisClient.on("error", (err) =>
  redisLogger.error(`Redis connection error: ${err}`)
);

export const connectRedisClient = async () => {
  try {
    await redisClient.connect();

    // Listen for key expiry
    redisClient.configSet("notify-keyspace-events", "Ex");
  } catch (err) {
    redisLogger.error(`connectRedisClient err: ${err}`);
  }

  redisLogger.info("Redis: connected");
};

export const connectSubRedisClient = async () => {
  try {
    // Subscribing to a channel requires a dedicated stand-alone connection.
    subRedisClient = redisClient.duplicate();
    await subRedisClient.connect();

    // Listen for key expiry
    redisClient.configSet("notify-keyspace-events", "Ex");
  } catch (err) {
    redisLogger.error(`connectSubRedisClient err: ${err}`);
  }

  redisLogger.info("Redis: connected");
};
