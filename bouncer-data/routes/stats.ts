import express from "express";
import cors from "cors";
import { validationResult } from "express-validator";
import createError from "http-errors";
import _ from "lodash";
import { getStats, getStatsERC721 } from "@0xkomada/bouncer-db";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import { checkDataInCache } from "../middleware/stats.js";
import { setStatsRouterCache } from "../db/redis/access/statsRouter.js";
import { validate, validateProjectParam } from "../middleware/validator.js";

export const statsRouter = express.Router();

const BASE_URL = "/";

statsRouter.options(BASE_URL, cors(config.CORS_OPTIONS)); // enable pre-flight request

statsRouter.use(BASE_URL, cors(config.CORS_OPTIONS));

statsRouter.get(
  "/:projectParam",
  validateProjectParam(),
  validate,
  checkDataInCache,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send(createError(500));

      return;
    }

    const projectName = req.params!.projectParam;

    genericLogger.info(`statsRouter request received: ${projectName}`);

    let stats;
    try {
      stats = await getStats(dbConn, projectName);

      // Add to cache (cache aside)
      await setStatsRouterCache(projectName, stats);
    } catch (err) {
      genericLogger.error(`statsRouter error: ${err}`);

      res.send(createError(500));

      return;
    }

    res.send(stats);

    return;
  }
);

statsRouter.get(
  "/erc721/:projectParam",
  validateProjectParam(),
  validate,
  checkDataInCache,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send(createError(500));

      return;
    }

    const projectName = req.params!.projectParam;

    genericLogger.info(`statsRouter request received: ${projectName}`);

    let stats;
    try {
      stats = await getStatsERC721(dbConn);

      // Add to cache (cache aside)
      await setStatsRouterCache(projectName, stats);
    } catch (err) {
      genericLogger.error(`statsRouter error: ${err}`);

      res.send(createError(500));

      return;
    }

    res.send(stats);

    return;
  }
);
