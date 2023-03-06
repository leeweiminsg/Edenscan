import _ from "lodash";
import moment from "moment";

import { Owner } from "../../types/wallet.js";
import { genericLogger } from "../../logger/logger.js";
import { getProject } from "./project.js";
import { getAllBlocks } from "./block.js";
import { intToHexArray, toHumanDocumentArray } from "../../utils/utils.js";
import { addLeftPaddingAddress } from "../../utils/address.js";
import { getDetailedBalancesFromTxes } from "../../utils/ownership.js";
import { toPercent } from "../../utils/format.js";

export const getDetailedOwnershipDistribution = async (
  dbConn,
  projectName: string
): Promise<Map<string, Owner>> => {
  // NOTE: for testing
  if (projectName === "cryptobengz-test") {
    projectName = "cryptobengz";
  }

  let detailedBalances;
  try {
    const project = await getProject(dbConn, projectName);

    const txes = await getAllTxOfProject(dbConn, project.name);

    detailedBalances = getDetailedBalancesFromTxes(txes, project);

    genericLogger.info(
      `getDetailedOwnershipDistribution completed: ${projectName}`
    );
  } catch (err) {
    genericLogger.info(`getDetailedOwnershipDistribution error: ${err}`);
  }

  return detailedBalances;
};

export const getOwnershipOverview = async (dbConn, projectName: string) => {
  try {
    const ownershipDistribution = await getDetailedOwnershipDistribution(
      dbConn,
      projectName
    );

    const ownershipOverview = [
      { name: "1", val: 0 },
      { name: "2-3", val: 0 },
      { name: ">3", val: 0 },
    ];

    for (let owner of Array.from(ownershipDistribution.values())) {
      if (owner.balance() === 1) {
        ownershipOverview[0].val += 1;
      } else if (owner.balance() >= 2 && owner.balance() <= 3) {
        ownershipOverview[1].val += 1;
      }
      // balance > 3
      else {
        ownershipOverview[2].val += 1;
      }
    }

    genericLogger.info(`getOwnershipOverview completed: ${projectName}`);

    return ownershipOverview;
  } catch (err) {
    genericLogger.info(`getOwnershipOverview error: ${err}`);

    throw err;
  }
};

export const getAllTxOfProject = async (
  dbConn,
  projectName: string,
  filters?: any,
  groupByDate?: boolean | any
) => {
  const openseaOpenstoreModel = dbConn.model("OpenseaOpenstore");

  let txes;
  try {
    if (filters !== undefined) {
      txes = await openseaOpenstoreModel
        .find({
          $or: [
            { fromAddress: filters.walletAddress },
            { toAddress: filters.walletAddress },
          ],
          $and: [{ projectName }],
        })
        .select({ fromAddress: 1, toAddress: 1, blockNumber: 1, tokenId: 1 });
    } else {
      txes = await openseaOpenstoreModel
        .find({
          projectName,
        })
        .select({
          fromAddress: 1,
          toAddress: 1,
          blockNumber: 1,
          tokenId: 1,
        });
    }
  } catch (err) {
    genericLogger.error(`findAllTxOfCollection error: ${err}`);

    throw err;
  }

  if (groupByDate === undefined) {
    genericLogger.info(
      `findAllTxOfCollection completed: projectName - ${projectName}`
    );

    return toHumanDocumentArray(txes);
  } else {
    const blockTimes = await getAllBlocks(dbConn);

    for (let tx of txes) {
      const idx = _.sortedIndexBy(
        blockTimes,
        { blockNumber: tx.blockNumber },
        (block) => {
          return block.blockNumber;
        }
      );

      tx.date = blockTimes[idx - 1].date;
    }

    const groupedTxByDate = _.groupBy(txes, (tx) => {
      const date = moment(tx.date);
      return date.format("YYYY-MM-DD");
    });

    if (groupByDate.txCount) {
      const mappedGroupedTx = _.map(groupedTxByDate, (group, key) => ({
        date: key,
        val: group.length,
      }));

      genericLogger.info(`findAllTxOfCollectionByAddressAndDate completed`);

      return mappedGroupedTx;
    }

    genericLogger.info(`findAllTxOfCollectionByAddressAndDate completed`);

    return groupedTxByDate;
  }
};

