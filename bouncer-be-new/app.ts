import express from "express";
import helmet from "helmet";

import { usersRouter } from "./routes/users.js";

export const app = express();

app.use(express.json());

// Security
app.use(helmet());

// Routing
app.use("/users", usersRouter);
