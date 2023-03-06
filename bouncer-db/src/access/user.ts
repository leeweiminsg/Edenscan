import mongoose from "mongoose";

import { AddRoleDataDb } from "../../types/discord.js";
import { genericLogger } from "../../logger/logger.js";
import { getProjectGeneric } from "./project.js";

export const getUserGeneric = async (dbConn, filters: any) => {
  const userModel = dbConn.model("User");

  filters.isDeleted = false;

  let user;
  try {
    user = await userModel.findOne(filters);
  } catch (err) {
    genericLogger.error(`getUserGeneric error: ${err}`);

    throw err;
  }

  return user;
};

export const addUserToProject = async (dbConn, data: AddRoleDataDb) => {
  try {
    const { walletAddress, userId, roleId, guildId } = data;

    const userModel = dbConn.model("User");

    const project = await getProjectGeneric(dbConn, {
      guildId,
      isDeleted: false,
    });

    const user = createUser(dbConn, walletAddress, project._id, userId, roleId);
    const query = { project: project._id, walletAddress };
    const options = { upsert: true, new: true };
    const userRes = await userModel.findOneAndUpdate(query, user, options);

    genericLogger.info(
      `addUserToProject completed: walletAddress - ${walletAddress} guildId - ${guildId} roleId - ${roleId} `
    );

    return userRes;
  } catch (err) {
    genericLogger.error(`addUserToProject error: ${err}`);

    throw err;
  }
};

const createUser = (
  dbConn,
  walletAddress: string,
  projectId: mongoose.Types.ObjectId,
  discordUserId: string,
  discordRoleId: string
) => {
  try {
    const userModel = dbConn.model("User");

    const user = new userModel({
      walletAddress,
      project: projectId,
      discordUserId,
      discordRoleId,
    });

    genericLogger.info(
      `createUser completed: project - ${projectId} walletAddress - ${walletAddress}`
    );

    return user;
  } catch (err) {
    genericLogger.error(`createUser error: ${err}`);

    throw err;
  }
};
