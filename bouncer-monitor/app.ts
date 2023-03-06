import express from "express";
import helmet from "helmet";
import { WebSocketServer } from "ws";

export const app = express();

app.use(express.json());

// Security
app.use(helmet());

export const wss = new WebSocketServer({ noServer: true });
