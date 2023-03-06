import moment from "moment";
import Moralis from "moralis/node.js";
import {
  getAllBlocks,
  getLatestBlockDate,
  createBlock,
  batchInsertBlocks,
} from "@0xkomada/bouncer-db";

import { indexLogger } from "./logger/logger.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import { moralisConn } from "../config/moralis.js";

const OPENSEA_OPENSTORE_CREATION_BLOCK = 11374506;
const OPENSEA_START_DATE = "2020-12-02";

export const syncAllDatesOfBlocks = async (start?: boolean) => {
  await moralisConn;
  await verifyBlocks();

  const todayDate: moment.Moment = getTodayDate();

  indexLogger.info(`syncDatesOfBlocks: todayDate - ${todayDate}`);

  try {
    if (start) {
      await syncDatesOfBlocks(moment.utc(OPENSEA_START_DATE), todayDate);
    } else {
      const latestDateSynced = moment.utc(await getLatestBlockDate(dbConn));
      await syncDatesOfBlocks(latestDateSynced.add(1, "days"), todayDate);
    }
  } catch (err) {
    indexLogger.error(`syncDatesOfBlocks error: ${err}`);

    throw err;
  }

  indexLogger.info(`syncAllDatesOfBlocks completed`);
};

// NOTE: toDay is exclusive
const syncDatesOfBlocks = async (
  fromDay: moment.Moment,
  toDay: moment.Moment
) => {
  if (fromDay.isAfter(toDay)) {
    indexLogger.info(
      `syncDatesOfBlocks synced: fromDay - ${fromDay} toDay - ${toDay}`
    );

    return;
  }

  indexLogger.info(`syncDatesOfBlocks: fromDay - ${fromDay} toDay - ${toDay}`);

  let curDay = fromDay;
  const loopEndDay = toDay.add(1, "days");
  // NOTE: curDay, toDay is mutable
  while (curDay.isBefore(loopEndDay)) {
    const window = Math.min(toDay.diff(curDay, "days"), 5);
    try {
      const lastDay = moment
        .utc(curDay.format("YYYY-MM-DD"))
        .add(window - 1, "days");

      const blocks = await getDatesofBlocks(curDay, lastDay);

      await batchInsertBlocks(dbConn, blocks);
    } catch (err) {
      indexLogger.error(`syncDatesOfBlocks error: ${err}`);

      throw err;
    }
  }

  indexLogger.info(
    `syncDatesOfBlocks completed: fromDay - ${fromDay.format()} toDay - ${toDay.format()} (exclusive)`
  );
};

const getDatesofBlocks = async (
  startDate: moment.Moment,
  endDate: moment.Moment
) => {
  if (startDate.isAfter(endDate)) {
    throw new Error(
      `getDatesofBlocks error: startDate - ${startDate} is after endDate - ${endDate}`
    );
  }

  let blocks = new Array();
  const loopEndDay = endDate.add(1, "days");

  try {
    for (var date = startDate; date.isBefore(loopEndDay); date.add(1, "days")) {
      const block = await getBlockFromDate(date);

      blocks.push(block);
    }
  } catch (err) {
    indexLogger.error(`getDatesofBlocks error: ${err}`);

    throw err;
  }

  indexLogger.info(
    `getDatesofBlocks completed: startDate - ${startDate} endDate - ${endDate}`
  );

  return blocks;
};

const getBlockFromDate = async (date: moment.Moment) => {
  let block;
  try {
    block = await Moralis.Web3API.native.getDateToBlock({
      date: date.format(),
    });

    // Avoid rate limit
    await new Promise((f) => setTimeout(f, 2000));
  } catch (err) {
    indexLogger.error(`getDateToBlock error: ${err}`);

    throw err;
  }

  const blockDoc = createBlock(dbConn, block.block, new Date(block.date));

  indexLogger.info(`getDateToBlock completed: date - ${date.format()}`);

  return blockDoc;
};

const verifyBlocks = async () => {
  const day: moment.Moment = moment.utc(OPENSEA_START_DATE);
  const blocks = await getAllBlocks(dbConn);

  for (let block of blocks) {
    const date = moment.utc(block.date);

    if (!date.isSame(day)) {
      const err = new Error(`missing date ${day}`);

      indexLogger.error(`verifyBlocks error: ${err}`);

      throw err;
    }

    day.add(1, "days");
  }

  indexLogger.info(`verifyBlocks completed`);

  return;
};

const getTodayDate = () => {
  return moment.utc(moment.utc().format("YYYY-MM-DD"));
};
