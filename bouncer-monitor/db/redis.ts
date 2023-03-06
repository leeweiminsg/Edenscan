import redis from "redis";

import { redisLogger } from "../logger/logger.js";

export const BLOCK_NUMBER_KEY_NAME = "block:number";

const getBlockWindowSnapshotName = (contractName: string) => {
  return `block:window:snapshot:${contractName}:transfer`;
};

const getBlockWindowFrontKeyName = (contractName: string) => {
  return `block:window:${contractName}:front`;
};

const getBlockWindowBackKeyName = (contractName: string) => {
  return `block:window:${contractName}:back`;
};

export const redisClient = redis.createClient();

// TODO: get all keys of addresses
// KEYS "address:*"

const connectRedisClient = async () => {
  await redisClient.connect();

  redisLogger.info("Connected to Redis.");

  redisClient.on("error", (err) =>
    redisLogger.error("Redis Client Error", err)
  );
};

export const getCurrentBlock = async () => {
  const currentBlock = await redisClient.get(BLOCK_NUMBER_KEY_NAME);

  return currentBlock;
};

export const setBlockNumber = async (blockNumber: number) => {
  await redisClient.set(BLOCK_NUMBER_KEY_NAME, blockNumber.toString());

  redisLogger.info(`New block number: ${blockNumber}`);
};

export const getBlockMonitorWindow = async (contractName: string) => {
  const blockMonitorWindowFront = await redisClient.get(
    getBlockWindowFrontKeyName(contractName)
  );
  const blockMonitorWindowBack = await redisClient.get(
    getBlockWindowBackKeyName(contractName)
  );

  return [blockMonitorWindowFront, blockMonitorWindowBack];
};

export const setBlockMonitorWindow = async (
  contractName: string,
  blockMonitorWindow: number[]
) => {
  await redisClient.set(
    getBlockWindowFrontKeyName(contractName),
    blockMonitorWindow[0].toString()
  );

  await redisClient.set(
    getBlockWindowBackKeyName(contractName),
    blockMonitorWindow[1].toString()
  );

  redisLogger.info(`${contractName} - New block window: ${blockMonitorWindow}`);
};

await connectRedisClient();
