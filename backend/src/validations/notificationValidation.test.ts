import { describe, it, expect } from "@jest/globals";
import { notificationIdParamSchema } from "./notificationValidation";

describe("notificationIdParamSchema", () => {
    it("should accept a valid notification ID", () => {
        const result = notificationIdParamSchema.safeParse({
            id: 10,
        });

        expect(result.success).toBe(true);
    });

    it("should convert a numeric string to a number", () => {
        const result = notificationIdParamSchema.safeParse({
            id: "25",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.id).toBe(25);
        }
    });

    it("should reject a non-numeric notification ID", () => {
        const result = notificationIdParamSchema.safeParse({
            id: "abc",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a notification ID of zero", () => {
        const result = notificationIdParamSchema.safeParse({
            id: "0",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a negative notification ID", () => {
        const result = notificationIdParamSchema.safeParse({
            id: "-5",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a decimal notification ID", () => {
        const result = notificationIdParamSchema.safeParse({
            id: "2.5",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a missing notification ID", () => {
        const result = notificationIdParamSchema.safeParse({});

        expect(result.success).toBe(false);
    });

    it("should reject an empty notification ID", () => {
        const result = notificationIdParamSchema.safeParse({
            id: "",
        });

        expect(result.success).toBe(false);
    });
});
