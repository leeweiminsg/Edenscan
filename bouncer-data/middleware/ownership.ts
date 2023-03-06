import createError from "http-errors";

import { genericLogger } from "../logger/logger.js";
import {
  getOwnershipRouterCache,
  getOwnershipOverviewRouterCache,
} from "../db/redis/access/ownershipRouter.js";

export const checkDataInCache = async (req, res, next) => {
  const projectName = req.params!.projectParam;

  genericLogger.info(`checkDataInCache request received: ${projectName}`);

  let data;
  try {
    data = await getOwnershipRouterCache(projectName);
  } catch (err) {
    genericLogger.error(`checkDataInCache error: ${err}`);

    res.send(createError(500));

    return;
  }

  if (data == null) {
    genericLogger.info(`checkDataInCache: ${projectName} no cache`);

    next();

    return;
  }

  res.send(data);
};

export const checkOverviewDataInCache = async (req, res, next) => {
  const projectName = req.params!.projectParam;

  genericLogger.info(
    `checkOverviewDataInCache request received: ${projectName}`
  );

  let data;
  try {
    data = await getOwnershipOverviewRouterCache(projectName);
  } catch (err) {
    genericLogger.error(`checkOverviewDataInCache error: ${err}`);

    res.send(createError(500));

    return;
  }

  if (data == null) {
    genericLogger.info(`checkOverviewDataInCache: ${projectName} no cache`);

    next();

    return;
  }

  res.send(data);
};
