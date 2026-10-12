import { createProductSchema } from "./productValidation";
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