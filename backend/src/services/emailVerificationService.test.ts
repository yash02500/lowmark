import crypto from "crypto";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import authRepository from "../repositories/authRepository";
import emailVerificationTokenRepository from "../repositories/emailVerificationTokenRepository";
import emailService from "./emailService";
import emailVerificationService from "./emailVerificationService";

jest.mock("../repositories/authRepository", () => ({
    __esModule: true,
    default: {
        findUserById: jest.fn(),
    },
}));

jest.mock("../repositories/emailVerificationTokenRepository", () => ({
    __esModule: true,
    default: {
        deleteByUserId: jest.fn(),
        createToken: jest.fn(),
        findByTokenHash: jest.fn(),
        deleteById: jest.fn(),
    },
}));

jest.mock("./emailService", () => ({
    __esModule: true,
    default: {
        sendVerificationEmail: jest.fn(),
    },
}));

// Use these casts to configure and inspect Jest mocks
const authRepo = authRepository as any;
const tokenRepo = emailVerificationTokenRepository as any;
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
        emailVerified: false,
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


// CREATE VERIFICATION TOKEN
describe("emailVerificationService.createVerificationToken", () => {
    it("should delete old tokens, create a hashed token, and send the raw token by email", async () => {
        const userId = 1;
        const email = "alice@example.com";
        const name = "Alice";
        const before = Date.now();

        await emailVerificationService.createVerificationToken(
            userId,
            email,
            name
        );

        expect(tokenRepo.deleteByUserId).toHaveBeenCalledWith(userId);

        expect(tokenRepo.createToken).toHaveBeenCalledTimes(1);

        const savedToken = tokenRepo.createToken.mock.calls[0][0];
        const emailCall = emailMock.sendVerificationEmail.mock.calls[0];

        const rawToken = emailCall[2] as string;

        expect(rawToken).toMatch(/^[a-f0-9]{64}$/);

        expect(savedToken).toEqual(
            expect.objectContaining({
                userId,
                tokenHash: hashTokenForTest(rawToken),
                expiresAt: expect.any(Date),
            })
        );

        // Token should expire approximately 30 minutes after creation.
        expect(savedToken.expiresAt.getTime()).toBeGreaterThanOrEqual(
            before + 30 * 60 * 1000
        );

        expect(savedToken.expiresAt.getTime()).toBeLessThanOrEqual(
            Date.now() + 30 * 60 * 1000
        );

        expect(emailCall).toEqual([email, name, rawToken]);
    });
});

// VERIFY EMAIL
describe("emailVerificationService.verifyEmail", () => {
    it("should reject an empty verification token", async () => {
        await expect(
            emailVerificationService.verifyEmail("")
        ).rejects.toThrow("Verification token is required");

        expect(tokenRepo.findByTokenHash).not.toHaveBeenCalled();
    });

    it("should reject an invalid verification token", async () => {
        tokenRepo.findByTokenHash.mockResolvedValue(null);

        await expect(
            emailVerificationService.verifyEmail("invalid-token")
        ).rejects.toThrow("Invalid verification token");
    });

    it("should delete an expired token and reject verification", async () => {
        tokenRepo.findByTokenHash.mockResolvedValue(
            makeTokenRecord({
                id: 10,
                userId: 1,
                expiresAt: new Date(Date.now() - 60_000),
            })
        );

        await expect(
            emailVerificationService.verifyEmail("expired-token")
        ).rejects.toThrow("Verification token has expired");

        expect(tokenRepo.deleteById).toHaveBeenCalledWith(10);
        expect(authRepo.findUserById).not.toHaveBeenCalled();
    });

    it("should reject verification when the user does not exist", async () => {
        const rawToken = "valid-token";

        tokenRepo.findByTokenHash.mockResolvedValue(
            makeTokenRecord({
                id: 10,
                userId: 999,
                expiresAt: new Date(Date.now() + 60_000),
            })
        );

        authRepo.findUserById.mockResolvedValue(null);

        await expect(
            emailVerificationService.verifyEmail(rawToken)
        ).rejects.toThrow("User not found");

        expect(authRepo.findUserById).toHaveBeenCalledWith(999);
        expect(tokenRepo.deleteById).not.toHaveBeenCalled();
    });

    it("should verify the user and delete the used token", async () => {
        const rawToken = "valid-verification-token";
        const { user } = makeUser({
            id: 1,
            name: "Alice",
            email: "alice@example.com",
        });

        tokenRepo.findByTokenHash.mockResolvedValue(
            makeTokenRecord({
                id: 10,
                userId: 1,
                expiresAt: new Date(Date.now() + 60_000),
            })
        );

        authRepo.findUserById.mockResolvedValue(user);

        const result = await emailVerificationService.verifyEmail(rawToken);

        expect(tokenRepo.findByTokenHash).toHaveBeenCalledWith(
            hashTokenForTest(rawToken)
        );

        expect(authRepo.findUserById).toHaveBeenCalledWith(1);
        expect(user.update).toHaveBeenCalledWith({
            emailVerified: true,
        });
        expect(tokenRepo.deleteById).toHaveBeenCalledWith(10);

        expect(result).toEqual({
            id: 1,
            name: "Alice",
            email: "alice@example.com",
            emailVerified: true,
        });
    });
});

// RESEND VERIFICATION EMAIL
describe("emailVerificationService.resendVerificationEmail", () => {
    it("should reject when the user does not exist", async () => {
        authRepo.findUserById.mockResolvedValue(null);

        await expect(
            emailVerificationService.resendVerificationEmail(999)
        ).rejects.toThrow("User not found");

        expect(tokenRepo.createToken).not.toHaveBeenCalled();
    });

    it("should reject when the email is already verified", async () => {
        const { user } = makeUser({
            emailVerified: true,
        });

        authRepo.findUserById.mockResolvedValue(user);

        await expect(
            emailVerificationService.resendVerificationEmail(1)
        ).rejects.toThrow("Email is already verified");

        expect(tokenRepo.createToken).not.toHaveBeenCalled();
        expect(emailMock.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should create and email a new token for an unverified user", async () => {
        const { user } = makeUser({
            id: 5,
            name: "Bob",
            email: "bob@example.com",
            emailVerified: false,
        });

        authRepo.findUserById.mockResolvedValue(user);

        await emailVerificationService.resendVerificationEmail(5);

        expect(tokenRepo.deleteByUserId).toHaveBeenCalledWith(5);
        expect(tokenRepo.createToken).toHaveBeenCalledTimes(1);

        const savedToken = tokenRepo.createToken.mock.calls[0][0];
        const emailCall = emailMock.sendVerificationEmail.mock.calls[0];
        const rawToken = emailCall[2] as string;

        expect(savedToken.userId).toBe(5);
        expect(savedToken.tokenHash).toBe(hashTokenForTest(rawToken));
        expect(emailCall[0]).toBe("bob@example.com");
        expect(emailCall[1]).toBe("Bob");
    });
});
