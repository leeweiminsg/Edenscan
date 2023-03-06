import {
  LocalContract,
  ERC20,
  ERC721,
  ERC1155,
} from "../types/localContract.js";
import {
  pudgyPenguinContract,
  FXSContract,
  openseaStorefrontContract,
} from "./contracts.js";

export const localPudgyPenguinContract = new LocalContract(
  pudgyPenguinContract,
  ERC721
);
export const localFXSContract = new LocalContract(FXSContract, ERC20);
export const localOpenseaStorefrontContract = new LocalContract(
  openseaStorefrontContract,
  ERC1155
);
