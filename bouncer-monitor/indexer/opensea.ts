import _ from "lodash";

import {
  createOpenseaTx,
  batchInsertOpenseaTxes,
  getLatestBlockNumber,
  deleteByBlockNumber,
} from "@0xkomada/bouncer-db";

import { OpenseaLog } from "../types/openseaOpenstore.js";
import { indexLogger } from "./logger/logger.js";
import { provider } from "../config/ethers.js";
import { dbConn } from "../db/mongodb/mongodb.js";

// Opensea openstore creation tx: https://etherscan.io/tx/0x7d0512fa5e19d2d775bb55efe9b5e9960cc59f9c67c627b1f5eb22a5749162f2
const OPENSEA_OPENSTORE_ADDRESS = "0x495f947276749ce646f68ac8c248420045cb7b5e";
const OPENSEA_OPENSTORE_CREATION_BLOCK = 11374506;
const TRANSFER_SINGLE_HASH =
  "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62";
const TRANSFER_BATCH_HASH =
  "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb";
const TRANSFER_SINGLE_EVENT_SIGNATURE_IDX = 0;
const TRANSFER_SINGLE_EVENT_FROM_ADDRESS_IDX = 2;
const TRANSFER_SINGLE_EVENT_TO_ADDRESS_IDX = 3;

export const syncAllOpenseaLogs = async (start?: boolean) => {
  try {
    const curBlockNumber = await provider.getBlockNumber();

    indexLogger.info(
      `syncAllOpenseaLogs: current block number - ${curBlockNumber}`
    );

    let blockNumberSynced;
    if (start) {
      blockNumberSynced = OPENSEA_OPENSTORE_CREATION_BLOCK;
    } else {
      blockNumberSynced = await getLatestBlockNumber(dbConn);

      // delete all logs from DB, since it may not capture all the logs in that block
      await deleteByBlockNumber(dbConn, blockNumberSynced);
    }

    await syncOpenseaLogs(blockNumberSynced, curBlockNumber);
  } catch (err) {
    indexLogger.error(`syncAllOpenseaLogs error: ${err}`);

    throw err;
  }

  indexLogger.info(`syncAllOpenseaLogs completed`);
};

const syncOpenseaLogs = async (fromBlock: number, toBlock: number) => {
  let curBlock = fromBlock;

  while (curBlock < toBlock) {
    // Quicknode limit: 10000 blocks
    const window = Math.min(toBlock - curBlock, 10000);

    try {
      const fromBlockWindow = curBlock;
      const toBlockWindow = curBlock + window - 1;

      indexLogger.info(
        `syncOpenseaLogs: fromBlock - ${fromBlockWindow} toBlock - ${toBlockWindow}`
      );

      const openseaLogs: OpenseaLog[] = await provider.getLogs({
        address: OPENSEA_OPENSTORE_ADDRESS,
        fromBlock: fromBlockWindow,
        toBlock: toBlockWindow,
      });

      // Filter for TransferSingle event
      const openseaLogsTransferSingle = openseaLogs.filter((openseaLog) => {
        return (
          openseaLog.topics[TRANSFER_SINGLE_EVENT_SIGNATURE_IDX] ===
          TRANSFER_SINGLE_HASH
        );
      });

      const openseaEvents = openseaLogsTransferSingle.map((openseaLog) => {
        // Remove `0x` prefix
        const tokenId = openseaLog.data.slice(2, 66);
        // For ERC1155: value is 1, but we index anyway
        const value = openseaLog.data.slice(66, openseaLog.data.length);

        const { blockNumber, transactionHash } = openseaLog;

        const data = {
          signatureTopic:
            openseaLog.topics[TRANSFER_SINGLE_EVENT_SIGNATURE_IDX],
          fromAddress:
            openseaLog.topics[TRANSFER_SINGLE_EVENT_FROM_ADDRESS_IDX],
          toAddress: openseaLog.topics[TRANSFER_SINGLE_EVENT_TO_ADDRESS_IDX],
          tokenId,
          value,
          blockNumber,
          transactionHash,
        };

        return createOpenseaTx(dbConn, data);
      });

      // Remove duplicates from quicknode
      const openseaEventsUnique = _.uniqBy(openseaEvents, (openseaEvent) => {
        return (
          openseaEvent.signatureTopic +
          openseaEvent.fromAddress +
          openseaEvent.toAddress +
          openseaEvent.tokenId +
          openseaEvent.value +
          openseaEvent.blockNumber +
          openseaEvent.transactionHash
        );
      });

      await batchInsertOpenseaTxes(dbConn, openseaEventsUnique);
    } catch (err) {
      indexLogger.error(`syncOpenseaLogs error: ${err}`);

      throw err;
    }

    curBlock = curBlock + window;
  }

  indexLogger.info(
    `syncOpenseaLogs completed: fromBlock - ${fromBlock} toBlock - ${toBlock}`
  );
};
