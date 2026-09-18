import { z } from "zod";

export const productIdParamSchema = z.object({
    productId: z.coerce
        .number()
        .int("Product ID must be an integer")
        .positive("Product ID must be greater than 0"),
});

export const recordPriceSchema = z.object({
    price: z.coerce
        .number()
        .nonnegative("Price cannot be negative"),

    recordedAt: z.preprocess(
        (value) => {
            if (
                value === "" ||
                value === null ||
                value === undefined
            ) {
                return undefined;
            }

            return value;
        },
        z.coerce
            .date()
            .optional()
    ),
});

export type RecordPriceInput = z.infer<typeof recordPriceSchema>;