import _ from "lodash";
import moment from "moment";

import { Owner } from "../../types/wallet.js";
import { genericLogger } from "../../logger/logger.js";
import { toHumanDocumentArray } from "../../utils/utils.js";
import { toPercent } from "../../utils/format.js";
import { getTodayDate } from "../../utils/date.js";

export const getDetailedOwnershipDistributionERC721 = async (
  dbConn
): Promise<Map<string, Owner>> => {
  let detailedBalances;
  try {
    const txes = await getAllTxOfERC721(dbConn);

    detailedBalances = getDetailedBalancesFromTxes(txes);

    genericLogger.info(`getDetailedOwnershipDistributionERC721 completed`);
  } catch (err) {
    genericLogger.info(`getDetailedOwnershipDistributionERC721 error: ${err}`);
  }

  return detailedBalances;
};

export const getOwnershipOverviewERC721 = async (
  dbConn,
  projectName: string
) => {
  try {
    const ownershipDistribution = await getDetailedOwnershipDistributionERC721(
      dbConn
    );
    const ownershipOverview = {
      "1": 0,
      "2-3": 0,
      ">3": 0,
    };

    for (let owner of Array.from(ownershipDistribution.values())) {
      if (owner.balance() === 1) {
        ownershipOverview["1"] += 1;
      } else if (owner.balance() >= 2 && owner.balance() <= 3) {
        ownershipOverview["2-3"] += 1;
      }
      // balance > 3
      else {
        ownershipOverview[">3"] += 1;
      }
    }

    genericLogger.info(`getOwnershipOverviewERC721 completed: ${projectName}`);

    return ownershipOverview;
  } catch (err) {
    genericLogger.info(`getOwnershipOverviewERC721 error: ${err}`);

    throw err;
  }
};

export const getDetailedOwnershipDistributionDiamondHandsERC721 = async (
  dbConn
): Promise<Owner[]> => {
  let detailedBalancesDiamondHands = new Map<string, Owner>();
  let diamondHands;
  try {
    const detailedBalances = await getDetailedOwnershipDistributionERC721(
      dbConn
    );

    for (let [walletAddress, owner] of Array.from(detailedBalances.entries())) {
      if (owner.isDiamondHand) {
        detailedBalancesDiamondHands.set(walletAddress, owner);
      }
    }

    diamondHands = _.sortBy(
      Array.from(detailedBalancesDiamondHands.values()),
      (owner) => {
        return -1 * owner.balance();
      }
    );

    genericLogger.info(
      `getDetailedOwnershipDistributionDiamondHandsERC721 completed`
    );
  } catch (err) {
    genericLogger.info(
      `getDetailedOwnershipDistributionDiamondHandsERC721 error: ${err}`
    );
  }

  return diamondHands;
};

export const getSeniorityOverviewERC721 = async (dbConn) => {
  try {
    const ownershipDistribution = await getDetailedOwnershipDistributionERC721(
      dbConn
    );

    // 1 week: 7 days
    // 1 month: 30 days
    let seniorityOverview = {
      "1 week": {
        owners: 0,
        balance: 0,
      },
      "1 week - 1 month": {
        owners: 0,
        balance: 0,
      },
      "1 - 3 months": {
        owners: 0,
        balance: 0,
      },
      "> 3 months": {
        owners: 0,
        balance: 0,
      },
    };

    const totalOwners = Array.from(ownershipDistribution.values()).length;
    const totalSupply = _.sum(
      Array.from(ownershipDistribution.values()).map((owner) => owner.balance())
    );

    for (let owner of Array.from(ownershipDistribution.values())) {
      const todayDate = getTodayDate();
      const firstPurchase = moment(owner.firstPurchase);
      const daysElapsed = todayDate.diff(firstPurchase, "days");

      if (daysElapsed <= 7) {
        seniorityOverview["1 week"].owners += 1;
        seniorityOverview["1 week"].balance += owner.balance();
      } else if (daysElapsed <= 30) {
        seniorityOverview["1 week - 1 month"].owners += 1;
        seniorityOverview["1 week - 1 month"].balance += owner.balance();
      } else if (daysElapsed <= 90) {
        seniorityOverview["1 - 3 months"].owners += 1;
        seniorityOverview["1 - 3 months"].balance += owner.balance();
      } else {
        seniorityOverview["> 3 months"].owners += 1;
        seniorityOverview["> 3 months"].balance += owner.balance();
      }
    }

    for (let data of Object.values(seniorityOverview)) {
      for (let [key, value] of Object.entries(data)) {
        if (key === "owners") {
          data[key] = toPercent(value, totalOwners);
        } else {
          data[key] = toPercent(value, totalSupply);
        }
      }
    }

    genericLogger.info(`getSeniorityOverviewERC721 completed`);

    return seniorityOverview;
  } catch (err) {
    genericLogger.info(`getSeniorityOverviewERC721 error: ${err}`);

    throw err;
  }
};

