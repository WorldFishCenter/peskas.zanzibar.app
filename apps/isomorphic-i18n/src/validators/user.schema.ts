import mongoose from "mongoose";
import { string, z } from "zod";

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
  password: z.string().optional(),
  role: z.string().min(1),
  status: z.string().min(1),
  bmuNames: z.object({
    label: z.string(),
    value: z.string(),
  }).array(),
});

// generate form types from zod validation schema
export type UpsertUserSchemaType = z.infer<typeof UpsertUserSchema>;
