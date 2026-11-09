import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Request, Response } from "express";
import priceHistoryController from "./priceHistoryController";
import priceHistoryService from "../services/priceHistoryService";

// Mock price history service
jest.mock("../services/priceHistoryService", () => ({
    __esModule: true,
    default: {
        recordPrice: jest.fn(),
        getPriceHistory: jest.fn(),
        getLatestPrice: jest.fn(),
    },
}));

// Create mock Express request and response
const createMocks = (
    options: {
        userId?: number;
        params?: Record<string, string>;
        body?: Record<string, unknown>;
    } = {}
) => {
    const req = {
        userId: options.userId ?? 1,
        params: options.params ?? {},
        body: options.body ?? {},
    } as unknown as Request;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    return { req, res };
};

describe("priceHistoryController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // RECORD PRICE
    describe("recordPrice", () => {
        it("should record price successfully", async () => {
            const priceHistory = {
                id: 1,
                productId: 12,
                price: 1500,
            };

            const result = {
                recorded: true,
                priceHistory,
            };

            jest.mocked(priceHistoryService.recordPrice)
                .mockResolvedValue(result as never);

            const recordedAt = "2026-11-09T10:00:00.000Z";

            const { req, res } = createMocks({
                params: { productId: "12" },
                body: {
                    price: 1500,
                    recordedAt,
                },
            });

            await priceHistoryController.recordPrice(req, res);

            expect(priceHistoryService.recordPrice).toHaveBeenCalledWith(
                12,
                1500,
                new Date(recordedAt)
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Price recorded successfully",
                data: priceHistory,
            });
        });

        it("should return appropriate message when price is unchanged", async () => {
            const result = {
                recorded: false,
                priceHistory: null,
            };

            jest.mocked(priceHistoryService.recordPrice)
                .mockResolvedValue(result as never);

            const { req, res } = createMocks({
                params: { productId: "12" },
                body: {
                    price: 1500,
                },
            });

            await priceHistoryController.recordPrice(req, res);

            expect(priceHistoryService.recordPrice).toHaveBeenCalledWith(
                12,
                1500,
                undefined
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Price unchanged; no new history record created",
                data: null,
            });
        });

        it("should return 400 when product ID is invalid", async () => {
            const { req, res } = createMocks({
                params: { productId: "invalid" },
                body: { price: 1500 },
            });

            await priceHistoryController.recordPrice(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                    errors: expect.any(Array),
                })
            );

            expect(priceHistoryService.recordPrice).not.toHaveBeenCalled();
        });

        it("should return 400 when price validation fails", async () => {
            const { req, res } = createMocks({
                params: { productId: "12" },
                body: { price: -100 },
            });

            await priceHistoryController.recordPrice(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                    errors: expect.any(Array),
                })
            );

            expect(priceHistoryService.recordPrice).not.toHaveBeenCalled();
        });

        it("should return 400 when recording price fails", async () => {
            jest.mocked(priceHistoryService.recordPrice)
                .mockRejectedValue(new Error("Unable to record price"));

            const { req, res } = createMocks({
                params: { productId: "12" },
                body: { price: 1500 },
            });

            await priceHistoryController.recordPrice(req, res);

            expect(priceHistoryService.recordPrice).toHaveBeenCalledWith(
                12,
                1500,
                undefined
            );

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unable to record price",
            });
        });
    });

    // GET PRICE HISTORY
    describe("getPriceHistory", () => {
        it("should fetch price history successfully", async () => {
            const priceHistory = [
                {
                    id: 1,
                    productId: 12,
                    price: 1500,
                },
                {
                    id: 2,
                    productId: 12,
                    price: 1400,
                },
            ];

            jest.mocked(priceHistoryService.getPriceHistory)
                .mockResolvedValue(priceHistory as never);

            const { req, res } = createMocks({
                userId: 1,
                params: { productId: "12" },
            });

            await priceHistoryController.getPriceHistory(req, res);

            expect(priceHistoryService.getPriceHistory).toHaveBeenCalledWith(
                12,
                1
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Price history fetched successfully",
                data: priceHistory,
            });
        });

        it("should return 400 when product ID is invalid", async () => {
            const { req, res } = createMocks({
                userId: 1,
                params: { productId: "abc" },
            });

            await priceHistoryController.getPriceHistory(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                    errors: expect.any(Array),
                })
            );

            expect(priceHistoryService.getPriceHistory).not.toHaveBeenCalled();
        });

        it("should return 404 when fetching price history fails", async () => {
            jest.mocked(priceHistoryService.getPriceHistory)
                .mockRejectedValue(new Error("Product not found"));

            const { req, res } = createMocks({
                userId: 1,
                params: { productId: "12" },
            });

            await priceHistoryController.getPriceHistory(req, res);

            expect(priceHistoryService.getPriceHistory).toHaveBeenCalledWith(
                12,
                1
            );

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Product not found",
            });
        });
    });

    // GET LATEST PRICE
    describe("getLatestPrice", () => {
        it("should fetch latest price successfully", async () => {
            const latestPrice = {
                id: 5,
                productId: 12,
                price: 1200,
            };

            jest.mocked(priceHistoryService.getLatestPrice)
                .mockResolvedValue(latestPrice as never);

            const { req, res } = createMocks({
                userId: 1,
                params: { productId: "12" },
            });

            await priceHistoryController.getLatestPrice(req, res);

            expect(priceHistoryService.getLatestPrice).toHaveBeenCalledWith(
                12,
                1
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Latest price fetched successfully",
                data: latestPrice,
            });
        });

        it("should return 400 when product ID is invalid", async () => {
            const { req, res } = createMocks({
                userId: 1,
                params: { productId: "invalid" },
            });

            await priceHistoryController.getLatestPrice(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(priceHistoryService.getLatestPrice).not.toHaveBeenCalled();
        });

        it("should return 404 when fetching latest price fails", async () => {
            jest.mocked(priceHistoryService.getLatestPrice)
                .mockRejectedValue(new Error("Latest price not found"));

            const { req, res } = createMocks({
                userId: 1,
                params: { productId: "12" },
            });

            await priceHistoryController.getLatestPrice(req, res);

            expect(priceHistoryService.getLatestPrice).toHaveBeenCalledWith(
                12,
                1
            );

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Latest price not found",
            });
        });
    });
});
