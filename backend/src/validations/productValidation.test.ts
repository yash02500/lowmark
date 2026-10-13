import { createProductSchema, productIdParamSchema } from "./productValidation";
import { describe, it, expect } from "@jest/globals";
describe("createProductSchema", () => {
    it("should accept a valid product URL", () => {
        const result = createProductSchema.safeParse({
            url: "https://www.amazon.in/dp/B0ABC12345",
        });

        expect(result.success).toBe(true);
    });

    it("should reject an invalid URL", () => {
        const result = createProductSchema.safeParse({
            url: "not-a-valid-url",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a missing URL", () => {
        const result = createProductSchema.safeParse({});

        expect(result.success).toBe(false);
    });

    it("should reject an empty URL", () => {
        const result = createProductSchema.safeParse({
            url: "",
        });

        expect(result.success).toBe(false);
    });
});

describe("productIdParamSchema", () => {
    it("should accept a valid product ID", () => {
        const result = productIdParamSchema.safeParse({
            id: "12",
        });

        expect(result.success).toBe(true);
    });

    it("should reject a non-numeric product ID", () => {
        const result = productIdParamSchema.safeParse({
            id: "abc",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a product ID of zero", () => {
        const result = productIdParamSchema.safeParse({
            id: "0",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a negative product ID", () => {
        const result = productIdParamSchema.safeParse({
            id: "-5",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a decimal product ID", () => {
        const result = productIdParamSchema.safeParse({
            id: "1.5",
        });

        expect(result.success).toBe(false);
    });
})