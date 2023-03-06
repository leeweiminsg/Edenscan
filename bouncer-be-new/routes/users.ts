import express from "express";
import cors from "cors";
import { getProjectGeneric, getUserGeneric } from "@0xkomada/bouncer-db";

import { genericLogger } from "../logger/logger.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import {
  getUserSessionCache,
  hasUserSessionCache,
} from "../db/redis/access/session.js";
import { config } from "../config/config.js";
import { AddRoleDiscordData } from "../types/discord.js";
import { determineRole } from "../logic/logic.js";
import { addRole } from "../discord/discord.js";
import {
  validate,
  validateWalletAddress,
  validateEthSignature,
  validateNonce,
} from "../middleware/validator.js";
import { verifyEthSignature } from "../middleware/verifier.js";

export const usersRouter = express.Router();

const BASE_URL = "/";

// Already set up in nginx
usersRouter.options(BASE_URL, cors(config.CORS_OPTIONS)); // enable pre-flight request

usersRouter.use(BASE_URL, cors(config.CORS_OPTIONS));

usersRouter.post(
  "/",
  validateWalletAddress(),
  validateEthSignature(),
  validateNonce(),
  validate,
  verifyEthSignature,
  async (req, res) => {
    try {
      const { nonce, walletAddress } = req.body;

      if (!(await hasUserSessionCache(nonce))) {
        genericLogger.warn(`discordRouter warn: session expired`);

        return res.status(400).send("Session expired");
      }
      const { userId, guildId } = await getUserSessionCache(nonce);

      // NOTE: testing accounts
      if (
        walletAddress === "0x2EE1CDCb606FfFF93Cd8b62a549D91e26310038d" &&
        guildId === "948927437629190174"
      ) {
        const discordData: AddRoleDiscordData = {
          nonce,
          walletAddress,
          guildId,
          userId,
          roleId: "948927736553033788",
          channelId: "948927659361058816",
        };

        const status = await addRole(discordData);

        return res.sendStatus(status);
      }

      const project = await getProjectGeneric(dbConn, {
        discordGuildId: guildId,
        isDeleted: false,
      });

      const user = await getUserGeneric(dbConn, {
        walletAddress,
        project: project._id,
        isDeleted: false,
      });
      if (user !== null) {
        genericLogger.warn(`usersRouter warn: Wallet already has a role`);

        return res.status(400).send("Wallet already has a role");
      }

      const roleId = await determineRole(project, walletAddress.toLowerCase());
      if (roleId === "") {
        genericLogger.warn(
          `usersRouter warn: wallet does not meet requirements`
        );

        return res
          .status(400)
          .send(
            "Your wallet does not meet the requirements to unlock channel.\nPurchase here: https://opensea.io/collection/cryptobengz"
          );
      }

      const discordData: AddRoleDiscordData = {
        nonce,
        walletAddress,
        guildId,
        userId,
        roleId,
        channelId: project.discordChannelId,
      };

      const status = await addRole(discordData);

      return res.sendStatus(status);
    } catch (err) {
      if (err.response) {
        genericLogger.error(`usersRouter error: ${err.response.data}`);

        res.status(500).send(err.response.data);
      } else {
        genericLogger.error(`usersRouter error: ${err.message}`);

        res.status(500).send();
      }

      return;
    }
  }
);
