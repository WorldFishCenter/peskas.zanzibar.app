import { MonthlyStatsModel } from "@repo/nosql/schema/monthly-stats";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const monthlyStatsRouter = createTRPCRouter({
  allStats: protectedProcedure
    .query(async () => {
      const data = await MonthlyStatsModel
      .find({ 
        landing_site: "kenyatta",
      })
      .sort({ date: -1 })
      .limit(7)  // Get 7 to calculate percentage change
      .exec();

      // Calculate month-over-month changes and format data
      return {
        submissions: {
          current: data[0].tot_submissions,
          percentage: calculatePercentageChange(data[0].tot_submissions, data[1].tot_submissions),
          trend: data.slice(0, 6).map(d => ({
            day: new Date(d.date).toLocaleString('default', { month: 'short' }),
            sale: d.tot_submissions
          })).reverse()
        },
        fishers: {
          current: data[0].tot_fishers,
          percentage: calculatePercentageChange(data[0].tot_fishers, data[1].tot_fishers),
          trend: data.slice(0, 6).map(d => ({
            day: new Date(d.date).toLocaleString('default', { month: 'short' }),
            sale: d.tot_fishers
          })).reverse()
        },
        catches: {
          current: data[0].tot_catches,
          percentage: calculatePercentageChange(data[0].tot_catches, data[1].tot_catches),
          trend: data.slice(0, 6).map(d => ({
            day: new Date(d.date).toLocaleString('default', { month: 'short' }),
            sale: d.tot_catches
          })).reverse()
        },
        weight: {
          current: data[0].tot_kg,
          percentage: calculatePercentageChange(data[0].tot_kg, data[1].tot_kg),
          trend: data.slice(0, 6).map(d => ({
            day: new Date(d.date).toLocaleString('default', { month: 'short' }),
            sale: d.tot_kg
          })).reverse()
        }
      };
    }),
});

function calculatePercentageChange(current: number, previous: number): number {
  if (!previous) return 0;
  return Number(((current - previous) / previous * 100).toFixed(2));
}