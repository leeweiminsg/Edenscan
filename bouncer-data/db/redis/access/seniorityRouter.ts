import { redisClient } from "../redis.js";
import { redisLogger } from "../../../logger/logger.js";

export const SENIORITY_ROUTER_KEY_NAME = "seniorityrouter:";

const getSeniorityRouterKeyName = (projectName: string) => {
  return `${SENIORITY_ROUTER_KEY_NAME}${projectName}`;
};

export const getSeniorityRouterCache = async (projectName: string) => {
  try {
    let seniorityRouterCache = await redisClient.get(
      getSeniorityRouterKeyName(projectName)
    );
    seniorityRouterCache = JSON.parse(seniorityRouterCache!);

    redisLogger.info(`getSeniorityRouterCache ${projectName} completed`);

    return seniorityRouterCache;
  } catch (err) {
    redisLogger.error(`getSeniorityRouterCache error: ${err}`);

    throw err;
  }
};

export const setSeniorityRouterCache = async (
  projectName: string,
  project: any
) => {
  try {
    await redisClient.set(
      getSeniorityRouterKeyName(projectName),
      JSON.stringify(project)
    );
    // TTL: 1 day = 86400 s
    redisClient.expire(getSeniorityRouterKeyName(projectName), 86400);

    redisLogger.info(`setSeniorityRouterCache ${projectName} completed`);
  } catch (err) {
    redisLogger.error(`setSeniorityRouterCache error: ${err}`);

    throw err;
  }
};
