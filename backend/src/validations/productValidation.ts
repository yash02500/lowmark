import { z } from "zod";

export const createProductSchema = z.object({
    url: z.url("Invalid product url").trim(),
});

export const productIdParamSchema = z.object({
    id: z
        .string()
        .trim()
        .regex(/^\d+$/, "Product ID must be a valid number")
        .transform(Number)
        .refine((value) => value > 0, {
            message: "Product ID must be greater than 0",
        }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;