export const getStats = async (dbConn, projectName: string) => {
  try {
    const res = new Array();
    let balances = new Map<string, Owner>();

    const project = await getProject(dbConn, projectName);
    const groupedTxByDate = await getAllTxOfProject(
      dbConn,
      projectName,
      undefined,
      true
    );

    _.forEach(groupedTxByDate, (txes, date) => {
      txes.forEach((tx) => {
        if (balances.has(tx.fromAddress)) {
          const owner = balances.get(tx.fromAddress);
          const ownerTokenBalances = owner!.tokensBalances;
          const ownerTokenBalance = ownerTokenBalances.get(tx.tokenId);

          ownerTokenBalances.set(
            tx.tokenId,
            ownerTokenBalance === undefined ? -1 : ownerTokenBalance - 1
          );
          owner!.isDiamondHand = false;
        } else {
          // May have 0xapi tx (which has transferBatch event signature), which is not yet supported
          // Can just ignore, will still resolve to correct final values
        }

        if (balances.has(tx.toAddress)) {
          const ownerTokenBalances = balances.get(tx.toAddress)!.tokensBalances;
          const ownerTokenBalance = ownerTokenBalances.get(tx.tokenId);

          ownerTokenBalances.set(
            tx.tokenId,
            ownerTokenBalance === undefined ? 1 : ownerTokenBalance + 1
          );
        } else {
          const ownerTokenBalances = new Map<string, number>();
          ownerTokenBalances.set(tx.tokenId, 1);

          balances.set(
            tx.toAddress,
            new Owner(tx.toAddress, ownerTokenBalances, true)
          );
        }
      });

      // Filter negative or zero tokens
      for (let [walletAddress, owner] of Array.from(balances.entries())) {
        for (let [tokenId, tokenBalance] of Array.from(
          owner.tokensBalances.entries()
        )) {
          if (tokenBalance <= 0) {
            owner.tokensBalances.delete(tokenId);
          }
        }

        if (owner.tokensBalances.size === 0) {
          balances.delete(walletAddress);
        }
      }

      const totalHeld = _.sum(
        Array.from(balances.values()).map((owner) =>
          _.sum(Array.from(owner.tokensBalances.values()))
        )
      );

      const ownsOneNftCount = Array.from(balances.values()).filter(
        (owner) => _.sum(Array.from(owner.tokensBalances.values())) === 1
      ).length;

      const diamondHandsCount = Array.from(balances.values()).filter(
        (owner) => owner.isDiamondHand
      ).length;

      const uniqueWallets = balances.size;

      const avgHeld = parseFloat((totalHeld / uniqueWallets).toFixed(1));

      const oneNftPct = toPercent(ownsOneNftCount, uniqueWallets);
      const diamondHandsPct = toPercent(diamondHandsCount, uniqueWallets);

      res.push({
        date,
        uniqueWallets,
        avgHeld,
        oneNftPct,
        diamondHandsPct,
      });
    });

    return res;
  } catch (err) {
    genericLogger.error(`getStats error: ${err}`);

    throw err;
  }
};

export const findCumulativeMints = async (dbConn, projectName: string) => {
  try {
    const allMints = await findAllMints(dbConn, projectName);

    const res = new Array();
    let cumSum = 0;

    allMints.forEach((mint) => {
      cumSum += mint.mints;
      res.push({ date: mint.date, cumulativeMints: cumSum });
    });

    return res;
  } catch (err) {
    genericLogger.error(`findCumulativeMints error: ${err}`);

    throw err;
  }
};

export const findAllMints = async (dbConn, projectName: string) => {
  let allTxes;
  try {
    const project = await getProject(dbConn, projectName);

    allTxes = await getAllTxOfProject(
      dbConn,
      project.name,
      {
        walletAddress: addLeftPaddingAddress(project.ownerAddress),
      },
      {
        txCount: true,
      }
    );

    allTxes.forEach((tx) => {
      tx.mints = tx.val;
      delete tx.val;
    });
  } catch (err) {
    genericLogger.error(`findAllMints error: ${err}`);

    throw err;
  }

  genericLogger.info(`findAllMints completed`);

  return allTxes;
};

export const indexProject = async (dbConn, projectName: string) => {
  try {
    const project = await getProject(dbConn, projectName);
    await findAllAndUpdateTxOfProject(dbConn, project.tokenIds, {
      $set: { projectName },
    });
  } catch (err) {
    genericLogger.error(`indexProject error: ${err}`);

    throw err;
  }

  genericLogger.info(`indexProject completed`);
};

// tokenId: big int as shown in opensea
export const findAllAndUpdateTxOfProject = async (
  dbConn,
  tokenIds: string[],
  update
) => {
  const openseaOpenstoreModel = dbConn.model("OpenseaOpenstore");
  const tokenIdsHex = intToHexArray(tokenIds);

  try {
    await openseaOpenstoreModel.updateMany(
      {
        tokenId: {
          $in: tokenIdsHex,
        },
      },
      update
    );
  } catch (err) {
    genericLogger.error(`findAllAndUpdateTxOfProject error: ${err}`);

    throw err;
  }

  genericLogger.info(`findAllAndUpdateTxOfProject completed`);
};

export const createOpenseaTx = (dbConn, data: any) => {
  const openseaOpenstoreModel = dbConn.model("OpenseaOpenstore");

  return new openseaOpenstoreModel({ ...data });
};

export const batchInsertOpenseaTxes = async (
  dbConn,
  openseaOpenstoreEvents
): Promise<void> => {
  const openseaOpenstoreModel = dbConn.model("OpenseaOpenstore");

  try {
    await openseaOpenstoreModel.insertMany(openseaOpenstoreEvents);
  } catch (err) {
    genericLogger.error(`batchInsertOpenseaTxes error: ${err}`);

    throw err;
  }

  genericLogger.info(`batchInsertOpenseaTxes completed`);
};

export const getLatestBlockNumber = async (dbConn): Promise<number> => {
  const openseaOpenstoreModel = dbConn.model("OpenseaOpenstore");

  let latestBlockNumber;
  try {
    const latestOpenseaTx = await openseaOpenstoreModel
      .find({})
      .sort({ blockNumber: -1 })
      .limit(1);

    latestBlockNumber = latestOpenseaTx[0].blockNumber;
  } catch (err) {
    genericLogger.error(`getLatestBlockNumber error: ${err}`);

    throw err;
  }

  genericLogger.info(
    `getLatestBlockNumber completed: blockNumber - ${latestBlockNumber}`
  );

  return latestBlockNumber;
};

export const deleteByBlockNumber = async (
  dbConn,
  blockNumber: number
): Promise<void> => {
  const openseaOpenstoreModel = dbConn.model("OpenseaOpenstore");

  try {
    await openseaOpenstoreModel.deleteMany({ blockNumber });
  } catch (err) {
    genericLogger.error(`deleteByBlockNumber error: ${err}`);

    throw err;
  }

  genericLogger.info(
    `deleteByBlockNumber completed: blockNumber - ${blockNumber}`
  );
};
