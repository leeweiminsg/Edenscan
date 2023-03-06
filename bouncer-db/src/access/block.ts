import _ from "lodash";
import moment from "moment";

import { genericLogger } from "../../logger/logger.js";

export const getDateFromBlockNoDb = (blockTimes, blockNumber: number) => {
  const idx = _.sortedIndexBy(blockTimes, { blockNumber }, (block) => {
    return block.blockNumber;
  });

  return blockTimes[idx - 1].date;
};

export const getDateFromBlock = async (dbConn, blockNumber: number) => {
  const blockTimes = await getAllBlocks(dbConn);

  const idx = _.sortedIndexBy(blockTimes, { blockNumber }, (block) => {
    return block.blockNumber;
  });

  return blockTimes[idx - 1].date;
};

export const getBlockFromDate = async (dbConn, date: moment.Moment) => {
  const blockModel = dbConn.model("Block");

  let block;
  try {
    block = await blockModel.find({ date: date.toDate() });
  } catch (err) {
    genericLogger.error(`getBlockFromDate error: ${err}`);

    throw err;
  }

  genericLogger.info(`getBlockFromDate completed`);

  return block;
};

export const getAllBlocks = async (dbConn) => {
  const blockModel = dbConn.model("Block");

  let blocks;
  try {
    blocks = await blockModel.find({}).sort({ blockNumber: 1 });
  } catch (err) {
    genericLogger.error(`getAllBlocks error: ${err}`);

    throw err;
  }

  genericLogger.info(`getAllBlocks completed`);

  return blocks;
};

export const createBlock = async (dbConn, blockNumber: number, date: Date) => {
  const blockModel = dbConn.model("Block");

  const block = new blockModel({
    blockNumber,
    date,
  });

  genericLogger.info(`createBlock ${blockNumber} completed`);

  return block;
};

export const batchInsertBlocks = async (dbConn, blocks): Promise<void> => {
  const blockModel = dbConn.model("Block");

  try {
    await blockModel.insertMany(blocks);
  } catch (err) {
    genericLogger.error(`batchInsertBlocks error: ${err}`);

    throw err;
  }
  genericLogger.info(`batchInsertBlocks completed`);
};

export const getLatestBlockDate = async (dbConn) => {
  const blockModel = dbConn.model("Block");

  let latestBlockDate;
  try {
    const latestBlock = await blockModel
      .find({})
      .sort({ blockNumber: -1 })
      .limit(1);

    latestBlockDate = moment.utc(latestBlock[0].date);
  } catch (err) {
    genericLogger.error(`getLatestBlockDate error: ${err}`);

    throw err;
  }

  genericLogger.info(
    `getLatestBlockDate completed: blockDate - ${latestBlockDate}`
  );

  return latestBlockDate;
};