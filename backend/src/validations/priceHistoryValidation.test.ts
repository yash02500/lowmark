import { describe, it, expect } from "@jest/globals";
import { productIdParamSchema, recordPriceSchema } from "./priceHistoryValidation";

describe("productIdParamSchema", () => {
    it("should accept a valid product ID", () => {
        const result = productIdParamSchema.safeParse({
            productId: 12,
        });

        expect(result.success).toBe(true);
    });

    it("should convert a numeric string to a number", () => {
        const result = productIdParamSchema.safeParse({
            productId: "25",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.productId).toBe(25);
        }
    });

    it("should reject a non-numeric product ID", () => {
        const result = productIdParamSchema.safeParse({
            productId: "abc",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a product ID of zero", () => {
        const result = productIdParamSchema.safeParse({
            productId: "0",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a negative product ID", () => {
        const result = productIdParamSchema.safeParse({
            productId: "-5",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a decimal product ID", () => {
        const result = productIdParamSchema.safeParse({
            productId: "2.5",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a missing product ID", () => {
        const result = productIdParamSchema.safeParse({});

        expect(result.success).toBe(false);
    });
});

describe("recordPriceSchema", () => {
    it("should accept a valid price", () => {
        const result = recordPriceSchema.safeParse({
            price: 1500,
        });

        expect(result.success).toBe(true);
    });

    it("should accept a price of zero", () => {
        const result = recordPriceSchema.safeParse({
            price: 0,
        });

        expect(result.success).toBe(true);
    });

    it("should convert a numeric string to a number", () => {
        const result = recordPriceSchema.safeParse({
            price: "2500",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.price).toBe(2500);
        }
    });

    it("should reject a negative price", () => {
        const result = recordPriceSchema.safeParse({
            price: -100,
        });

        expect(result.success).toBe(false);
    });

    it("should reject a non-numeric price", () => {
        const result = recordPriceSchema.safeParse({
            price: "invalid",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a missing price", () => {
        const result = recordPriceSchema.safeParse({});

        expect(result.success).toBe(false);
    });

    it("should accept a valid recordedAt date", () => {
        const result = recordPriceSchema.safeParse({
            price: 1500,
            recordedAt: "2026-10-16T10:00:00.000Z",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.recordedAt).toBeInstanceOf(Date);
        }
    });

    it("should allow recordedAt to be omitted", () => {
        const result = recordPriceSchema.safeParse({
            price: 1500,
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.recordedAt).toBeUndefined();
        }
    });

    it("should treat an empty recordedAt as undefined", () => {
        const result = recordPriceSchema.safeParse({
            price: 1500,
            recordedAt: "",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.recordedAt).toBeUndefined();
        }
    });

    it("should treat a null recordedAt as undefined", () => {
        const result = recordPriceSchema.safeParse({
            price: 1500,
            recordedAt: null,
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.recordedAt).toBeUndefined();
        }
    });

    it("should reject an invalid recordedAt date", () => {
        const result = recordPriceSchema.safeParse({
            price: 1500,
            recordedAt: "not-a-date",
        });

        expect(result.success).toBe(false);
    });
});
