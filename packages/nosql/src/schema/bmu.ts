import type { Types } from "mongoose";
import mongoose, { Schema } from "mongoose";

/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type TBmu = {
  _id: Types.ObjectId;
  BMU: string;
  size_km: number;
};

/**
 * Schema
 */
const bmuSchema = new Schema<TBmu>(
  {
    BMU: String,
    size_km: Number,
  },
  {
    collection: "bmu",
  },
);

/**
 * Model
 */
export const BmuModel =
  (mongoose.models.Bmu as mongoose.Model<TBmu>) ??
  mongoose.model<TBmu>("Bmu", bmuSchema);
