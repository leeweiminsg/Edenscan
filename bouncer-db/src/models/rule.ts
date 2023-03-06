import pkg from "mongoose";
const { Schema } = pkg;

export const RuleSchema = new Schema(
  {
    tokenStandard: {
      type: String,
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    logicType: {
      type: String,
      required: true,
    },
    logic: {
      type: Map,
      of: Number,
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
  { timestamps: true }
);

RuleSchema.index({ project: 1, logicType: 1 }, { unique: true, sparse: true });
