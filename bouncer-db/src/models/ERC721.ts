import pkg from "mongoose";
const { Schema } = pkg;

import { hexToStrSignature, hexToInt, strip0x } from "../../utils/utils.js";
import { stripLeftPaddingAddress } from "../../utils/address.js";

export const ERC721Schema = new Schema(
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
    blockNumber: {
      type: Number,
      required: true,
      index: true,
    },
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

ERC721Schema.path("signatureTopic").get((signatureTopic) =>
  hexToStrSignature(signatureTopic)
);
ERC721Schema.path("fromAddress").get((fromAddressTopic) =>
  stripLeftPaddingAddress(fromAddressTopic)
);
ERC721Schema.path("toAddress").get((toAddressTopic) =>
  stripLeftPaddingAddress(toAddressTopic)
);
ERC721Schema.path("tokenId").get((tokenIdHex) => hexToInt(strip0x(tokenIdHex)));
