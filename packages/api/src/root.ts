import { pingRouter } from "./router/ping";
import { aggregatedCatchRouter } from "./router/aggregated-catch";
import { mapDistributionRouter } from "./router/map-distribution";
import { gearRouter } from "./router/gear";
import { monthlyStatsRouter } from "./router/monthly-stats";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  ping: pingRouter,
  aggregatedCatch: aggregatedCatchRouter,
  gear: gearRouter,
  mapDistribution: mapDistributionRouter,
  monthlyStats: monthlyStatsRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
