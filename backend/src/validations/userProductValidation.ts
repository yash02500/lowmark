import { z } from "zod";

export const trackProductSchema = z.object({
    productId: z.coerce.number().int().positive(),
    targetPrice: z.coerce.number().positive().optional(),
});

export const userProductIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});