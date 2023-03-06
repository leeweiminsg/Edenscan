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

  return;
};

export const validateWalletAddress = () => {
  return body("walletAddress")
    .exists({ checkNull: true, checkFalsy: true })
    .isAlphanumeric();
};

export const validateEthSignature = () => {
  return body("signature")
    .exists({ checkNull: true, checkFalsy: true })
    .isAlphanumeric();
};

export const validateNonce = () => {
  return body("nonce")
    .exists({ checkNull: true, checkFalsy: true })
    .isAlphanumeric();
};

export const validateData = () => {
  return body("data").exists({ checkNull: true, checkFalsy: true });
};
