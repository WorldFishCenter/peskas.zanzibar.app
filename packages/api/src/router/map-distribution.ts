import { MapDistributionModel } from "@repo/nosql/schema/map-distribution";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const mapDistributionRouter = createTRPCRouter({
  all: protectedProcedure
    .query(() => {
      return MapDistributionModel
        .find({})
        .select({
          _id: 0,
        })      
        .exec()
    }),
});