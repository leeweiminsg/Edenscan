import mongoose from "mongoose";

import { genericLogger } from "../../logger/logger.js";
import { getProjectGeneric } from "./project.js";

export const getRuleGeneric = async (dbConn, filters: any) => {
  const ruleModel = dbConn.model("Rule");

  filters.isDeleted = false;

  let rule;
  try {
    rule = await ruleModel.findOne(filters);
  } catch (err) {
    genericLogger.error(`getRuleGeneric error: ${err}`);

    throw err;
  }

  if (rule == null) {
    const err = new Error(
      `getRuleGeneric error: Project not found in database`
    );

    genericLogger.error(err);

    throw err;
  }

  genericLogger.info(`getRuleGeneric completed`);

  return rule;
};

export const createERC721MemberRule = async (
  dbConn,
  discordRoleId: string,
  projectName: string
) => {
  try {
    const projectFilter = {
      name: projectName,
      isDeleted: false,
    };
    const project = await getProjectGeneric(dbConn, projectFilter);

    const logicMap = new Map<string, number>();
    logicMap.set("minimum", 1);

    const rule = createRule(
      dbConn,
      "ERC721",
      project._id,
      "MemberOf",
      logicMap,
      discordRoleId
    );

    await rule.save();

    genericLogger.info(`createERC721MemberRule completed`);

    return rule;
  } catch (err) {
    genericLogger.error(`createERC721MemberRule error: ${err}`);

    throw err;
  }
};

const createRule = (
  dbConn,
  tokenStandard: string,
  projectId: mongoose.Types.ObjectId,
  logicType: string,
  logic: Map<string, number>,
  discordRoleId: string
) => {
  try {
    const ruleModel = dbConn.model("Rule");

    const rule = new ruleModel({
      tokenStandard,
      project: projectId,
      logicType,
      logic,
      discordRoleId,
    });

    genericLogger.info(`createRule completed`);

    return rule;
  } catch (err) {
    genericLogger.error(`createRule error: ${err}`);

    throw err;
  }
};
