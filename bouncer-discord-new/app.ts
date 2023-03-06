import express from "express";
import helmet from "helmet";

import { discordRouter } from "./routes/discord.js";

export const app = express();

app.use(express.json());

// Security
app.use(helmet());

// Routing
app.use("/discord", discordRouter);
