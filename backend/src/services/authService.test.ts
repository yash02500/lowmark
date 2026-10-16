import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authRepository from "../repositories/authRepository";
import emailVerificationService from "./emailVerificationService";
import authService from "./authService";

jest.mock("bcrypt", () => ({
    __esModule: true,
    default: {
        hash: jest.fn(),
        compare: jest.fn(),
    },
}));

jest.mock("jsonwebtoken", () => ({
    __esModule: true,
    default: {
        sign: jest.fn(),
        verify: jest.fn(),
    },
}));

jest.mock("../repositories/authRepository", () => ({
    __esModule: true,
    default: {
        findUserEmail: jest.fn(),
        createUser: jest.fn(),
        createRefreshToken: jest.fn(),
        findUserById: jest.fn(),
        findRefreshToken: jest.fn(),
        deleteRefreshToken: jest.fn(),
    },
}));

jest.mock("./emailVerificationService", () => ({
    __esModule: true,
    default: {
        createVerificationToken: jest.fn(),
    },
}));

// Cast mocked dependencies for configuring Jest behavior
const repo = authRepository as any;
const bcryptMock = bcrypt as any;
const jwtMock = jwt as any;
const verificationMock = emailVerificationService as any;

const originalJwtSecret = process.env.JWT_SECRET;

// Creates a fake user model similar to the one returned by Sequelize
const makeUser = (overrides: Record<string, any> = {}) => {
    const values: Record<string, any> = {
        id: 1,
        name: "Alice",
        email: "alice@example.com",
        password: "hashed-password",
        emailVerified: true,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-02T00:00:00.000Z"),
        ...overrides,
    };

    const user: any = {
        get: jest.fn((key: string) => values[key]),

        toJSON: jest.fn(() => ({ ...values })),

        update: jest.fn(async (updates: Record<string, any>) => {
            Object.assign(values, updates);
            return user;
        }),
    };

    return { user, values };
};

const makeStoredRefreshToken = (expiresAt: Date) => ({
    toJSON: () => ({ expiresAt }),
});

beforeEach(() => {
    jest.resetAllMocks();
    process.env.JWT_SECRET = "test-jwt-secret";
});

afterEach(() => {
    if (originalJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalJwtSecret;
    }
});

// REGISTER
describe("authService.register", () => {
    it("should register a new user and hash the password", async () => {
        const { user } = makeUser();

        repo.findUserEmail.mockResolvedValue(null);
        bcryptMock.hash.mockResolvedValue("new-hashed-password");
        repo.createUser.mockResolvedValue(user);
        verificationMock.createVerificationToken.mockResolvedValue(undefined);

        const result = await authService.register({
            name: "Alice",
            email: "alice@example.com",
            password: "password123",
        });

        expect(bcryptMock.hash).toHaveBeenCalledWith(
            "password123",
            10
        );

        expect(repo.createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Alice",
                email: "alice@example.com",
                password: "new-hashed-password",
            })
        );

        expect(
            verificationMock.createVerificationToken
        ).toHaveBeenCalledWith(
            1,
            "alice@example.com",
            "Alice"
        );

        expect(result).not.toHaveProperty("password");
        expect(result.email).toBe("alice@example.com");
    });

    it("should reject registration when the email already exists", async () => {
        repo.findUserEmail.mockResolvedValue({ id: 1 });

        await expect(
            authService.register({
                name: "Alice",
                email: "alice@example.com",
                password: "password123",
            })
        ).rejects.toThrow("Email already registered");

        expect(bcryptMock.hash).not.toHaveBeenCalled();
        expect(repo.createUser).not.toHaveBeenCalled();
    });
});

