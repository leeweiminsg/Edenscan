import createError from "http-errors";

import { genericLogger } from "../logger/logger.js";
import { getSeniorityRouterCache } from "../db/redis/access/seniorityRouter.js";

export const checkDataInCache = async (req, res, next) => {
  const projectName = req.params!.projectParam;

  genericLogger.info(`checkDataInCache request received: ${projectName}`);

  let data;
  try {
    data = await getSeniorityRouterCache(projectName);
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
