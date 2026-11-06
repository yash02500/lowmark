import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Request, Response } from "express";
import z from "zod";
import authController from "./authController";
import authService from "../services/authService";
import emailVerificationService from "../services/emailVerificationService";
import passwordResetService from "../services/passwordResetService";
import {
    registerSchema,
    loginSchema,
    updateMeSchema,
    refreshTokenSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "../validations/authValidation";

// Mock services
jest.mock("../services/authService", () => ({
    __esModule: true,
    default: {
        register: jest.fn(),
        login: jest.fn(),
        getMe: jest.fn(),
        updateMe: jest.fn(),
        refreshAccessToken: jest.fn(),
        logout: jest.fn(),
    },
}));

jest.mock("../services/emailVerificationService", () => ({
    __esModule: true,
    default: {
        verifyEmail: jest.fn(),
        resendVerificationEmail: jest.fn(),
    },
}));

jest.mock("../services/passwordResetService", () => ({
    __esModule: true,
    default: {
        requestPasswordReset: jest.fn(),
        resetPassword: jest.fn(),
    },
}));

// Mock validation schemas
jest.mock("../validations/authValidation", () => ({
    registerSchema: { safeParse: jest.fn() },
    loginSchema: { safeParse: jest.fn() },
    forgotPasswordSchema: { parse: jest.fn() },
    resetPasswordSchema: { safeParse: jest.fn() },
    updateMeSchema: { safeParse: jest.fn() },
    refreshTokenSchema: { safeParse: jest.fn() },
    verifyEmailSchema: { safeParse: jest.fn() },
}));

// Express request and response mocks
const createMocks = (
    options: {
        body?: unknown;
        query?: Record<string, unknown>;
        userId?: number;
    } = {}
) => {
    const req = {
        body: options.body ?? {},
        query: options.query ?? {},
        userId: options.userId,
    } as unknown as Request;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    const next = jest.fn();

    return { req, res, next };
};

// Helpers for mocked validation results
const validationSuccess = (schema: unknown, data: unknown) => {
    (schema as any).safeParse.mockReturnValue({
        success: true,
        data,
    });
};

const validationFailure = (schema: unknown) => {
    (schema as any).safeParse.mockReturnValue({
        success: false,
        error: {
            issues: [
                {
                    path: ["email"],
                    message: "Invalid email",
                },
            ],
        },
    });
};

describe("authController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // REGISTER
    describe("register", () => {
        it("should register a user successfully", async () => {
            const input = {
                name: "Test User",
                email: "test@example.com",
                password: "Password123!",
            };

            const user = { id: 1, name: "Test User" };

            validationSuccess(registerSchema, input);

            (authService.register as any).mockResolvedValue(user);

            const { req, res } = createMocks({ body: input });

            await authController.register(req, res);

            expect(authService.register).toHaveBeenCalledWith(input);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "User registered successfully",
                data: user,
            });
        });

        it("should return 400 when validation fails", async () => {
            validationFailure(registerSchema);

            const { req, res } = createMocks();

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Validation failed",
                errors: [
                    {
                        field: "email",
                        message: "Invalid email",
                    },
                ],
            });

            expect(authService.register).not.toHaveBeenCalled();
        });

        it("should return 404 when registration service fails", async () => {
            validationSuccess(registerSchema, {});

            (authService.register as any).mockRejectedValue(
                new Error("Email already exists")
            );

            const { req, res } = createMocks();

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Email already exists",
            });
        });
    });

    // LOGIN
    describe("login", () => {
        it("should login successfully", async () => {
            const input = {
                email: "test@example.com",
                password: "Password123!",
            };

            const user = {
                id: 1,
                accessToken: "access-token",
                refreshToken: "refresh-token",
            };

            validationSuccess(loginSchema, input);

            (authService.login as any).mockResolvedValue(user);

            const { req, res } = createMocks({ body: input });

            await authController.login(req, res);

            expect(authService.login).toHaveBeenCalledWith(input);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Login successful",
                data: user,
            });
        });

        it("should return 400 when login validation fails", async () => {
            validationFailure(loginSchema);

            const { req, res } = createMocks();

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(authService.login).not.toHaveBeenCalled();
        });

        it("should return 404 when login service fails", async () => {
            validationSuccess(loginSchema, {});

            (authService.login as any).mockRejectedValue(
                new Error("Invalid credentials")
            );

            const { req, res } = createMocks();

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid credentials",
            });
        });
    });

    // GET ME
    describe("getMe", () => {
        it("should fetch the authenticated user", async () => {
            const user = { id: 1, name: "Test User" };

            (authService.getMe as any).mockResolvedValue(user);

            const { req, res } = createMocks({ userId: 1 });

            await authController.getMe(req, res);

            expect(authService.getMe).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "User fetched successfully",
                data: user,
            });
        });

        it("should return 404 when fetching the user fails", async () => {
            (authService.getMe as any).mockRejectedValue(
                new Error("User not found")
            );

            const { req, res } = createMocks({ userId: 1 });

            await authController.getMe(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "User not found",
            });
        });
    });

    // UPDATE ME
    describe("updateMe", () => {
        it("should update the user profile successfully", async () => {
            const input = { name: "Updated Name", email: "updated@example.com" };
            const updatedUser = { id: 1, name: "Updated Name" };

            validationSuccess(updateMeSchema, input);

            (authService.updateMe as any).mockResolvedValue(updatedUser);

            const { req, res } = createMocks({
                userId: 1,
                body: input,
            });

            await authController.updateMe(req, res);

            expect(authService.updateMe).toHaveBeenCalledWith(1, input);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Profile updated successfully",
                data: updatedUser,
            });
        });

        it("should return 400 when profile validation fails", async () => {
            validationFailure(updateMeSchema);

            const { req, res } = createMocks({ userId: 1 });

            await authController.updateMe(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(authService.updateMe).not.toHaveBeenCalled();
        });

        it("should return 400 when profile update fails", async () => {
            validationSuccess(updateMeSchema, { name: "Updated Name" });

            (authService.updateMe as any).mockRejectedValue(
                new Error("Update failed")
            );

            const { req, res } = createMocks({ userId: 1 });

            await authController.updateMe(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Update failed",
            });
        });
    });

    // REFRESH TOKEN
    describe("refreshToken", () => {
        it("should refresh the access token successfully", async () => {
            const input = { refreshToken: "valid-refresh-token" };

            validationSuccess(refreshTokenSchema, input);

            (authService.refreshAccessToken as any).mockResolvedValue(
                "new-access-token"
            );

            const { req, res } = createMocks({ body: input });

            await authController.refreshToken(req, res);

            expect(authService.refreshAccessToken).toHaveBeenCalledWith(
                input.refreshToken
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Access token refreshed successfully",
                data: {
                    accessToken: "new-access-token",
                },
            });
        });

        it("should return 400 when refresh token validation fails", async () => {
            validationFailure(refreshTokenSchema);

            const { req, res } = createMocks();

            await authController.refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(authService.refreshAccessToken).not.toHaveBeenCalled();
        });

        it("should return 401 when refreshing the token fails", async () => {
            validationSuccess(refreshTokenSchema, {
                refreshToken: "invalid-token",
            });

            (authService.refreshAccessToken as any).mockRejectedValue(
                new Error("Invalid refresh token")
            );

            const { req, res } = createMocks();

            await authController.refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid refresh token",
            });
        });
    });

    // LOGOUT
    describe("logout", () => {
        it("should logout successfully", async () => {
            const input = { refreshToken: "valid-refresh-token" };

            validationSuccess(refreshTokenSchema, input);

            (authService.logout as any).mockResolvedValue(undefined);

            const { req, res } = createMocks({ body: input });

            await authController.logout(req, res);

            expect(authService.logout).toHaveBeenCalledWith(
                input.refreshToken
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Logout successful",
            });
        });

        it("should return 400 when logout validation fails", async () => {
            validationFailure(refreshTokenSchema);

            const { req, res } = createMocks();

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(authService.logout).not.toHaveBeenCalled();
        });

        it("should return 400 when logout service fails", async () => {
            validationSuccess(refreshTokenSchema, {
                refreshToken: "valid-refresh-token",
            });

            (authService.logout as any).mockRejectedValue(
                new Error("Logout failed")
            );

            const { req, res } = createMocks();

            await authController.logout(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Logout failed",
            });
        });
    });

    // VERIFY EMAIL
    describe("verifyEmail", () => {
        it("should verify email successfully", async () => {
            const user = { id: 1, emailVerified: true };

            validationSuccess(verifyEmailSchema, {
                token: "verification-token",
            });

            (emailVerificationService.verifyEmail as any).mockResolvedValue(
                user
            );

            const { req, res } = createMocks({
                query: { token: "verification-token" },
            });

            await authController.verifyEmail(req, res);

            expect(emailVerificationService.verifyEmail).toHaveBeenCalledWith(
                "verification-token"
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Email verified successfully",
                data: user,
            });
        });

        it("should return 400 when verification query is invalid", async () => {
            validationFailure(verifyEmailSchema);

            const { req, res } = createMocks();

            await authController.verifyEmail(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(emailVerificationService.verifyEmail).not.toHaveBeenCalled();
        });

        it("should return 400 when email verification fails", async () => {
            validationSuccess(verifyEmailSchema, {
                token: "invalid-token",
            });

            (emailVerificationService.verifyEmail as any).mockRejectedValue(
                new Error("Verification token expired")
            );

            const { req, res } = createMocks();

            await authController.verifyEmail(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Verification token expired",
            });
        });
    });

    // RESEND VERIFICATION
    describe("resendVerification", () => {
        it("should resend verification email successfully", async () => {
            (emailVerificationService.resendVerificationEmail as any)
                .mockResolvedValue(undefined);

            const { req, res } = createMocks({ userId: 1 });

            await authController.resendVerification(req, res);

            expect(
                emailVerificationService.resendVerificationEmail
            ).toHaveBeenCalledWith(1);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Verification email sent successfully",
            });
        });

        it("should return 400 when resending verification fails", async () => {
            (emailVerificationService.resendVerificationEmail as any)
                .mockRejectedValue(new Error("User already verified"));

            const { req, res } = createMocks({ userId: 1 });

            await authController.resendVerification(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "User already verified",
            });
        });
    });

    // FORGOT PASSWORD
    describe("forgotPassword", () => {
        it("should request password reset successfully", async () => {
            (forgotPasswordSchema as any).parse.mockReturnValue({
                email: "test@example.com",
            });

            (passwordResetService.requestPasswordReset as any)
                .mockResolvedValue(undefined);

            const { req, res } = createMocks({
                body: { email: "test@example.com" },
            });

            await authController.forgotPassword(req, res);

            expect(
                passwordResetService.requestPasswordReset
            ).toHaveBeenCalledWith("test@example.com");

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "If an account exists for that email, a password reset link has been sent.",
            });
        });

        it("should return 400 when email validation fails", async () => {
            let validationError: unknown;

            try {
                z.string().email().parse("invalid-email");
            } catch (error) {
                validationError = error;
            }

            (forgotPasswordSchema as any).parse.mockImplementation(() => {
                throw validationError;
            });

            const { req, res } = createMocks({
                body: { email: "invalid-email" },
            });

            await authController.forgotPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: (validationError as z.ZodError).issues[0].message,
            });

            expect(
                passwordResetService.requestPasswordReset
            ).not.toHaveBeenCalled();
        });

        it("should return 404 when password reset request fails", async () => {
            (forgotPasswordSchema as any).parse.mockReturnValue({
                email: "test@example.com",
            });

            (passwordResetService.requestPasswordReset as any)
                .mockRejectedValue(new Error("Email service failed"));

            const { req, res } = createMocks({
                body: { email: "test@example.com" },
            });

            await authController.forgotPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Email service failed",
            });
        });
    });

    // RESET PASSWORD
    describe("resetPassword", () => {
        it("should reset password successfully", async () => {
            const input = {
                token: "reset-token",
                password: "NewPassword123!",
            };

            validationSuccess(resetPasswordSchema, input);

            (passwordResetService.resetPassword as any)
                .mockResolvedValue(undefined);

            const { req, res } = createMocks({ body: input });

            await authController.resetPassword(req, res);

            expect(passwordResetService.resetPassword).toHaveBeenCalledWith(
                input.token,
                input.password
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Password reset successfully",
            });
        });

        it("should return 400 when reset validation fails", async () => {
            validationFailure(resetPasswordSchema);

            const { req, res } = createMocks();

            await authController.resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(passwordResetService.resetPassword).not.toHaveBeenCalled();
        });

        it("should return 404 when password reset fails", async () => {
            validationSuccess(resetPasswordSchema, {
                token: "reset-token",
                password: "NewPassword123!",
            });

            (passwordResetService.resetPassword as any)
                .mockRejectedValue(new Error("Reset token expired"));

            const { req, res } = createMocks();

            await authController.resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Reset token expired",
            });
        });
    });
});
