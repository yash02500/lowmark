import { describe, it, expect } from "@jest/globals";
import { trackProductSchema, userProductIdParamSchema } from "./userProductValidation";

describe("trackProductSchema", () => {
    it("should accept valid product tracking data", () => {
        const result = trackProductSchema.safeParse({
            productId: 12,
            targetPrice: 5000,
        });

        expect(result.success).toBe(true);
    });

    it("should accept numeric strings and convert them to numbers", () => {
        const result = trackProductSchema.safeParse({
            productId: "12",
            targetPrice: "5000",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.productId).toBe(12);
            expect(result.data.targetPrice).toBe(5000);
        }
    });

    it("should accept tracking data without an optional target price", () => {
        const result = trackProductSchema.safeParse({
            productId: 12,
        });

        expect(result.success).toBe(true);
    });

    it("should reject a non-numeric product ID", () => {
        const result = trackProductSchema.safeParse({
            productId: "abc",
            targetPrice: 5000,
        });

        expect(result.success).toBe(false);
    });

    it("should reject a product ID of zero", () => {
        const result = trackProductSchema.safeParse({
            productId: 0,
        });

        expect(result.success).toBe(false);
    });

    it("should reject a negative product ID", () => {
        const result = trackProductSchema.safeParse({
            productId: -5,
        });

        expect(result.success).toBe(false);
    });

    it("should reject a decimal product ID", () => {
        const result = trackProductSchema.safeParse({
            productId: 1.5,
        });

        expect(result.success).toBe(false);
    });

    it("should reject a target price of zero", () => {
        const result = trackProductSchema.safeParse({
            productId: 12,
            targetPrice: 0,
        });

        expect(result.success).toBe(false);
    });

    it("should reject a negative target price", () => {
        const result = trackProductSchema.safeParse({
            productId: 12,
            targetPrice: -100,
        });

        expect(result.success).toBe(false);
    });
});

describe("userProductIdParamSchema", () => {
    it("should accept a valid user-product ID", () => {
        const result = userProductIdParamSchema.safeParse({
            id: "25",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.id).toBe(25);
        }
    });

    it("should reject a non-numeric ID", () => {
        const result = userProductIdParamSchema.safeParse({
            id: "abc",
        });

        expect(result.success).toBe(false);
    });

    it("should reject an ID of zero", () => {
        const result = userProductIdParamSchema.safeParse({
            id: "0",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a negative ID", () => {
        const result = userProductIdParamSchema.safeParse({
            id: "-5",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a decimal ID", () => {
        const result = userProductIdParamSchema.safeParse({
            id: "2.5",
        });

        expect(result.success).toBe(false);
    });
});
