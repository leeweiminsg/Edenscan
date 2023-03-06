import pkg from "mongoose";
const { Schema } = pkg;

import { hexToStrSignature, hexToInt } from "../../utils/utils.js";
import { stripLeftPaddingAddress } from "../../utils/address.js";

export const OpenseaOpenstoreSchema = new Schema(
  {
    projectName: { type: String, index: true },
    signatureTopic: {
      type: String,
      required: true,
    },
    fromAddress: {
      type: String,
      required: true,
      index: true,
    },
    toAddress: {
      type: String,
      required: true,
      index: true,
    },
    tokenId: {
      type: String,
      required: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
    },
    blockNumber: {
      type: Number,
      required: true,
      index: true,
    },
    // Can have more than one transfers in a single tx
    transactionHash: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      indexed: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.id;
      },
    },
  }
);

// Composite key
OpenseaOpenstoreSchema.index(
  {
    signatureTopic: 1,
    fromAddress: 1,
    toAddress: 1,
    tokenId: 1,
    value: 1,
    blockNumber: 1,
    transactionHash: 1,
  },
  { unique: true }
);

OpenseaOpenstoreSchema.path("signatureTopic").get((signatureTopic) =>
  hexToStrSignature(signatureTopic)
);
OpenseaOpenstoreSchema.path("fromAddress").get((fromAddressTopic) =>
  stripLeftPaddingAddress(fromAddressTopic)
);
OpenseaOpenstoreSchema.path("toAddress").get((toAddressTopic) =>
  stripLeftPaddingAddress(toAddressTopic)
);
// As shown in opensea
OpenseaOpenstoreSchema.path("tokenId").get((tokenIdHex) =>
  hexToInt(tokenIdHex)
);
OpenseaOpenstoreSchema.path("value").get((valueHex) => hexToInt(valueHex));
