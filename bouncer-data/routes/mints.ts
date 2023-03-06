import express from "express";
import cors from "cors";
import { validationResult } from "express-validator";
import createError from "http-errors";
import _ from "lodash";
import {
  findAllMints,
  findCumulativeMints,
  findAllMintsERC721,
} from "@0xkomada/bouncer-db";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import {
  checkDataInCache,
  checkCumMintDataInCache,
} from "../middleware/mints.js";
import {
  setMintsRouterCache,
  setCumulativeMintsRouterCache,
} from "../db/redis/access/mintsRouter.js";
import { validate, validateProjectParam } from "../middleware/validator.js";

export const mintsRouter = express.Router();

const BASE_URL = "/";

mintsRouter.options(BASE_URL, cors(config.CORS_OPTIONS)); // enable pre-flight request

mintsRouter.use(BASE_URL, cors(config.CORS_OPTIONS));

mintsRouter.get(
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

    genericLogger.info(`mintRouter request received: ${projectName}`);

    let mints;
    try {
      mints = await findAllMints(dbConn, projectName);

      // Add to cache (cache aside)
      await setMintsRouterCache(projectName, mints);
    } catch (err) {
      genericLogger.error(`mintRouter error: ${err}`);

      res.send(createError(500));

      return;
    }

    res.send(mints);

    return;
  }
);

mintsRouter.get(
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

    genericLogger.info(`mintRouter request received: ${projectName}`);

    let mints;
    try {
      mints = await findAllMintsERC721(dbConn);

      // Add to cache (cache aside)
      await setMintsRouterCache(projectName, mints);
    } catch (err) {
      genericLogger.error(`mintRouter error: ${err}`);

      res.send(createError(500));

      return;
    }

    res.send(mints);

    return;
  }
);

mintsRouter.get(
  "/cumulative/:projectParam",
  validateProjectParam(),
  validate,
  checkCumMintDataInCache,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send(createError(500));

      return;
    }

    const projectName = req.params!.projectParam;

    genericLogger.info(
      `mintRouter (cumulative mints) request received: ${projectName}`
    );

    let mints;
    try {
      mints = await findCumulativeMints(dbConn, projectName);

      // Add to cache (cache aside)
      await setCumulativeMintsRouterCache(projectName, mints);
    } catch (err) {
      genericLogger.error(`mintRouter (cumulative mints) error: ${err}`);

      res.send(createError(500));

      return;
    }

    res.send(mints);

    return;
  }
);