// LOGIN
describe("authService.login", () => {
    it("should log in a user and generate both tokens", async () => {
        const { user } = makeUser();

        repo.findUserEmail.mockResolvedValue(user);
        bcryptMock.compare.mockResolvedValue(true);
        jwtMock.sign
            .mockReturnValueOnce("access-token")
            .mockReturnValueOnce("refresh-token");
        repo.createRefreshToken.mockResolvedValue(undefined);

        const result = await authService.login({
            email: "alice@example.com",
            password: "password123",
        });

        expect(bcryptMock.compare).toHaveBeenCalledWith(
            "password123",
            "hashed-password"
        );

        expect(jwtMock.sign).toHaveBeenCalledTimes(2);

        expect(result.accessToken).toBe("access-token");
        expect(result.refreshToken).toBe("refresh-token");
        expect(result.user).not.toHaveProperty("password");

        expect(repo.createRefreshToken).toHaveBeenCalledWith(
            1,
            "refresh-token",
            expect.any(Date)
        );
    });

    it("should reject an unknown email", async () => {
        repo.findUserEmail.mockResolvedValue(null);

        await expect(
            authService.login({
                email: "unknown@example.com",
                password: "password123",
            })
        ).rejects.toThrow("Invalid email or password");

        expect(bcryptMock.compare).not.toHaveBeenCalled();
    });

    it("should reject an incorrect password", async () => {
        const { user } = makeUser();

        repo.findUserEmail.mockResolvedValue(user);
        bcryptMock.compare.mockResolvedValue(false);

        await expect(
            authService.login({
                email: "alice@example.com",
                password: "wrongpassword",
            })
        ).rejects.toThrow("Invalid email or password");

        expect(jwtMock.sign).not.toHaveBeenCalled();
    });

    it("should reject login if JWT_SECRET is missing", async () => {
        const { user } = makeUser();

        repo.findUserEmail.mockResolvedValue(user);
        bcryptMock.compare.mockResolvedValue(true);

        delete process.env.JWT_SECRET;

        await expect(
            authService.login({
                email: "alice@example.com",
                password: "password123",
            })
        ).rejects.toThrow("JWT_SECRET not defined");
    });
});

// GET PROFILE
describe("authService.getMe", () => {
    it("should return the user without the password", async () => {
        const { user } = makeUser();

        repo.findUserById.mockResolvedValue(user);

        const result = await authService.getMe(1);

        expect(repo.findUserById).toHaveBeenCalledWith(1);
        expect(result.id).toBe(1);
        expect(result.name).toBe("Alice");
        expect(result).not.toHaveProperty("password");
    });

    it("should reject when the user does not exist", async () => {
        repo.findUserById.mockResolvedValue(null);

        await expect(
            authService.getMe(999)
        ).rejects.toThrow("User not found");
    });
});


// UPDATE PROFILE
describe("authService.updateMe", () => {
    it("should update the name without re-verifying an unchanged email", async () => {
        const { user } = makeUser();

        repo.findUserById.mockResolvedValue(user);

        const result = await authService.updateMe(1, {
            name: "  Alice Updated  ",
            email: "alice@example.com",
        });

        expect(user.update).toHaveBeenCalledWith({
            name: "Alice Updated",
        });

        expect(
            verificationMock.createVerificationToken
        ).not.toHaveBeenCalled();

        expect(result.name).toBe("Alice Updated");
    });

    it("should normalize a new email and request verification", async () => {
        const { user } = makeUser();

        repo.findUserById.mockResolvedValue(user);
        repo.findUserEmail.mockResolvedValue(null);
        verificationMock.createVerificationToken.mockResolvedValue(undefined);

        await authService.updateMe(1, {
            name: "Alice",
            email: "  NEW@example.com  ",
        });

        expect(user.update).toHaveBeenCalledWith({
            name: "Alice",
            email: "new@example.com",
            emailVerified: false,
        });

        expect(
            verificationMock.createVerificationToken
        ).toHaveBeenCalledWith(
            1,
            "new@example.com",
            "Alice"
        );
    });

    it("should reject an email already registered to another user", async () => {
        const { user } = makeUser();
        const { user: existingUser } = makeUser({ id: 2 });

        repo.findUserById.mockResolvedValue(user);
        repo.findUserEmail.mockResolvedValue(existingUser);

        await expect(
            authService.updateMe(1, {
                name: "Alice",
                email: "other@example.com",
            })
        ).rejects.toThrow("Email already registered");

        expect(user.update).not.toHaveBeenCalled();
    });

    it("should reject an empty name", async () => {
        const { user } = makeUser();

        repo.findUserById.mockResolvedValue(user);

        await expect(
            authService.updateMe(1, {
                name: "   ",
                email: "alice@example.com",
            })
        ).rejects.toThrow("Name is required");
    });

    it("should reject when the user does not exist", async () => {
        repo.findUserById.mockResolvedValue(null);

        await expect(
            authService.updateMe(999, {
                name: "Alice",
                email: "alice@example.com",
            })
        ).rejects.toThrow("User not found");
    });
});

