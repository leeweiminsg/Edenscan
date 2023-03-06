import express from "express";
import cors from "cors";
import { validationResult } from "express-validator";
import createError from "http-errors";
import _ from "lodash";
import { getDetailedOwnershipDistributionDiamondHandsERC721 } from "@0xkomada/bouncer-db";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import { checkDataInCache } from "../middleware/diamondHands.js";
import { setDiamondHandsRouterCache } from "../db/redis/access/diamondHandsRouter.js";
import { validate, validateProjectParam } from "../middleware/validator.js";

export const diamondHandsRouter = express.Router();

const BASE_URL = "/";

diamondHandsRouter.options(BASE_URL, cors(config.CORS_OPTIONS)); // enable pre-flight request

diamondHandsRouter.use(BASE_URL, cors(config.CORS_OPTIONS));

diamondHandsRouter.get(
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

    genericLogger.info(`diamondHandsRouter request received: ${projectName}`);

    let diamondHands;
    try {
      diamondHands = await getDetailedOwnershipDistributionDiamondHandsERC721(
        dbConn
      );

      // Add to cache (cache aside)
      await setDiamondHandsRouterCache(projectName, diamondHands);
    } catch (err) {
      genericLogger.error(`diamondHandsRouter error: ${err}`);

      res.send(createError(500));

      return;
    }

    res.send(diamondHands);

    return;
  }
);
