import _ from "lodash";
import axios from "axios";
import express from "express";
import cors from "cors";
import { validationResult } from "express-validator";
import createError from "http-errors";
import { getProject } from "@0xkomada/bouncer-db";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import {
  validate,
  validateProjectParam,
  validateWalletParam,
} from "../middleware/validator.js";
import { strip0x, hexToInt } from "../utils/format.js";

export const userRouter = express.Router();

const BASE_URL = "/";

userRouter.options(BASE_URL, cors(config.CORS_OPTIONS)); // enable pre-flight request

userRouter.use(BASE_URL, cors(config.CORS_OPTIONS));

const process = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.send(createError(500));

    return;
  }

  const projectName = req.params!.projectParam;
  const walletAddress = req.params!.walletParam;

  genericLogger.info(
    `userRouter request received: ${projectName} ${walletAddress}`
  );

  try {
    const project = await getProject(dbConn, projectName);
    const contractAddress = project.contractAddress;
    const { tokenIds } = project;
    const ALCHEMY_URL = `${config.ALCHEMY_URL}/getNFTs/?owner=${walletAddress}&contractAddresses[]=${contractAddress}`;

    const { data } = await axios.get(ALCHEMY_URL);
    const { ownedNfts } = data;

    const ownedProjectNfts = _.filter(ownedNfts, (ownedNft) => {
      return tokenIds.includes(hexToInt(strip0x(ownedNft.id.tokenId)));
    });

    res.send(ownedProjectNfts);
  } catch (err) {
    genericLogger.error(`userRouter error: ${err}`);

    res.send(createError(500));

    return;
  }

  return;
};

userRouter.get(
  "/:projectParam/:walletParam",
  validateProjectParam(),
  validateWalletParam(false),
  validate,
  process
);
