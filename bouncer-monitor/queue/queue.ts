import Queue from "bull";

import { config } from "../config/config.js";

export const eventQueue = new Queue("Event Queue", config.REDIS_URL!);
