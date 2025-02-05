import mongoose from "mongoose";
import { z } from "zod";

// form zod validation schema
export const UpsertUserSchema = z.object({
  _id: z
    .string()
    .refine((val) => {
      return mongoose.Types.ObjectId.isValid(val);
    })
    .optional(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  status: z.string().min(1),
  bmuNames: z.string().array(),
});

// generate form types from zod validation schema
export type UpsertUserSchemaType = z.infer<typeof UpsertUserSchema>;
