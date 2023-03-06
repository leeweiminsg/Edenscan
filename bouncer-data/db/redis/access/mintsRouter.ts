import { redisClient } from "../redis.js";
import { redisLogger } from "../../../logger/logger.js";

export const MINTS_ROUTER_KEY_NAME = "mintsrouter:";
export const CUMULATIVE_MINTS_ROUTER_KEY_NAME = "cumulativemintsrouter:";

const getMintsRouterKeyName = (projectName: string) => {
  return `${MINTS_ROUTER_KEY_NAME}${projectName}`;
};

const getCumulativeMintsRouterKeyName = (projectName: string) => {
  return `${CUMULATIVE_MINTS_ROUTER_KEY_NAME}${projectName}`;
};

export const getMintsRouterCache = async (projectName: string) => {
  try {
    let mintsRouterCache = await redisClient.get(
      getMintsRouterKeyName(projectName)
    );
    mintsRouterCache = JSON.parse(mintsRouterCache!);

    redisLogger.info(`getMintsRouterCache ${projectName} completed`);

    return mintsRouterCache;
  } catch (err) {
    redisLogger.error(`getMintsRouterCache error: ${err}`);

    throw err;
  }
};

export const setMintsRouterCache = async (
  projectName: string,
  project: any
) => {
  try {
    await redisClient.set(
      getMintsRouterKeyName(projectName),
      JSON.stringify(project)
    );
    // TTL: 1 day = 86400 s
    redisClient.expire(getMintsRouterKeyName(projectName), 86400);

    redisLogger.info(`setMintsRouterCache ${projectName} completed`);
  } catch (err) {
    redisLogger.error(`setMintsRouterCache error: ${err}`);

    throw err;
  }
};

export const getCumulativeMintsRouterCache = async (projectName: string) => {
  try {
    let cumulativeMintsRouterCache = await redisClient.get(
      getCumulativeMintsRouterKeyName(projectName)
    );
    cumulativeMintsRouterCache = JSON.parse(cumulativeMintsRouterCache!);

    redisLogger.info(`getCumulativeMintsRouterCache ${projectName} completed`);

    return cumulativeMintsRouterCache;
  } catch (err) {
    redisLogger.error(`getCumulativeMintsRouterCache error: ${err}`);

    throw err;
  }
};

export const setCumulativeMintsRouterCache = async (
  projectName: string,
  project: any
) => {
  try {
    await redisClient.set(
      getCumulativeMintsRouterKeyName(projectName),
      JSON.stringify(project)
    );
    // TTL: 1 day = 86400 s
    redisClient.expire(getCumulativeMintsRouterKeyName(projectName), 86400);

    redisLogger.info(`setCumulativeMintsRouterCache ${projectName} completed`);
  } catch (err) {
    redisLogger.error(`setCumulativeMintsRouterCache error: ${err}`);

    throw err;
  }
};
