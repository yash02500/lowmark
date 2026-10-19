import crypto from "crypto";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import bcrypt from "bcrypt";
import authRepository from "../repositories/authRepository";
import passwordResetTokenRepository from "../repositories/passwordResetTokenRepository";
import emailService from "./emailService";
import passwordResetService from "./passwordResetService";

jest.mock("bcrypt", () => ({
    __esModule: true,
    default: {
        hash: jest.fn(),
    },
}));

jest.mock("../repositories/authRepository", () => ({
    __esModule: true,
    default: {
        findUserEmail: jest.fn(),
        findUserById: jest.fn(),
        deleteRefreshTokensByUserId: jest.fn(),
    },
}));

jest.mock("../repositories/passwordResetTokenRepository", () => ({
    __esModule: true,
    default: {
        deleteByUserId: jest.fn(),
        createToken: jest.fn(),
        findByTokenHash: jest.fn(),
        deleteById: jest.fn(),
        markAsUsed: jest.fn(),
    },
}));

jest.mock("./emailService", () => ({
    __esModule: true,
    default: {
        sendPasswordResetEmail: jest.fn(),
    },
}));

// Cast dependencies so Jest mocks can be configured easily
const authRepo = authRepository as any;
const tokenRepo = passwordResetTokenRepository as any;
const bcryptMock = bcrypt as any;
const emailMock = emailService as any;

const hashTokenForTest = (token: string) =>
    crypto.createHash("sha256").update(token).digest("hex");

const makeTokenRecord = (data: Record<string, any>) => ({
    getDataValue: (key: string) => data[key],
});

const makeUser = (overrides: Record<string, any> = {}) => {
    const values: Record<string, any> = {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        password: "old-hashed-password",
        ...overrides,
    };

    const user = {
        get: (key: string) => values[key],

        update: jest.fn(async (updates: Record<string, any>) => {
            Object.assign(values, updates);
        }),
    };

    return { user, values };
};

beforeEach(() => {
    jest.resetAllMocks();
});

