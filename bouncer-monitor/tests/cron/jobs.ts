import { CronJob } from "cron";

import { testLogger } from "../logger/logger.js";
import { testProject } from "../ownership.js";

const testProjectJob = new CronJob(
  // Every 15min after 1am
  // After opensea log sync job
  "0 15 1 * * *",
  async () => {
    testLogger.info("testProjectJob: starting");

    await testProject("cryptobengz");
    // await testProject("ghxsts");

    testLogger.info("testProjectJob: completed");
  },
  null,
  true,
  // UTC +0 to match block model timezone
  "Europe/London"
);

testProjectJob.start();
// await testProject("cryptobengz");
