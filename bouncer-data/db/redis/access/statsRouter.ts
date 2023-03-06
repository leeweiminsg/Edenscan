import { redisClient } from "../redis.js";
import { redisLogger } from "../../../logger/logger.js";

export const STATS_ROUTER_KEY_NAME = "statsrouter:";

const getStatsRouterKeyName = (projectName: string) => {
  return `${STATS_ROUTER_KEY_NAME}${projectName}`;
};

export const getStatsRouterCache = async (projectName: string) => {
  try {
    let statsRouterCache = await redisClient.get(
      getStatsRouterKeyName(projectName)
    );
    statsRouterCache = JSON.parse(statsRouterCache!);

    redisLogger.info(`getStatsRouterCache ${projectName} completed`);

    return statsRouterCache;
  } catch (err) {
    redisLogger.error(`getStatsRouterCache error: ${err}`);

    throw err;
  }
};

export const setStatsRouterCache = async (
  projectName: string,
  project: any
) => {
  try {
    await redisClient.set(
      getStatsRouterKeyName(projectName),
      JSON.stringify(project)
    );
    // TTL: 1 day = 86400 s
    redisClient.expire(getStatsRouterKeyName(projectName), 86400);

    redisLogger.info(`setStatsRouterCache ${projectName} completed`);
  } catch (err) {
    redisLogger.error(`setStatsRouterCache error: ${err}`);

    throw err;
  }
};