const getAllTxOfERC721 = async (
  dbConn,
  filters?: any,
  groupByDate?: boolean
) => {
  const erc721Model = dbConn.model("ERC721");

  let txes;
  try {
    if (filters !== undefined) {
      txes = await erc721Model.aggregate([
        { $match: filters },
        { $group: { _id: "$date", count: { $sum: 1 } } },
      ]);

      txes = _.sortBy(txes, [
        (ele) => {
          return ele._id;
        },
      ]);
    } else if (groupByDate) {
      txes = await erc721Model.aggregate([
        { $group: { _id: "$date", transfers: { $push: "$$ROOT" } } },
      ]);

      txes = _.sortBy(txes, [
        (ele) => {
          return ele._id;
        },
      ]);
    } else {
      txes = await erc721Model
        .find({})
        .select({ fromAddress: 1, toAddress: 1, tokenId: 1, date: 1 });
    }
  } catch (err) {
    genericLogger.error(`getAllTxOfERC721 error: ${err}`);

    throw err;
  }

  genericLogger.info(`getAllTxOfERC721 completed}`);

  return toHumanDocumentArray(txes);
};

export const getStatsERC721 = async (dbConn) => {
  try {
    const res = new Array();
    let balances = new Map<string, Owner>();
    const groupedTxByDate = await getAllTxOfERC721(dbConn, undefined, true);

    _.forEach(groupedTxByDate, ({ transfers, _id }) => {
      transfers.forEach((tx) => {
        if (balances.has(tx.fromAddress)) {
          const owner = balances.get(tx.fromAddress)!;
          const ownerTokenBalances = owner.tokensBalances;
          const ownerTokenBalance = ownerTokenBalances.get(tx.tokenId)!;

          if (ownerTokenBalance < 1) {
            const err = new Error(
              `owner does not have token: owner - ${owner.address} tokenId - ${tx.tokenId}`
            );

            genericLogger.error(`getDetailedBalancesFromTxes error: ${err}`);

            return err;
          }

          ownerTokenBalances.set(
            tx.tokenId,
            ownerTokenBalance === undefined ? -1 : ownerTokenBalance - 1
          );
          owner.isDiamondHand = false;
        } else {
          // is a mint
          // fromAddress is null address
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

          const date = new Date(_id);

          balances.set(
            tx.toAddress,
            new Owner(tx.toAddress, ownerTokenBalances, true, date)
          );
        }
      });

      // Filter negative or zero tokens
      for (let [walletAddress, owner] of Array.from(balances.entries())) {
        for (let [tokenId, tokenBalance] of Array.from(
          owner.tokensBalances.entries()
        )) {
          if (tokenBalance === 0) {
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
      const diamondHandsBal = _.sum(
        _.map(
          Array.from(balances.values()).filter((owner) => owner.isDiamondHand),
          (owner) => owner.balance()
        )
      );
      const uniqueWallets = balances.size;
      const avgHeld = parseFloat((totalHeld / uniqueWallets).toFixed(1));
      const oneNftPct = toPercent(ownsOneNftCount, uniqueWallets);
      const diamondHandsPct = toPercent(diamondHandsCount, uniqueWallets);
      res.push({
        date: _id,
        uniqueWallets,
        avgHeld,
        oneNftPct,
        diamondHandsPct,
        diamondHandsBal,
      });
    });

    return res;
  } catch (err) {
    genericLogger.error(`getStatsERC721 error: ${err}`);
    throw err;
  }
};

// No of nfts held per owner, as well as tokenIds owned
const getDetailedBalancesFromTxes = (txes: any[]) => {
  let balances = new Map<string, Owner>();

  txes.forEach((tx) => {
    if (balances.has(tx.fromAddress)) {
      const owner = balances.get(tx.fromAddress)!;
      const ownerTokenBalances = owner.tokensBalances;
      const ownerTokenBalance = ownerTokenBalances.get(tx.tokenId)!;

      if (ownerTokenBalance < 1) {
        const err = new Error("owner does not have token");

        genericLogger.error(`getDetailedBalancesFromTxes error: ${err}`);

        return err;
      }

      ownerTokenBalances.set(
        tx.tokenId,
        ownerTokenBalance === undefined ? -1 : ownerTokenBalance - 1
      );
      owner.isDiamondHand = false;
    } else {
      // is a mint
      // fromAddress is null address
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
        new Owner(tx.toAddress, ownerTokenBalances, true, tx.date)
      );
    }
  });

  // Filter negative or zero tokens
  for (let [walletAddress, owner] of Array.from(balances.entries())) {
    for (let [tokenId, tokenBalance] of Array.from(
      owner.tokensBalances.entries()
    )) {
      if (tokenBalance === 0) {
        owner.tokensBalances.delete(tokenId);
      }
    }

    if (owner.tokensBalances.size === 0) {
      balances.delete(walletAddress);
    }
  }

  return balances;
};

export const findAllMintsERC721 = async (dbConn) => {
  let allTxes;
  try {
    allTxes = await getAllTxOfERC721(dbConn, {
      fromAddress:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    });
  } catch (err) {
    genericLogger.error(`findAllMintsERC721 error: ${err}`);

    throw err;
  }

  genericLogger.info(`findAllMintsERC721 completed`);

  return allTxes;
};

export const createERC721Tx = (dbConn, data: any) => {
  const ERC721Model = dbConn.model("ERC721");

  return new ERC721Model({ ...data });
};

export const batchInsertERC721Txes = async (
  dbConn,
  erc721Events
): Promise<void> => {
  const ERC721Model = dbConn.model("ERC721");

  try {
    await ERC721Model.insertMany(erc721Events);
  } catch (err) {
    genericLogger.error(`batchInsertERC721Txes error: ${err}`);

    throw err;
  }

  genericLogger.info(`batchInsertERC721Txes completed`);
};

export const getLatestBlockNumberERC721 = async (dbConn): Promise<number> => {
  const ERC721Model = dbConn.model("ERC721");

  let latestBlockNumber;
  try {
    const latestERC721Tx = await ERC721Model.find({})
      .sort({ blockNumber: -1 })
      .limit(1);

    // If collction is empty
    if (latestERC721Tx.length === 0) {
      genericLogger.info(`getLatestBlockNumberERC721 completed: empty`);

      return 0;
    }

    latestBlockNumber = latestERC721Tx[0].blockNumber;
  } catch (err) {
    genericLogger.error(`getLatestBlockNumberERC721 error: ${err}`);

    throw err;
  }

  genericLogger.info(
    `getLatestBlockNumberERC721 completed: blockNumber - ${latestBlockNumber}`
  );

  return latestBlockNumber;
};

export const deleteByBlockNumberERC721 = async (
  dbConn,
  blockNumber: number
): Promise<void> => {
  const ERC721Model = dbConn.model("ERC721");

  try {
    await ERC721Model.deleteMany({ blockNumber });
  } catch (err) {
    genericLogger.error(`deleteByBlockNumberERC721 error: ${err}`);

    throw err;
  }

  genericLogger.info(
    `deleteByBlockNumberERC721 completed: blockNumber - ${blockNumber}`
  );
};
