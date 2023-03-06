import { ethers } from "ethers";

import { provider } from "../config/ethers.js";
import pudgyPenguinABI from "../abi/pudgyPenguin.json";
import FXSABI from "../abi/FXS.json";
import openseaStorefrontABI from "../abi/openseaStorefront.json";

// Pudgy Penguin
const pudgyPenguinContractAddress =
  "0xbd3531da5cf5857e7cfaa92426877b022e612cf8";
export const pudgyPenguinContract = new ethers.Contract(
  pudgyPenguinContractAddress,
  pudgyPenguinABI,
  provider
);

// Frax Shares
const FXSContractAddress = "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0";
export const FXSContract = new ethers.Contract(
  FXSContractAddress,
  FXSABI,
  provider
);

// Opensea Storefront
const openseaStorefrontAddress = "0x495f947276749ce646f68ac8c248420045cb7b5e";
export const openseaStorefrontContract = new ethers.Contract(
  openseaStorefrontAddress,
  openseaStorefrontABI,
  provider
);
