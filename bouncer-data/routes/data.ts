import express from "express";
import cors from "cors";
import { validationResult } from "express-validator";
import createError from "http-errors";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import { checkDataInCache } from "../middleware/data.js";
import { getProject } from "@0xkomada/bouncer-db";
import { setDataRouterCache } from "../db/redis/access/dataRouter.js";
import { validate, validateProjectParam } from "../middleware/validator.js";

export const dataRouter = express.Router();

const BASE_URL = "/";

dataRouter.options(BASE_URL, cors(config.CORS_OPTIONS)); // enable pre-flight request

dataRouter.use(BASE_URL, cors(config.CORS_OPTIONS));

const process = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.send(createError(500));

    return;
  }

  const projectName = req.params!.projectParam;

  genericLogger.info(`dataRouter request received: ${projectName}`);

  let project;
  try {
    project = await getProject(dbConn, projectName);

    // Add to cache (cache aside)
    await setDataRouterCache(projectName, project);
  } catch (err) {
    genericLogger.error(`dataRouter error: ${err}`);

    res.send(createError(500));

    return;
  }

  res.send(project);

  return;
};

dataRouter.get(
  "/:projectParam",
  validateProjectParam(),
  validate,
  checkDataInCache,
  process
);

dataRouter.get(
  "/erc721/:projectParam",
  validateProjectParam(),
  validate,
  checkDataInCache,
  process
);
