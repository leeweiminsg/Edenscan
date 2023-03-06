import mongoose from "mongoose";

import { ProjectSchema } from "./project.js";
import { UserSchema } from "./user.js";
import { RuleSchema } from "./rule.js";
import { ERC721Schema } from "./ERC721.js";
import { OpenseaOpenstoreSchema } from "./openseaOpenstore.js";
import { BlockSchema } from "./block.js";
import { genericLogger } from "../../logger/logger.js";

export const createConnection = async (uri: string) => {
  let dbConn;
  try {
    dbConn = mongoose.createConnection(uri);

    const projectModel = dbConn.model("Project", ProjectSchema);
    const userModel = dbConn.model("User", UserSchema);
    const ruleModel = dbConn.model("Rule", RuleSchema);
    const ERC721Model = dbConn.model("ERC721", ERC721Schema);
    const openseaOpenstoreModel = dbConn.model(
      "OpenseaOpenstore",
      OpenseaOpenstoreSchema
    );
    const blockModel = dbConn.model("Block", BlockSchema);

    // drop any existing indexes in server that aren't in schema
    await projectModel.syncIndexes();
    await userModel.syncIndexes();
    await ruleModel.syncIndexes();
    await ERC721Model.syncIndexes();
    await openseaOpenstoreModel.syncIndexes();
    await blockModel.syncIndexes();
  } catch (err) {
    genericLogger.error(`createConnection error: ${err}`);

    throw err;
  }

  genericLogger.info("MongoDB: connected");

  dbConn.on("error", (err) => {
    genericLogger.error(`MongoDB connection error: ${err}`);
  });

  return dbConn;
};
