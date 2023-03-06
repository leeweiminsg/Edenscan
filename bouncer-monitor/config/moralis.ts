import Moralis from "moralis/node.js";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";

const initMoralis = async () => {
  const serverUrl = config.MORALIS_SERVER_URL;
  const appId = config.MORALIS_APP_ID;

  await Moralis.start({ serverUrl, appId });

  genericLogger.info("Moralis: connected");
};

export const moralisConn = await initMoralis();
