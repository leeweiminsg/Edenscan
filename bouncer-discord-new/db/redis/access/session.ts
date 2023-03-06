import ShortUniqueId from "short-unique-id";

import { redisLogger } from "../../../logger/logger.js";
import { redisClient } from "../redis.js";

export const SESSION_KEY_NAME = "session:";

export const generateSessionId = (): string => {
  const uid = new ShortUniqueId({ length: 8 });

  return uid();
};

const getSessionKeyName = (sessionKey: string) => {
  return `${SESSION_KEY_NAME}${sessionKey}`;
};

export const hasUserSessionCache = async (
  sessionKey: string
): Promise<boolean> => {
  try {
    const statusNo = await redisClient.exists(getSessionKeyName(sessionKey));

    if (statusNo != 1) {
      return false;
    }

    return true;
  } catch (err) {
    redisLogger.error(`hasUserSessionCache error: ${err}`);

    throw err;
  }
};

export const getUserSessionCache = async (sessionKey: string) => {
  try {
    return JSON.parse((await redisClient.get(getSessionKeyName(sessionKey)))!);
  } catch (err) {
    redisLogger.error(`getUserSessionCache error: ${err}`);

    throw err;
  }
};

export const setUserSessionCache = async (
  sessionKey: string,
  userId: string,
  guildId: string
) => {
  try {
    const userSessionData = {
      userId,
      guildId,
      nonce: sessionKey,
    };
    const userSessionDataStr = JSON.stringify(userSessionData);
    await redisClient.set(getSessionKeyName(sessionKey), userSessionDataStr);

    // TTL: 5min = 300 s
    redisClient.expire(getSessionKeyName(sessionKey), 300);
  } catch (err) {
    redisLogger.error(`setUserSessionCache error: ${err}`);

    throw err;
  }
};
