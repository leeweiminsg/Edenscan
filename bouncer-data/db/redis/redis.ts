import redis from "redis";

import { redisLogger } from "../../logger/logger.js";
import { config } from "../../config/config.js";

export const redisClient = redis.createClient({ url: config.REDIS_URL! });

export const connectRedisClient = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    redisLogger.error(`connectRedisClient err: ${err}`);
  }

  redisLogger.info("Redis: connected");
};

redisClient.on("error", (err) =>
  redisLogger.error(`Redis connection error: ${err}`)
);

export const flushDatabase = async () => {
  try {
    await redisClient.flushDb();
  } catch (err) {
    redisLogger.error(`flushDatabase error: ${err}`);
  }

  redisLogger.info("flushDatabase completed");
};
