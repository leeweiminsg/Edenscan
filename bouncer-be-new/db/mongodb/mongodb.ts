import { createConnection } from "@0xkomada/bouncer-db";

import { genericLogger } from "../../logger/logger.js";
import { config } from "../../config/config.js";

const createConn = async () => {
  let dbConn;
  try {
    dbConn = await createConnection(config.MONGODB_URL!);
  } catch (err) {
    genericLogger.error(`createConn error: ${err}`);

    throw err;
  }

  genericLogger.info("createConn: completed");

  return dbConn;
};

export const dbConn = await createConn();
