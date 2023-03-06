import pkg from "mongoose";
const { Schema } = pkg;

export const UserSchema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    balance: {
      type: Number,
    },
    discordUserId: {
      type: String,
      required: true,
    },
    discordRoleId: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false, timestamps: true }
);

UserSchema.index(
  { project: 1, walletAddress: 1 },
  { unique: true, sparse: true }
);
