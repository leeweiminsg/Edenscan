#!/usr/bin/env node

/**
 * Module dependencies.
 */
import http from "http";

import { config } from "../config/config.js";
import { genericLogger } from "../logger/logger.js";
import { app } from "../app.js";
import { wss } from "../app.js";
import { startEthMonitor } from "../monitor/ethereum/monitor.js";
import { startTransferMonitor } from "../monitor/transfer/monitor.js";
import { startTransferConsumer } from "../monitor/transfer/consumer.js";

/**
 * Get port from environment and store in Express.
 */
const port = parseInt(config.PORT!);
app.set("port", port);

/**
 * Routes
 */

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("listening", onListening);

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr!.port}`;

  genericLogger.info(`listening on ${bind}`);
}

server.on("upgrade", function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, (ws) => {
    genericLogger.info("Client upgrades to websocket");
  });
});

// await startEthMonitor();

// startTransferMonitor();
// startTransferConsumer();
