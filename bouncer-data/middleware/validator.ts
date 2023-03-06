import { param, body, validationResult } from "express-validator";
import createError from "http-errors";

import { genericLogger } from "../logger/logger.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    genericLogger.info(`validate: invalid request`);

    res.send(createError(500));

    return;
  }

  genericLogger.info(`validate: valid request`);

  next();

  return;
};

export const validateProjectParam = () => {
  return param("projectParam")
    .trim()
    .isLength({ min: 1 })
    .matches(/^[A-Za-z0-9\-]+$/);
};

export const validateWalletParam = (isBody: boolean) => {
  if (isBody) {
    return body("walletAddress")
      .exists({ checkNull: true, checkFalsy: true })
      .isAlphanumeric();
  } else {
    return param("walletParam")
      .trim()
      .isLength({ min: 42, max: 42 })
      .isAlphanumeric();
  }
};
