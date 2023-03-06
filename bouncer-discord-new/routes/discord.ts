import express from "express";
import cors from "cors";
import { addUserToProject } from "@0xkomada/bouncer-db";

import { AddRoleData, AddRoleDataDb } from "../types/discord.js";
import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { hasUserSessionCache } from "../db/redis/access/session.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import { client } from "../bin/www.js";
import {
  validateGuildId,
  validateUserId,
  validateWalletAddress,
  validateNonce,
  validate,
  validateChannelId,
} from "../middleware/validator.js";

export const discordRouter = express.Router();

const BASE_URL = "/";

discordRouter.options(BASE_URL, cors(config.CORS_OPTIONS)); // enable pre-flight request

discordRouter.post(
  "/addUserToProject",
  validateNonce(),
  validateWalletAddress(),
  validateGuildId(),
  validateUserId(),
  validateChannelId(),
  validate,
  async (req, res) => {
    const data: AddRoleData = req.body;

    const { userId, nonce } = req.body;
    if (!(await hasUserSessionCache(nonce))) {
      genericLogger.warn(`discordRouter warn: session expired`);

      return res.status(400).send("Session expired");
    }

    // TODO: make atomic (both discord update and DB update)
    try {
      await client.addUserToProject(data);
    } catch (err) {
      genericLogger.error(`discordRouter error: ${err}`);

      res.status(500).send();

      return;
    }

    try {
      const { walletAddress, roleId, guildId } = req.body;
      const addRoleDataDb: AddRoleDataDb = {
        walletAddress,
        userId,
        roleId,
        guildId,
      };

      // NOTE: testing accounts
      if (walletAddress === "0x2EE1CDCb606FfFF93Cd8b62a549D91e26310038d") {
        return res.sendStatus(200);
      }

      await addUserToProject(dbConn, addRoleDataDb);

      return res.sendStatus(200);
    } catch (err) {
      genericLogger.error(`discordRouter error: ${err}`);

      res.status(500).send();

      return;
    }
  }
);
