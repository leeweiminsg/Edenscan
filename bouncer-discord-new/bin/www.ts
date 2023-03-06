#!/usr/bin/env node

/**
 * Module dependencies.
 */
import http from "http";

import { genericLogger } from "../logger/logger.js";
import { config } from "../config/config.js";
import { app } from "../app.js";
import {
  connectRedisClient,
  connectSubRedisClient,
} from "../db/redis/redis.js";
import { dbConn } from "../db/mongodb/mongodb.js";
import { DiscordClient } from "../discord/app.js";

/**
 * Get port from environment and store in Express.
 */
const port = parseInt(config.PORT!);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

// Connect to Redis (cache)
await connectRedisClient();
await connectSubRedisClient();

// Start discord bot
export const client = new DiscordClient();
await client.start();
await client.subKeyExpiry();

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("listening", onHttpListening);

/**
 * Event listener for HTTP server "listening" event.
 */
function onHttpListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr!.port}`;

  genericLogger.info(`http: listening on ${bind}`);
}
