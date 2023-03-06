import express from "express";
import helmet from "helmet";
// import { WebSocketServer } from "ws";

import { dataRouter } from "./routes/data.js";
import { ownershipRouter } from "./routes/ownership.js";
import { seniorityRouter } from "./routes/seniority.js";
import { diamondHandsRouter } from "./routes/diamondHands.js";
import { mintsRouter } from "./routes/mints.js";
import { statsRouter } from "./routes/stats.js";
import { userRouter } from "./routes/user.js";

export const app = express();

app.use(express.json());

// Security
app.use(helmet());

// Routing
app.use("/data", dataRouter);
app.use("/ownership", ownershipRouter);
app.use("/seniority", seniorityRouter);
app.use("/diamond-hands", diamondHandsRouter);
app.use("/mints", mintsRouter);
app.use("/stats", statsRouter);
app.use("/user", userRouter);

// export const wsSend = new WebSocketServer({ noServer: true });