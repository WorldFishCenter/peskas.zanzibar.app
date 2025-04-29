import { createTRPCRouter } from "../trpc";
import { userRouter } from "./user";
import { authRouter } from "./auth";
import { aggregatedCatchRouter } from "./aggregated-catch";
import { bmuRouter } from "./bmu";
import { gearRouter } from "./gear";
import { monthlyStatsRouter } from "./monthly-stats";

export const appRouter = createTRPCRouter({
  user: userRouter,
  auth: authRouter,
  aggregatedCatch: aggregatedCatchRouter,
  bmu: bmuRouter,
  gear: gearRouter,
  monthlyStats: monthlyStatsRouter,
}); 