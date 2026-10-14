import { describe, it, expect } from "@jest/globals";

import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateMeSchema,
    refreshTokenSchema,
    verifyEmailSchema,
} from "./authValidation";

// Registration tests
describe("registerSchema", () => {
    it("should accept valid registration data", () => {
        const result = registerSchema.safeParse({
            name: "Alex Smith",
            email: "alex@example.com",
            password: "password123",
        });

        expect(result.success).toBe(true);
    });

    it("should trim whitespace from the name", () => {
        const result = registerSchema.safeParse({
            name: "  Alex  ",
            email: "alex@example.com",
            password: "password123",
        });

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data.name).toBe("Alex");
        }
    });

    it("should reject a name shorter than 2 characters", () => {
        const result = registerSchema.safeParse({
            name: "A",
            email: "alex@example.com",
            password: "password123",
        });

        expect(result.success).toBe(false);
    });

    it("should reject an invalid email", () => {
        const result = registerSchema.safeParse({
            name: "Alex",
            email: "invalid-email",
            password: "password123",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a password shorter than 8 characters", () => {
        const result = registerSchema.safeParse({
            name: "Alex",
            email: "alex@example.com",
            password: "short",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a password longer than 20 characters", () => {
        const result = registerSchema.safeParse({
            name: "Alex",
            email: "alex@example.com",
            password: "a".repeat(21),
        });

        expect(result.success).toBe(false);
    });
});

// Login tests
describe("loginSchema", () => {
    it("should accept valid login data", () => {
        const result = loginSchema.safeParse({
            email: "alex@example.com",
            password: "password123",
        });

        expect(result.success).toBe(true);
    });

    it("should reject an invalid email", () => {
        const result = loginSchema.safeParse({
            email: "invalid-email",
            password: "password123",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a password shorter than 8 characters", () => {
        const result = loginSchema.safeParse({
            email: "alex@example.com",
            password: "short",
        });

        expect(result.success).toBe(false);
    });

    it("should reject missing login fields", () => {
        const result = loginSchema.safeParse({});

        expect(result.success).toBe(false);
    });
});

// Forgot-password tests
describe("forgotPasswordSchema", () => {
    it("should accept a valid email", () => {
        const result = forgotPasswordSchema.safeParse({
            email: "alex@example.com",
        });

        expect(result.success).toBe(true);
    });

    it("should reject an invalid email", () => {
        const result = forgotPasswordSchema.safeParse({
            email: "not-an-email",
        });

        expect(result.success).toBe(false);
    });
});

// Reset-password tests
describe("resetPasswordSchema", () => {
    it("should accept a valid reset token and password", () => {
        const result = resetPasswordSchema.safeParse({
            token: "valid-reset-token",
            password: "newpassword123",
        });

        expect(result.success).toBe(true);
    });

    it("should reject an empty reset token", () => {
        const result = resetPasswordSchema.safeParse({
            token: "",
            password: "newpassword123",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a password shorter than 8 characters", () => {
        const result = resetPasswordSchema.safeParse({
            token: "valid-reset-token",
            password: "short",
        });

        expect(result.success).toBe(false);
    });
});

// Update-profile tests
describe("updateMeSchema", () => {
    it("should accept valid profile data", () => {
        const result = updateMeSchema.safeParse({
            name: "Alex Smith",
            email: "alex@example.com",
        });

        expect(result.success).toBe(true);
    });

    it("should reject an empty name", () => {
        const result = updateMeSchema.safeParse({
            name: "   ",
            email: "alex@example.com",
        });

        expect(result.success).toBe(false);
    });

    it("should reject an invalid email", () => {
        const result = updateMeSchema.safeParse({
            name: "Alex",
            email: "invalid-email",
        });

        expect(result.success).toBe(false);
    });
});

// Refresh-token tests
describe("refreshTokenSchema", () => {
    it("should accept a non-empty refresh token", () => {
        const result = refreshTokenSchema.safeParse({
            refreshToken: "some-refresh-token",
        });

        expect(result.success).toBe(true);
    });

    it("should reject an empty refresh token", () => {
        const result = refreshTokenSchema.safeParse({
            refreshToken: "",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a missing refresh token", () => {
        const result = refreshTokenSchema.safeParse({});

        expect(result.success).toBe(false);
    });
});

// Email-verification tests
describe("verifyEmailSchema", () => {
    it("should accept a non-empty verification token", () => {
        const result = verifyEmailSchema.safeParse({
            token: "some-verification-token",
        });

        expect(result.success).toBe(true);
    });

    it("should reject an empty verification token", () => {
        const result = verifyEmailSchema.safeParse({
            token: "",
        });

        expect(result.success).toBe(false);
    });
});
