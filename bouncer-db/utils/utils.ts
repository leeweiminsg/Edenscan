import { Document } from "mongoose";
import _ from "lodash";
import { BN } from "bn.js";

import { genericLogger } from "../logger/logger.js";

export const toHumanDocumentArray = (documents: Document[]) => {
  return _.map(documents, (document) => toHumanDocument(document));
};

// run getters in document to convert to human readable form
export const toHumanDocument = (document: Document) => {
  try {
    // JSON.stringify() runs mongoose getters
    const strigifiedDoc = JSON.stringify(document);

    return JSON.parse(strigifiedDoc);
  } catch (err) {
    genericLogger.error(`toHumanDocument error: ${err}`);
  }
};

export const strip0x = (hex: string): string => {
  return hex.slice(2, hex.length);
};

// Converts event signature topic to human readable format
export const hexToStrSignature = (signatureHex: string): string => {
  if (
    signatureHex ===
    "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62"
  ) {
    return "TransferSingle(address,address,address,uint256,uint256)";
  } else if (
    signatureHex ===
    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
  ) {
    return "Transfer(address,address,uint256)";
  }

  throw new Error(
    `hexToStrSignature error: Unknown signatureHex - ${signatureHex}`
  );
};

export const intToHexArray = (intArray: string[]): string[] => {
  return _.map(intArray, (int) => intToHex(int));
};

export const hexToInt = (hex: string): string => {
  const bn = new BN(hex, 16);

  return bn.toString();
};

export const intToHex = (int: string): string => {
  const bn = new BN(int);

  return bn.toJSON();
};
