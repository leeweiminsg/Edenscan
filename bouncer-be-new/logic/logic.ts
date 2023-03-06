import {
  getRuleGeneric,
  getDetailedOwnershipDistribution,
  getDetailedOwnershipDistributionERC721,
} from "@0xkomada/bouncer-db";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { dbConn } from "../db/mongodb/mongodb.js";

export const determineRole = async (
  project,
  walletAddress: string
): Promise<string> => {
  // Note: For test accounts
  if (walletAddress === "0x0f133d7009ae77ef984d9d763145b80af53a26cb") {
    return "902031705962061915";
  }

  try {
    const rule = await getRuleGeneric(dbConn, {
      project: project._id,
      isDeleted: false,
    });

    // For now, only one rule per project (which has MemberOf logic)
    if (rule.logicType === "MemberOf") {
      const minTokens = rule.logic.get("minimum");

      let ownershipDistribution;
      if (rule.tokenStandard === "ERC721") {
        ownershipDistribution = await getDetailedOwnershipDistributionERC721(
          dbConn
        );
      } else if (rule.tokenStandard === "ERC1155") {
        ownershipDistribution = await getDetailedOwnershipDistribution(
          dbConn,
          project.name
        );
      } else {
        const err = new Error("Unknown tokenStandard");

        genericLogger.error(`determineRole error: ${err}`);

        throw err;
      }

      if (!ownershipDistribution.has(walletAddress)) {
        genericLogger.info(
          `determineRole: walletAddress - ${walletAddress} does not own any token`
        );

        return "";
      }

      const balance = ownershipDistribution.get(walletAddress)!.balance();

      if (balance < minTokens) {
        genericLogger.info(
          `determineRole: walletAddress - ${walletAddress} does not have enough balance`
        );

        return "";
      }

      const role = rule.discordRoleId;

      genericLogger.info(
        `determineRole completed: walletAddress - ${walletAddress}, role - ${role}`
      );

      return role;
    } else {
      const err = new Error("logic type not found");

      genericLogger.error(
        `determineRole error: ${err} walletAddress - ${walletAddress}`
      );

      throw err;
    }
  } catch (err) {
    genericLogger.error(
      `determineRole error: ${err} walletAddress - ${walletAddress}`
    );

    throw err;
  }
};
