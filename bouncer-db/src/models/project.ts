import pkg from "mongoose";
const { Schema } = pkg;

import { UserSchema } from "./user.js";
import { RuleSchema } from "./rule.js";
import { stripLeftPaddingAddress } from "../../utils/address.js";

export const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    contractAddress: {
      type: String,
    },
    discordGuildId: {
      type: String,
    },
    discordChannelId: {
      type: String,
    },
    users: [UserSchema],
    rules: [RuleSchema],
    block: {
      type: Number,
    },
    meta: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map<string, any>(),
    },
    ownerAddress: {
      type: String,
    },
    tokenIds: {
      type: [String],
    },
    totalSupply: {
      type: Number,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ProjectSchema.path("ownerAddress").get((ownerAddress) =>
  stripLeftPaddingAddress(ownerAddress)
);
