import pkg from "mongoose";
const { Schema } = pkg;

export const BlockSchema = new Schema({
  blockNumber: {
    type: Number,
    required: true,
    index: { unique: true },
  },
  date: {
    type: Date,
    required: true,
    index: { unique: true },
  },
});
