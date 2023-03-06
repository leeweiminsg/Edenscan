#!/usr/bin/env node

/**
 * Module dependencies.
 */
import http from "http";
import https from "https";
import pem from "https-pem";
import fs from "fs-extra";

import { config } from "../config/config.js";
import { app } from "../app.js";
import { genericLogger } from "../logger/logger.js";
import {
  connectRedisClient,
  connectSubRedisClient,
} from "../db/redis/redis.js";
import { dbConn } from "../db/mongodb/mongodb.js";

/**
 * Get port from environment and store in Express.
 */
const port = parseInt(config.HTTP_PORT!);
const httpsPort = parseInt(config.HTTPS_PORT!);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

// Connect to Redis (cache)
await connectRedisClient();
await connectSubRedisClient();

// Create HTTPS server
const certOptions =
  config.NODE_ENV === "development"
    ? pem
    : {
        key: fs.readFileSync(config.SSL_KEY_URL),
        cert: fs.readFileSync(config.SSL_CERT_URL),
      };

const httpsServer = https.createServer(certOptions, app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("listening", onHttpListening);

httpsServer.listen(httpsPort);
httpsServer.on("listening", onHttpsListening);

/**
 * Event listener for HTTP server "listening" event.
 */
function onHttpListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr!.port}`;

  genericLogger.info(`http: listening on ${bind}`);
}

function onHttpsListening() {
  const addr = server.address();
  const bind =
    typeof addr === "string" ? `pipe ${addr}` : `port ${config.HTTPS_PORT}`;

  genericLogger.info(`https: listening on ${bind}`);
}
