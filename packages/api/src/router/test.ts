import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const testRouter = createTRPCRouter({
  sayHello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input, ctx }) => {
      return { output: `Hello ${input.name}.`, filter: ctx.globalFilter };
    }),
});
