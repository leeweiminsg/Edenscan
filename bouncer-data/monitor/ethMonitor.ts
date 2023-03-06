// import WebSocket from "ws";

// import { genericLogger } from "../logger/logger.js";
// import { config } from "../config/config.js";
// import { wsSend } from "../app.js";

// export const wsReceive = new WebSocket(config.ETH_MONITOR_URL);

// wsReceive.on("open", () => {
//   genericLogger.info("wsReceive: Connected");
// });

// wsReceive.on("message", (blockNumber) => {
//   genericLogger.info(
//     `Received updated block number from websocket server: ${blockNumber}`
//   );

//   wsSend.clients.forEach((client) => {
//     if (client !== wsReceive && client.readyState === WebSocket.OPEN) {
//       client.send(blockNumber, { binary: false });
//     }
//   });

//   genericLogger.info(
//     `Send updated block number to websocket clients: ${blockNumber}`
//   );
// });

// wsReceive.on("close", () => {
//   genericLogger.info("wsReceive: Closed");
// });
