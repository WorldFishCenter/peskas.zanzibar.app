import { z } from "zod";

import { CatchMonthlyModel } from "@repo/nosql/schema/catch-monthly";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const aggregatedCatchRouter = createTRPCRouter({
  monthly: protectedProcedure
    .query(() => {
      return CatchMonthlyModel.aggregate([
        {
          $match: {
            BMU: "Kenyatta"  // We'll verify if this is the correct BMU name from the logs
          }
        },
        {
          $project: {
            _id: 0,
            date: 1,
            mean_trip_catch: 1
          }
        },
        {
          $sort: { date: 1 }
        }
      ]).exec()
    }),
  meanCatchRadar: protectedProcedure
    .query(() => {
      return CatchMonthlyModel.aggregate([
        {
          $match: {
            BMU: "Bureni",
            mean_trip_catch: { $ne: null }
          }
        },
        {
          $addFields: {
            monthNum: { $month: "$date" }
          }
        },
        {
          $group: {
            _id: "$monthNum",
            meanCatch: { $avg: "$mean_trip_catch" }
          }
        },
        {
          $project: {
            _id: 0,
            monthNum: "$_id",
            month: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", 1] }, then: "Jan" },
                  { case: { $eq: ["$_id", 2] }, then: "Feb" },
                  { case: { $eq: ["$_id", 3] }, then: "Mar" },
                  { case: { $eq: ["$_id", 4] }, then: "Apr" },
                  { case: { $eq: ["$_id", 5] }, then: "May" },
                  { case: { $eq: ["$_id", 6] }, then: "Jun" },
                  { case: { $eq: ["$_id", 7] }, then: "Jul" },
                  { case: { $eq: ["$_id", 8] }, then: "Aug" },
                  { case: { $eq: ["$_id", 9] }, then: "Sep" },
                  { case: { $eq: ["$_id", 10] }, then: "Oct" },
                  { case: { $eq: ["$_id", 11] }, then: "Nov" },
                  { case: { $eq: ["$_id", 12] }, then: "Dec" }
                ],
                default: "Unknown"
              }
            },
            meanCatch: { $round: ["$meanCatch", 1] }
          }
        },
        {
          $sort: { monthNum: 1 }  // Sort by numeric month value
        },
        {
          $project: {  // Remove the monthNum field from final output
            monthNum: 0
          }
        }
      ]).exec();
    }),  
});