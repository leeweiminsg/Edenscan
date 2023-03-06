import WebSocket from "ws";

import { genericLogger } from "../../logger/logger.js";
import { wss } from "../../app.js";
import { setBlockNumber } from "../../db/redis.js";
import { provider } from "../../config/ethers.js";

const syncCurrentBlockNumber = async () => {
  const currentBlockNumber = await provider.getBlockNumber();

  await setBlockNumber(currentBlockNumber);

  genericLogger.info(`Sync block number: ${currentBlockNumber}`);
};

export const startEthMonitor = async () => {
  await syncCurrentBlockNumber();

  provider.on("block", async (blockNumber) => {
    await setBlockNumber(blockNumber);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(blockNumber, { binary: false });
      }
    });

    genericLogger.info(
      `Update block number to websocket clients: ${blockNumber}`
    );
  });
};
