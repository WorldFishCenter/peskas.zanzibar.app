import { z } from 'zod';

export const GenerateResetPasswordTokenSchema = z.object({
  email: z.string()
    .min(1)
    .email(),
});

export const ResetPasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// generate form types from zod validation schema
export type GenerateResetPasswordTokenType = z.infer<typeof GenerateResetPasswordTokenSchema>;
