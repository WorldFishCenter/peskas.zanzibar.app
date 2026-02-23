import { createTRPCRouter, publicProcedure } from "../trpc";
import { MonthlySummaryDistrictModel } from "@repo/nosql/schema/monthly-summary-district";
import { z } from "zod";

export const monthlySummaryRouter = createTRPCRouter({
  districts: publicProcedure.query(async () => {
    const districts = await MonthlySummaryDistrictModel.distinct("gaul_2_name");
    // Filter out null/undefined values and ensure they are strings
    const validDistricts = districts.filter((d): d is string =>
      d !== null && d !== undefined && typeof d === "string"
    );
    return validDistricts.sort((a, b) => a.localeCompare(b));
  }),

  timeSeries: publicProcedure
    .input(z.object({
      districts: z.array(z.string().nullable()).transform(arr => arr.filter((d): d is string => d !== null)),
      metrics: z.array(z.string()),
      months: z.number().default(12)
    }))
    .query(async ({ input }) => {
      const { districts, metrics, months } = input;

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - months);

      const data = await MonthlySummaryDistrictModel.find({
        gaul_2_name: { $in: districts },
        metric: { $in: metrics },
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 }).lean();

      // Group by date and metric (keys are gaul_2_name)
      const grouped: Record<string, Record<string, Record<string, number>>> = data.reduce((acc, item) => {
        const dateKey = item.date.toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = {};
        if (!acc[dateKey][item.metric]) acc[dateKey][item.metric] = {};
        acc[dateKey][item.metric][item.gaul_2_name] = item.value;
        return acc;
      }, {} as Record<string, Record<string, Record<string, number>>>);

      return grouped;
    }),

  radarData: publicProcedure
    .input(z.object({
      districts: z.array(z.string().nullable()).transform(arr => arr.filter((d): d is string => d !== null)),
      metrics: z.array(z.string()),
      months: z.number().min(1).max(72).default(12)
    }))
    .query(async ({ input }) => {
      const { districts, metrics, months } = input;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - months);

      const data = await MonthlySummaryDistrictModel.find({
        gaul_2_name: { $in: districts },
        metric: { $in: metrics },
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 }).lean();

      // Build chronological list of (year, month) for the range
      const points: { year: number; month: number }[] = [];
      const d = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      for (let i = 0; i < months; i++) {
        points.push({ year: d.getFullYear(), month: d.getMonth() });
        d.setMonth(d.getMonth() - 1);
      }
      points.reverse();

      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const yearsInRange = new Set(points.map(p => p.year));
      const spanYears = yearsInRange.size > 1;

      return points.map(({ year, month }) => {
        const monthData = data.filter(
          item =>
            item.date.getFullYear() === year &&
            item.date.getMonth() === month &&
            item.metric === metrics[0]
        );
        const districtValues: Record<string, number> = {};
        districts.forEach((name) => {
          const nameData = monthData.filter(item => item.gaul_2_name === name);
          if (nameData.length > 0) {
            const avg = nameData.reduce((sum, item) => sum + (item.value || 0), 0) / nameData.length;
            districtValues[name] = Math.round(avg * 100) / 100;
          }
        });
        const monthLabel = spanYears ? `${monthNames[month]} ${year}` : monthNames[month];
        return { month: monthLabel, ...districtValues };
      });
    }),
}); 