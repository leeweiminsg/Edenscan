import axios from "axios";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { AddRoleDiscordData } from "../types/discord.js";

export const addRole = async (data: AddRoleDiscordData): Promise<number> => {
  try {
    const { status } = await axios.post(
      `${config.DISCORD_SERVER_URL}/discord/addUserToProject`,
      data
    );

    return status;
  } catch (err) {
    genericLogger.error(`addRole error: ${err}`);

    throw err;
  }
};
