import type { Types } from "mongoose";
import mongoose, { Schema } from "mongoose";

/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type TCatchMonthly = {
  _id: Types.ObjectId;
  BMU: string;
  date: Date;
};

/**
 * Schema
 */
const catchMonthlySchema = new Schema<TCatchMonthly>(
  {
    BMU: String,
    date: Date,
  },
  {
    collection: "catch_monthly",
  },
);

/**
 * Model
 */
export const CatchMonthlyModel =
  (mongoose.models.CatchMonthly as mongoose.Model<TCatchMonthly>) ??
  mongoose.model<TCatchMonthly>("CatchMonthly", catchMonthlySchema);
