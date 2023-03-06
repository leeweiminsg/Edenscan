import WebSocket from "ws";
import { TransferEventData } from "../../types/localEvent.js";

import { genericLogger, queueLogger } from "../../logger/logger.js";
import { wss } from "../../app.js";
import { redisClient } from "../../db/redis.js";
import { eventQueue } from "../../queue/queue.js";

export const startTransferConsumer = () => {
  eventQueue.process(async (job, done) => {
    try {
      let transferEventData: TransferEventData = job.data as TransferEventData;

      queueLogger.info(`eventQueue: consumed ${transferEventData.toString()}`);

      try {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(transferEventData));
          }
        });
      } catch (err) {
        genericLogger.error(`wss error: ${err}`);
      }

      done();
    } catch (err) {
      genericLogger.error(`eventQueue error: ${err}`);
    }
  });
};
