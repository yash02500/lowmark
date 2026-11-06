import { describe, it, expect, beforeEach, afterAll, jest } from "@jest/globals";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import verifyToken from './authMiddleware';

const JWT_SECRET = "test-jwt-secret";

const originalJwtSecret = process.env.JWT_SECRET;

// Restore the original environment variable after testing
afterAll(() => {
    if (originalJwtSecret === undefined) {
        delete process.env.JWT_SECRET;
    } else {
        process.env.JWT_SECRET = originalJwtSecret;
    }
});

beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
});

// Helper function to create mock Express objects
const createMocks = (authorization?: string) => {
    const req = {
        headers: authorization === undefined
            ? {}
            : { authorization },
    } as unknown as Request;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    const next = jest.fn();

    return { req, res, next };
};

describe("verifyToken middleware", () => {

    it("should return 401 when authorization header is missing", () => {
        const { req, res, next } = createMocks();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Authorization header is required",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization format is invalid", () => {
        const { req, res, next } = createMocks("Basic some-token");

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid authorization format",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when Bearer token is missing", () => {
        const { req, res, next } = createMocks("Bearer");

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid authorization format",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("should call next() when token is valid", () => {
        const token = jwt.sign(
            { userId: 123 },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        const { req, res, next } = createMocks(`Bearer ${token}`);

        verifyToken(req, res, next);

        expect((req as Request & { userId: number }).userId).toBe(123);

        expect(next).toHaveBeenCalledTimes(1);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid", () => {
        const { req, res, next } = createMocks("Bearer invalid-token");

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid or expired token",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when token is expired", () => {
        const expiredToken = jwt.sign(
            { userId: 123 },
            JWT_SECRET,
            { expiresIn: -1 }
        );

        const { req, res, next } = createMocks(
            `Bearer ${expiredToken}`
        );

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid or expired token",
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when JWT_SECRET is missing", () => {
        delete process.env.JWT_SECRET;

        const { req, res, next } = createMocks("Bearer some-token");

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Invalid or expired token",
        });

        expect(next).not.toHaveBeenCalled();
    });

});
