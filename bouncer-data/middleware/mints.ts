import createError from "http-errors";

import { genericLogger } from "../logger/logger.js";
import {
  getMintsRouterCache,
  getCumulativeMintsRouterCache,
} from "../db/redis/access/mintsRouter.js";

export const checkDataInCache = async (req, res, next) => {
  const projectName = req.params!.projectParam;

  genericLogger.info(`checkDataInCache request received: ${projectName}`);

  let data;
  try {
    data = await getMintsRouterCache(projectName);
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

export const checkCumMintDataInCache = async (req, res, next) => {
  const projectName = req.params!.projectParam;

  genericLogger.info(
    `checkCumMintDataInCache request received: ${projectName}`
  );

  let data;
  try {
    data = await getCumulativeMintsRouterCache(projectName);
  } catch (err) {
    genericLogger.error(`checkCumMintDataInCache error: ${err}`);

    res.send(createError(500));

    return;
  }

  if (data == null) {
    genericLogger.info(`checkCumMintDataInCache: ${projectName} no cache`);

    next();

    return;
  }

  res.send(data);
};
