import { redisClient } from "../redis.js";
import { redisLogger } from "../../../logger/logger.js";

export const DIAMOND_HANDS_ROUTER_KEY_NAME = "diamondhandsrouter:";

const getDiamondHandsRouterKeyName = (projectName: string) => {
  return `${DIAMOND_HANDS_ROUTER_KEY_NAME}${projectName}`;
};

export const getDiamondHandsRouterCache = async (projectName: string) => {
  try {
    let diamondHandsRouterCache = await redisClient.get(
      getDiamondHandsRouterKeyName(projectName)
    );
    diamondHandsRouterCache = JSON.parse(diamondHandsRouterCache!);

    redisLogger.info(`getDiamondHandsRouterCache ${projectName} completed`);

    return diamondHandsRouterCache;
  } catch (err) {
    redisLogger.error(`getDiamondHandsRouterCache error: ${err}`);

    throw err;
  }
};

export const setDiamondHandsRouterCache = async (
  projectName: string,
  project: any
) => {
  try {
    await redisClient.set(
      getDiamondHandsRouterKeyName(projectName),
      JSON.stringify(project)
    );
    // TTL: 1 day = 86400 s
    redisClient.expire(getDiamondHandsRouterKeyName(projectName), 86400);

    redisLogger.info(`setDiamondHandsRouterCache ${projectName} completed`);
  } catch (err) {
    redisLogger.error(`setDiamondHandsRouterCache error: ${err}`);

    throw err;
  }
};
