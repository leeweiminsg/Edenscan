import _ from "lodash";

import {
  localFXSContract,
  localPudgyPenguinContract,
  localOpenseaStorefrontContract,
} from "../../contracts/localContracts.js";
import { TransferEvent } from "../../types/localEvent.js";

// ERC721
// localPudgyPenguinContract.addEventListener(TransferEvent.eventName);
// localFXSContract.addEventListener(TransferEvent.eventName);

export const startTransferMonitor = () => {
  // ERC1155
  localOpenseaStorefrontContract.addEventListener(TransferEvent.eventName);
};
