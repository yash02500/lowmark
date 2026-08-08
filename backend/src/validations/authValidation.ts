import { z } from "zod";

export const registerSchema = z.object({
    name: z
    .string()
    .trim()
    .min(2, "Name should have minimum 2 characters")
    .max(50, "Maximum characters in name should be less than 50"),

    email: z
    .email(),

    password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 20 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;