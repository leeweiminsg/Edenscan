import { CronJob } from "cron";

import { indexLogger } from "../logger/logger.js";
import { syncAllOpenseaLogs } from "../opensea.js";
import { syncAllERC721Logs } from "../erc721.js";
import { syncProject } from "../project.js";
import { syncAllDatesOfBlocks } from "../blockDate.js";

const syncOpenseaJob = new CronJob(
  // Every 5 min
  "0 */5 * * * *",
  async () => {
    indexLogger.info("syncOpenseaJob: starting");

    await syncAllOpenseaLogs();

    indexLogger.info("syncOpenseaJob: completed");
  },
  null,
  true,
  "Asia/Singapore"
);

const syncProjectJob = new CronJob(
  // Every 5 min
  "0 */5 * * * *",
  async () => {
    indexLogger.info("syncProjectJob: starting");

    await syncProject("cryptobengz");

    indexLogger.info("syncProjectJob: completed");
  },
  null,
  true,
  "Asia/Singapore"
);

// const syncERC721Job = new CronJob(
//   // Every hour
//   "0 0 */1 * * *",
//   async () => {
//     indexLogger.info("syncERC721Job: starting");

//     await syncAllERC721Logs("pudgy-penguins");

//     indexLogger.info("syncERC721Job: completed");
//   },
//   null,
//   true,
//   "Asia/Singapore"
// );

const syncBlockDateJob = new CronJob(
  // Every 15min after midnight
  "0 15 0 * * *",
  async () => {
    indexLogger.info("syncBlockDateJob: starting");

    await syncAllDatesOfBlocks();

    indexLogger.info("syncBlockDateJob: completed");
  },
  null,
  true,
  // UTC +0 to match block model timezone
  // For sgt, it is 8am
  "Europe/London"
);

syncOpenseaJob.start();
syncProjectJob.start();
syncBlockDateJob.start();

// await syncAllOpenseaLogs();
// await syncAllDatesOfBlocks();
// await syncProject("cryptobengz");
