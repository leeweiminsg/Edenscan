import {
  getProject,
  getLatestBlockNumberERC721,
  deleteByBlockNumberERC721,
  createERC721Tx,
  getAllBlocks,
  getDateFromBlockNoDb,
  batchInsertERC721Txes,
} from "@0xkomada/bouncer-db";

import { erc721Log } from "../types/erc721.js";
import { indexLogger } from "./logger/logger.js";
import { provider } from "../config/ethers.js";
import { dbConn } from "../db/mongodb/mongodb.js";

const TRANSFER_HASH =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const EVENT_SIGNATURE_IDX = 0;
const TRANSFER_EVENT_FROM_ADDRESS_IDX = 1;
const TRANSFER_EVENT_TO_ADDRESS_IDX = 2;
const TRANSFER_EVENT_TOKEN_ID_IDX = 3;

export const syncAllERC721Logs = async (projectName: string) => {
  try {
    const curBlockNumber = await provider.getBlockNumber();

    indexLogger.info(
      `syncAllERC721Logs ${projectName}: current block number - ${curBlockNumber}`
    );

    const project = await getProject(dbConn, projectName);
    const contractAddress = project.contractAddress;

    let blockNumberSynced = await getLatestBlockNumberERC721(dbConn);

    // if collection is empty
    if (blockNumberSynced === 0) {
      blockNumberSynced = project.block;
    }

    // delete all logs from DB, since it may not capture all the logs in that block
    await deleteByBlockNumberERC721(dbConn, blockNumberSynced);

    await syncERC721Logs(blockNumberSynced, curBlockNumber, contractAddress);
  } catch (err) {
    indexLogger.error(`syncAllERC721Logs ${projectName} error: ${err}`);

    throw err;
  }

  indexLogger.info(`syncAllERC721Logs completed: ${projectName}`);
};

const syncERC721Logs = async (
  fromBlock: number,
  toBlock: number,
  contractAddress: string
) => {
  let curBlock = fromBlock;

  const blockTimes = await getAllBlocks(dbConn);

  while (curBlock < toBlock) {
    // Quicknode limit: 10000 blocks
    const window = Math.min(toBlock - curBlock, 10000);

    try {
      const fromBlockWindow = curBlock;
      const toBlockWindow = curBlock + window - 1;

      indexLogger.info(
        `syncERC721Logs: fromBlock - ${fromBlockWindow} toBlock - ${toBlockWindow}`
      );

      const erc721Logs: erc721Log[] = await provider.getLogs({
        address: contractAddress,
        fromBlock: fromBlockWindow,
        toBlock: toBlockWindow,
      });

      // Filter for Transfer event
      const erc721LogsTransfer = erc721Logs.filter((erc721Log) => {
        return erc721Log.topics[EVENT_SIGNATURE_IDX] === TRANSFER_HASH;
      });

      const erc721Events = erc721LogsTransfer.map((erc721Log) => {
        const { blockNumber, transactionHash } = erc721Log;

        const date = getDateFromBlockNoDb(blockTimes, blockNumber);

        const data = {
          signatureTopic: erc721Log.topics[EVENT_SIGNATURE_IDX],
          fromAddress: erc721Log.topics[TRANSFER_EVENT_FROM_ADDRESS_IDX],
          toAddress: erc721Log.topics[TRANSFER_EVENT_TO_ADDRESS_IDX],
          tokenId: erc721Log.topics[TRANSFER_EVENT_TOKEN_ID_IDX],
          blockNumber,
          transactionHash,
          date,
        };

        return createERC721Tx(dbConn, data);
      });

      await batchInsertERC721Txes(dbConn, erc721Events);
    } catch (err) {
      indexLogger.error(`syncERC721Logs error: ${err}`);

      throw err;
    }

    curBlock = curBlock + window;
  }

  indexLogger.info(
    `syncERC721Logs completed: fromBlock - ${fromBlock} toBlock - ${toBlock}`
  );
};
