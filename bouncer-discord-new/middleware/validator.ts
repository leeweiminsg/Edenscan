import { body, validationResult } from "express-validator";

import { genericLogger } from "../logger/logger.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    genericLogger.warn(`validate warning: invalid request`);

    res.status(500).send();

    return;
  }

  next();
};

export const validateNonce = () => {
  return body("nonce")
    .exists({ checkNull: true, checkFalsy: true })
    .isAlphanumeric();
};

export const validateWalletAddress = () => {
  return body("walletAddress")
    .exists({ checkNull: true, checkFalsy: true })
    .isAlphanumeric();
};

export const validateGuildId = () => {
  return body("guildId")
    .isNumeric()
    .exists({ checkNull: true, checkFalsy: true });
};

export const validateUserId = () => {
  return body("userId")
    .isNumeric()
    .exists({ checkNull: true, checkFalsy: true });
};

export const validateChannelId = () => {
  return body("channelId")
    .isNumeric()
    .exists({ checkNull: true, checkFalsy: true });
};
