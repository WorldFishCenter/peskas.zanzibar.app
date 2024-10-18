import { pingRouter } from "./router/ping";
import { testRouter } from "./router/test";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  ping: pingRouter,
  test: testRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
