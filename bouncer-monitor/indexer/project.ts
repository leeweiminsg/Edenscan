import { indexProject } from "@0xkomada/bouncer-db";

import { indexLogger } from "./logger/logger.js";
import { dbConn } from "../db/mongodb/mongodb.js";

export const syncProject = async (projectName: string) => {
  indexLogger.info(`syncProject: ${projectName}`);

  await indexProject(dbConn, projectName);

  indexLogger.info(`syncProject completed: ${projectName}`);
};
