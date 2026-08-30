import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name should have minimum 2 characters")
        .max(50, "Maximum characters in name should be less than 50"),

    email: z.email(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(20, "Password cannot exceed 20 characters"),
});

export const loginSchema = z.object({
    email: z.email(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
});

export const forgotPasswordSchema =
    z.object({email: z.email().trim()});

export const resetPasswordSchema =
    z.object({
        token: z
            .string()
            .min(1, "Reset token is required"),

        password: z
            .string()
            .min(
                8,
                "Password must be at least 8 characters"
            ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;