import { redisClient } from "../redis.js";
import { redisLogger } from "../../../logger/logger.js";

export const DATA_ROUTER_KEY_NAME = "datarouter:";

const getDataRouterKeyName = (projectName: string) => {
  return `${DATA_ROUTER_KEY_NAME}${projectName}`;
};

export const getDataRouterCache = async (projectName: string) => {
  try {
    let dataRouterCache = await redisClient.get(
      getDataRouterKeyName(projectName)
    );
    dataRouterCache = JSON.parse(dataRouterCache!);

    redisLogger.info(`getDataRouterCache ${projectName} completed`);

    return dataRouterCache;
  } catch (err) {
    redisLogger.error(`getDataRouterCache error: ${err}`);

    throw err;
  }
};

export const setDataRouterCache = async (projectName: string, project: any) => {
  try {
    await redisClient.set(
      getDataRouterKeyName(projectName),
      JSON.stringify(project)
    );
    // TTL: 1 day = 86400 s
    redisClient.expire(getDataRouterKeyName(projectName), 86400);

    redisLogger.info(`setDataRouterCache ${projectName} completed`);
  } catch (err) {
    redisLogger.error(`setDataRouterCache error: ${err}`);

    throw err;
  }
};
