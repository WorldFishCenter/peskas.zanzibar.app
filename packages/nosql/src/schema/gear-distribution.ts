import type { Types } from "mongoose";
import mongoose, { Schema } from "mongoose";

/* eslint-disable @typescript-eslint/consistent-type-definitions */
export type TGearDistribution = {
  _id: Types.ObjectId;
  landing_site: string;
  gear: string;
  gear_n: number;
  gear_perc: number;
};

/**
 * Schema
 */
const gearDistributionSchema = new Schema<TGearDistribution>(
  {
    landing_site: String,
    gear: String,
    gear_n: Number,
    gear_perc: Number,
  },
  {
    collection: "gear_distribution",
  },
);

/**
 * Model
 */
export const GearDistributionModel =
  (mongoose.models.GearDistribution as mongoose.Model<TGearDistribution>) ??
  mongoose.model<TGearDistribution>("GearDistribution", gearDistributionSchema);
