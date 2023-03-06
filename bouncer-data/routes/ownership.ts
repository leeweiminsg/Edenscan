import express from "express";
import cors from "cors";
import { validationResult } from "express-validator";
import createError from "http-errors";
import _ from "lodash";
import {
  getDetailedOwnershipDistribution,
  getOwnershipOverview,
  getOwnershipOverviewERC721,
} from "@0xkomada/bouncer-db";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import {
  checkDataInCache,
  checkOverviewDataInCache,
} from "../middleware/ownership.js";
import {
  setOwnershipOverviewRouterCache,
  setOwnershipRouterCache,
} from "../db/redis/access/ownershipRouter.js";
import { validate, validateProjectParam } from "../middleware/validator.js";
import { toPercent } from "../utils/format.js";

export const ownershipRouter = express.Router();

const BASE_URL = "/";

ownershipRouter.options(BASE_URL, cors(config.CORS_OPTIONS)); // enable pre-flight request

ownershipRouter.use(BASE_URL, cors(config.CORS_OPTIONS));

ownershipRouter.get(
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

    genericLogger.info(`ownershipRouter request received: ${projectName}`);

    let ownership;
    try {
      const users = await getDetailedOwnershipDistribution(dbConn, projectName);

      let total = _.sum(
        Array.from(users.values()).map((owner) =>
          _.sum(Array.from(owner.tokensBalances.values()))
        )
      );

      // Patch for unnecessary tokenIds
      if (projectName === "cryptobengz") {
        total -= 17;
      }

      genericLogger.info(
        `ownershipRouter: ${projectName} totalSupply - ${total} `
      );

      ownership = new Array<any>();
      for (let [walletAddress, owner] of Array.from(users.entries())) {
        // Patch for unnecessary tokenIds
        const realBalance =
          projectName === "cryptobengz" &&
          walletAddress === "0x4e2c5244301689e0375817fb72d4473880544942"
            ? owner.balance() - 17
            : owner.balance();

        ownership.push({
          walletAddress,
          balance: realBalance,
          percentage: toPercent(realBalance, total),
        });
      }

      ownership = _.orderBy(
        ownership,
        ["balance", "walletAddress"],
        ["desc", "asc"]
      );

      // Add to cache (cache aside)
      await setOwnershipRouterCache(projectName, ownership);
    } catch (err) {
      genericLogger.error(`ownershipRouter error: ${err}`);

      res.send(createError(500));

      return;
    }

    res.send(ownership);

    return;
  }
);

ownershipRouter.get(
  "/overview/:projectParam",
  validateProjectParam(),
  validate,
  checkOverviewDataInCache,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send(createError(500));

      return;
    }

    const projectName = req.params!.projectParam;

    genericLogger.info(
      `ownershipRouter (overview) request received: ${projectName}`
    );

    let ownershipOverview;
    try {
      ownershipOverview = await getOwnershipOverview(dbConn, projectName);

      // Add to cache (cache aside)
      await setOwnershipOverviewRouterCache(projectName, ownershipOverview);
    } catch (err) {
      genericLogger.error(`ownershipRouter (overview) error: ${err}`);

      res.send(createError(500));

      return;
    }

    res.send(ownershipOverview);

    return;
  }
);

ownershipRouter.get(
  "/overview/erc721/:projectParam",
  validateProjectParam(),
  validate,
  checkOverviewDataInCache,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send(createError(500));

      return;
    }

    const projectName = req.params!.projectParam;

    genericLogger.info(
      `ownershipRouter (overview) request received: ${projectName}`
    );

    let ownershipOverview;
    try {
      ownershipOverview = await getOwnershipOverviewERC721(dbConn, projectName);

      // Add to cache (cache aside)
      await setOwnershipOverviewRouterCache(projectName, ownershipOverview);
    } catch (err) {
      genericLogger.error(`ownershipRouter (overview) error: ${err}`);

      res.send(createError(500));

      return;
    }

    res.send(ownershipOverview);

    return;
  }
);