// REFRESH ACCESS TOKEN
describe("authService.refreshAccessToken", () => {
    it("should generate a new access token for a valid refresh token", async () => {
        repo.findRefreshToken.mockResolvedValue(
            makeStoredRefreshToken(
                new Date(Date.now() + 60_000)
            )
        );

        jwtMock.verify.mockReturnValue({
            userId: 1,
            type: "refresh",
        });

        jwtMock.sign.mockReturnValue("new-access-token");

        const result = await authService.refreshAccessToken(
            "valid-refresh-token"
        );

        expect(repo.findRefreshToken).toHaveBeenCalledWith(
            "valid-refresh-token"
        );

        expect(jwtMock.verify).toHaveBeenCalledWith(
            "valid-refresh-token",
            "test-jwt-secret"
        );

        expect(jwtMock.sign).toHaveBeenCalledWith(
            { userId: 1 },
            "test-jwt-secret",
            { expiresIn: "15m" }
        );

        expect(result).toBe("new-access-token");
    });

    it("should reject a refresh token not found in the database", async () => {
        repo.findRefreshToken.mockResolvedValue(null);

        await expect(
            authService.refreshAccessToken("unknown-token")
        ).rejects.toThrow("Invalid refresh token");

        expect(jwtMock.verify).not.toHaveBeenCalled();
    });

    it("should delete an expired refresh token and reject it", async () => {
        repo.findRefreshToken.mockResolvedValue(
            makeStoredRefreshToken(
                new Date(Date.now() - 60_000)
            )
        );

        repo.deleteRefreshToken.mockResolvedValue(1);

        await expect(
            authService.refreshAccessToken("expired-token")
        ).rejects.toThrow("Refresh token expired");

        expect(repo.deleteRefreshToken).toHaveBeenCalledWith(
            "expired-token"
        );

        expect(jwtMock.verify).not.toHaveBeenCalled();
    });

    it("should reject a token that is not a refresh token", async () => {
        repo.findRefreshToken.mockResolvedValue(
            makeStoredRefreshToken(
                new Date(Date.now() + 60_000)
            )
        );

        jwtMock.verify.mockReturnValue({
            userId: 1,
            type: "access",
        });

        await expect(
            authService.refreshAccessToken("access-token")
        ).rejects.toThrow("Invalid refresh token");

        expect(jwtMock.sign).not.toHaveBeenCalled();
    });

    it("should reject when JWT_SECRET is missing", async () => {
        delete process.env.JWT_SECRET;

        await expect(
            authService.refreshAccessToken("some-token")
        ).rejects.toThrow("JWT_SECRET not defined");

        expect(repo.findRefreshToken).not.toHaveBeenCalled();
    });
});

// LOGOUT
describe("authService.logout", () => {
    it("should delete the refresh token", async () => {
        repo.deleteRefreshToken.mockResolvedValue(1);

        await expect(
            authService.logout("valid-refresh-token")
        ).resolves.toBeUndefined();

        expect(repo.deleteRefreshToken).toHaveBeenCalledWith(
            "valid-refresh-token"
        );
    });

    it("should reject when the refresh token cannot be deleted", async () => {
        repo.deleteRefreshToken.mockResolvedValue(0);

        await expect(
            authService.logout("unknown-token")
        ).rejects.toThrow("Invalid refresh token");
    });
});
