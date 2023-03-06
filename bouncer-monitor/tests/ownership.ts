import _ from "lodash";
import {
  getProject,
  getDetailedOwnershipDistribution,
  Owner,
} from "@0xkomada/bouncer-db";

import { localOpenseaStorefrontContract } from "../types/localContract.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import { testLogger } from "./logger/logger.js";
import { BNtoInt } from "../utils/format.js";

// Tolerance test, since bouncer does not support 0x api transactions at the time being
// We don't test totalSupply since opensea only counts unique items, whie each item can have duplicates
export const testProject = async (projectName: string) => {
  let inaccurateResCount = 0;
  const project = await getProject(dbConn, projectName);
  const localOpenseaContract = new localOpenseaStorefrontContract(project);

  const detailedOwnershipDistributionRes =
    await getDetailedOwnershipDistribution(dbConn, projectName);
  if (detailedOwnershipDistributionRes === undefined) {
    const err = new Error(
      `getDetailedOwnershipDistribution result is undefined`
    );

    testLogger.error(`testProject error: ${err}`);

    throw err;
  }

  const detailedOwnershipDistribution: Map<string, Owner> =
    detailedOwnershipDistributionRes;

  for (let [walletAddress, owner] of Array.from(
    detailedOwnershipDistribution.entries()
  )) {
    const tokenIds = Array.from(owner.tokensBalances.keys());
    const tokenBalances = _.sum(Array.from(owner.tokensBalances.values()));

    const tokenBitMap = await Promise.all(
      tokenIds.map(async (tokenId) => {
        let tokenBalance;
        try {
          tokenBalance = await localOpenseaContract.balanceOf(
            walletAddress,
            tokenId
          );
        } catch (err) {
          testLogger.error(`testProject error: ${err}`);
        }
        // toString() to convert from bigNum to string number
        return BNtoInt(tokenBalance);
      })
    );

    const balanceResult = _.sum(tokenBitMap);

    if (balanceResult != tokenBalances) {
      const err = new Error(
        `inaccurate balance: walletAddress - ${walletAddress} tokenId - ${tokenIds} balanceResult - ${balanceResult} balance - ${tokenBalances}`
      );

      testLogger.error(`testProject inaccuracy: ${err}`);

      inaccurateResCount += 1;
    }

    testLogger.info(
      `testProject: walletAddress - ${walletAddress} balance - ${balanceResult} matches`
    );
  }

  testLogger.info(
    `testProject: ${projectName} completed - inaccuracies - ${inaccurateResCount} total owners - ${detailedOwnershipDistributionRes.size}`
  );
};
