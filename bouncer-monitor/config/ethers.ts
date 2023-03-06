import ethers from "ethers";

import { config } from "../config/config.js";

// will indefinitely cache the chain ID, which can reduce network traffic and reduce round-trip queries for the chain ID
export const provider = new ethers.providers.StaticJsonRpcProvider(
  config.PROVIDER_URL
);
