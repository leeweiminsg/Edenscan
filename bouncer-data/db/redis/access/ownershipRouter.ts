import { redisClient } from "../redis.js";
import { redisLogger } from "../../../logger/logger.js";

export const OWNERSHIP_ROUTER_KEY_NAME = "ownershiprouter:";
export const OWNERSHIP_OVERVIEW_ROUTER_KEY_NAME = "ownershipoverviewrouter:";

const getOwnershipRouterKeyName = (projectName: string) => {
  return `${OWNERSHIP_ROUTER_KEY_NAME}${projectName}`;
};

const getOwnershipOverviewRouterKeyName = (projectName: string) => {
  return `${OWNERSHIP_OVERVIEW_ROUTER_KEY_NAME}${projectName}`;
};

export const getOwnershipRouterCache = async (projectName: string) => {
  try {
    let ownershipRouterCache = await redisClient.get(
      getOwnershipRouterKeyName(projectName)
    );
    ownershipRouterCache = JSON.parse(ownershipRouterCache!);

    redisLogger.info(`getOwnershipRouterCache ${projectName} completed`);

    return ownershipRouterCache;
  } catch (err) {
    redisLogger.error(`getOwnershipRouterCache error: ${err}`);

    throw err;
  }
};

export const setOwnershipRouterCache = async (
  projectName: string,
  project: any
) => {
  try {
    await redisClient.set(
      getOwnershipRouterKeyName(projectName),
      JSON.stringify(project)
    );
    // TTL: 1 day = 86400 s
    redisClient.expire(getOwnershipRouterKeyName(projectName), 86400);

    redisLogger.info(`setOwnershipRouterCache ${projectName} completed`);
  } catch (err) {
    redisLogger.error(`setOwnershipRouterCache error: ${err}`);

    throw err;
  }
};

export const getOwnershipOverviewRouterCache = async (projectName: string) => {
  try {
    let ownershipOverviewRouterCache = await redisClient.get(
      getOwnershipOverviewRouterKeyName(projectName)
    );
    ownershipOverviewRouterCache = JSON.parse(ownershipOverviewRouterCache!);

    redisLogger.info(
      `getOwnershipOverviewRouterCache ${projectName} completed`
    );

    return ownershipOverviewRouterCache;
  } catch (err) {
    redisLogger.error(`getOwnershipOverviewRouterCache error: ${err}`);

    throw err;
  }
};

export const setOwnershipOverviewRouterCache = async (
  projectName: string,
  project: any
) => {
  try {
    await redisClient.set(
      getOwnershipOverviewRouterKeyName(projectName),
      JSON.stringify(project)
    );
    // TTL: 1 day = 86400 s
    redisClient.expire(getOwnershipOverviewRouterKeyName(projectName), 86400);

    redisLogger.info(
      `setOwnershipOverviewRouterCache ${projectName} completed`
    );
  } catch (err) {
    redisLogger.error(`setOwnershipOverviewRouterCache error: ${err}`);

    throw err;
  }
};
