import { verifyEthSignature as verifyEthSig } from "../utils/ethSignature.js";

import { genericLogger } from "../logger/logger.js";

export const verifyEthSignature = (req, res, next) => {
  const { walletAddress, signature: ethSignature, nonce } = req.body;

  const isEthSignatureVerified = verifyEthSig(
    ethSignature,
    walletAddress,
    nonce
  );

  if (!isEthSignatureVerified) {
    genericLogger.warn(
      `usersRouter warning: invalid eth signature from ${walletAddress}`
    );

    res.status(500).send();

    return;
  }

  next();
};