// REQUEST PASSWORD RESET
describe("passwordResetService.requestPasswordReset", () => {
    it("should normalize the email and create a password reset token", async () => {
        const { user } = makeUser();

        const before = Date.now();

        authRepo.findUserEmail.mockResolvedValue(user);
        tokenRepo.deleteByUserId.mockResolvedValue(undefined);
        tokenRepo.createToken.mockResolvedValue(undefined);
        emailMock.sendPasswordResetEmail.mockResolvedValue(undefined);

        await passwordResetService.requestPasswordReset(
            "  ALICE@EXAMPLE.COM  "
        );

        expect(authRepo.findUserEmail).toHaveBeenCalledWith(
            "alice@example.com"
        );

        // Previous reset tokens should be deleted first
        expect(tokenRepo.deleteByUserId).toHaveBeenCalledWith(1);

        expect(tokenRepo.createToken).toHaveBeenCalledTimes(1);

        const savedToken = tokenRepo.createToken.mock.calls[0][0];
        const emailCall = emailMock.sendPasswordResetEmail.mock.calls[0];
        const rawToken = emailCall[2] as string;

        // The raw token should be a 32-byte random token encoded as hex
        expect(rawToken).toMatch(/^[a-f0-9]{64}$/);

        // The database should store its SHA-256 hash, not the raw token
        expect(savedToken.tokenHash).toBe(
            hashTokenForTest(rawToken)
        );

        expect(savedToken.userId).toBe(1);
        expect(savedToken.expiresAt).toBeInstanceOf(Date);

        // Expiry should be approximately 30 minutes after creation
        expect(savedToken.expiresAt.getTime()).toBeGreaterThanOrEqual(
            before + 30 * 60 * 1000
        );

        expect(savedToken.expiresAt.getTime()).toBeLessThanOrEqual(
            Date.now() + 30 * 60 * 1000
        );

        // The raw token goes to the email service
        expect(emailCall[0]).toBe("alice@example.com");
        expect(emailCall[1]).toBe("Alice");
        expect(emailCall[2]).toBe(rawToken);
    });

    it("should do nothing when the email does not belong to a user", async () => {
        authRepo.findUserEmail.mockResolvedValue(null);

        await expect(
            passwordResetService.requestPasswordReset(
                "unknown@example.com"
            )
        ).resolves.toBeUndefined();

        expect(tokenRepo.deleteByUserId).not.toHaveBeenCalled();
        expect(tokenRepo.createToken).not.toHaveBeenCalled();
        expect(emailMock.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
});

// RESET PASSWORD
describe("passwordResetService.resetPassword", () => {
    it("should reject an empty reset token", async () => {
        await expect(
            passwordResetService.resetPassword("", "newpassword123")
        ).rejects.toThrow("Password reset token is required");

        expect(tokenRepo.findByTokenHash).not.toHaveBeenCalled();
    });

    it("should reject an invalid or unknown reset token", async () => {
        tokenRepo.findByTokenHash.mockResolvedValue(null);

        await expect(
            passwordResetService.resetPassword(
                "invalid-token",
                "newpassword123"
            )
        ).rejects.toThrow("Invalid or expired password reset link");
    });

    it("should delete an expired token and reject the reset", async () => {
        tokenRepo.findByTokenHash.mockResolvedValue(
            makeTokenRecord({
                id: 10,
                userId: 1,
                expiresAt: new Date(Date.now() - 60_000),
            })
        );

        tokenRepo.deleteById.mockResolvedValue(undefined);

        await expect(
            passwordResetService.resetPassword(
                "expired-token",
                "newpassword123"
            )
        ).rejects.toThrow("Password reset link has expired");

        expect(tokenRepo.deleteById).toHaveBeenCalledWith(10);
        expect(authRepo.findUserById).not.toHaveBeenCalled();
    });

    it("should reject a password shorter than 8 characters", async () => {
        tokenRepo.findByTokenHash.mockResolvedValue(
            makeTokenRecord({
                id: 10,
                userId: 1,
                expiresAt: new Date(Date.now() + 60_000),
            })
        );

        await expect(
            passwordResetService.resetPassword(
                "valid-token",
                "short"
            )
        ).rejects.toThrow(
            "Password must be at least 8 characters"
        );

        expect(authRepo.findUserById).not.toHaveBeenCalled();
        expect(bcryptMock.hash).not.toHaveBeenCalled();
    });

    it("should reject the reset when the user no longer exists", async () => {
        tokenRepo.findByTokenHash.mockResolvedValue(
            makeTokenRecord({
                id: 10,
                userId: 999,
                expiresAt: new Date(Date.now() + 60_000),
            })
        );

        authRepo.findUserById.mockResolvedValue(null);

        await expect(
            passwordResetService.resetPassword(
                "valid-token",
                "newpassword123"
            )
        ).rejects.toThrow("User not found");

        expect(bcryptMock.hash).not.toHaveBeenCalled();
    });

    it("should hash the new password, invalidate refresh tokens, and consume reset tokens", async () => {
        const rawToken = "valid-reset-token";
        const { user } = makeUser();

        tokenRepo.findByTokenHash.mockResolvedValue(
            makeTokenRecord({
                id: 10,
                userId: 1,
                expiresAt: new Date(Date.now() + 60_000),
            })
        );

        authRepo.findUserById.mockResolvedValue(user);

        bcryptMock.hash.mockResolvedValue("new-hashed-password");
        authRepo.deleteRefreshTokensByUserId.mockResolvedValue(undefined);
        tokenRepo.markAsUsed.mockResolvedValue(undefined);
        tokenRepo.deleteByUserId.mockResolvedValue(undefined);

        await expect(
            passwordResetService.resetPassword(
                rawToken,
                "newpassword123"
            )
        ).resolves.toBeUndefined();

        // The token provided by the client must be hashed for lookup
        expect(tokenRepo.findByTokenHash).toHaveBeenCalledWith(
            hashTokenForTest(rawToken)
        );

        // The new password must be hashed before saving
        expect(bcryptMock.hash).toHaveBeenCalledWith(
            "newpassword123",
            10
        );

        expect(user.update).toHaveBeenCalledWith({
            password: "new-hashed-password",
        });

        // All existing sessions should be invalidated
        expect(
            authRepo.deleteRefreshTokensByUserId
        ).toHaveBeenCalledWith(1);

        // Mark the token used, then remove reset tokens for the user
        expect(tokenRepo.markAsUsed).toHaveBeenCalledWith(
            10,
            expect.any(Date)
        );

        expect(tokenRepo.deleteByUserId).toHaveBeenCalledWith(1);
    });
});
