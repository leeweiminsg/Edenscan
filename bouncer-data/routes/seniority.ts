import express from "express";
import cors from "cors";
import { validationResult } from "express-validator";
import createError from "http-errors";
import _ from "lodash";
import { getSeniorityOverviewERC721 } from "@0xkomada/bouncer-db";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import { checkDataInCache } from "../middleware/seniority.js";
import { setSeniorityRouterCache } from "../db/redis/access/seniorityRouter.js";
import { validate, validateProjectParam } from "../middleware/validator.js";

export const seniorityRouter = express.Router();

const BASE_URL = "/";

seniorityRouter.options(BASE_URL, cors(config.CORS_OPTIONS)); // enable pre-flight request

seniorityRouter.use(BASE_URL, cors(config.CORS_OPTIONS));

seniorityRouter.get(
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

    genericLogger.info(`seniorityRouter request received: ${projectName}`);

    let seniority;
    try {
      seniority = await getSeniorityOverviewERC721(dbConn);

      // Add to cache (cache aside)
      await setSeniorityRouterCache(projectName, seniority);
    } catch (err) {
      genericLogger.error(`seniorityRouter error: ${err}`);

      res.send(createError(500));

      return;
    }

    res.send(seniority);

    return;
  }
);
