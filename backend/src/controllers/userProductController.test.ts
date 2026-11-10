import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Request, Response } from "express";
import userProductController from "./userProductController";
import userProductService from "../services/userProductService";
import productInsightService from "../services/productInsightService";

// Mock user product service
jest.mock("../services/userProductService", () => ({
    __esModule: true,
    default: {
        trackProduct: jest.fn(),
        getTrackedProducts: jest.fn(),
        getTrackedProductById: jest.fn(),
        untrackProduct: jest.fn(),
    },
}));

// Mock product insight service
jest.mock("../services/productInsightService", () => ({
    __esModule: true,
    default: {
        getUserProductsInsight: jest.fn(),
        getUserProductAttention: jest.fn(),
        getUserProductInsightById: jest.fn(),
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

describe("userProductController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TRACK PRODUCT
    describe("trackProduct", () => {
        it("should track a product successfully", async () => {
            const parsedInput = {
                productId: 12,
                targetPrice: 1500,
            };

            const userProduct = {
                id: 1,
                userId: 1,
                productId: 12,
                targetPrice: 1500,
            };

            jest.mocked(userProductService.trackProduct)
                .mockResolvedValue(userProduct as never);

            const { req, res } = createMocks({
                userId: 1,
                body: {
                    productId: "12",
                    targetPrice: "1500",
                },
            });

            await userProductController.trackProduct(req, res);

            expect(userProductService.trackProduct).toHaveBeenCalledWith(
                1,
                parsedInput.productId,
                parsedInput.targetPrice
            );

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Product tracked successfully",
                data: userProduct,
            });
        });

        it("should return 400 when product tracking validation fails", async () => {
            const { req, res } = createMocks({
                userId: 1,
                body: {
                    productId: -1,
                    targetPrice: -100,
                },
            });

            await userProductController.trackProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                    errors: expect.any(Array),
                })
            );

            expect(userProductService.trackProduct).not.toHaveBeenCalled();
        });

        it("should return 404 when tracking product fails", async () => {
            jest.mocked(userProductService.trackProduct)
                .mockRejectedValue(new Error("Product not found"));

            const { req, res } = createMocks({
                userId: 1,
                body: {
                    productId: 12,
                    targetPrice: 1500,
                },
            });

            await userProductController.trackProduct(req, res);

            expect(userProductService.trackProduct).toHaveBeenCalledWith(
                1,
                12,
                1500
            );

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Product not found",
            });
        });
    });

    // GET TRACKED PRODUCTS
    describe("getTrackedProducts", () => {
        it("should fetch all tracked products successfully", async () => {
            const products = [
                {
                    id: 1,
                    userId: 1,
                    productId: 12,
                    targetPrice: 1500,
                },
                {
                    id: 2,
                    userId: 1,
                    productId: 15,
                    targetPrice: 2000,
                },
            ];

            jest.mocked(userProductService.getTrackedProducts)
                .mockResolvedValue(products as never);

            const { req, res } = createMocks({ userId: 1 });

            await userProductController.getTrackedProducts(req, res);

            expect(userProductService.getTrackedProducts)
                .toHaveBeenCalledWith(1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Tracked products fetched successfully",
                data: products,
            });
        });

        it("should return 500 when fetching tracked products fails", async () => {
            jest.mocked(userProductService.getTrackedProducts)
                .mockRejectedValue(new Error("Database error"));

            const { req, res } = createMocks({ userId: 1 });

            await userProductController.getTrackedProducts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Database error",
            });
        });
    });

    // GET TRACKED PRODUCT BY ID
    describe("getTrackedProductById", () => {
        it("should fetch a tracked product successfully", async () => {
            const product = {
                id: 12,
                userId: 1,
                targetPrice: 1500,
            };

            jest.mocked(userProductService.getTrackedProductById)
                .mockResolvedValue(product as never);

            const { req, res } = createMocks({
                userId: 1,
                params: { id: "12" },
            });

            await userProductController.getTrackedProductById(req, res);

            expect(userProductService.getTrackedProductById)
                .toHaveBeenCalledWith(12, 1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Tracked product fetched successfully",
                data: product,
            });
        });

        it("should return 400 when tracked product ID is invalid", async () => {
            const { req, res } = createMocks({
                userId: 1,
                params: { id: "invalid" },
            });

            await userProductController.getTrackedProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                    errors: expect.any(Array),
                })
            );

            expect(userProductService.getTrackedProductById)
                .not.toHaveBeenCalled();
        });

        it("should return 404 when fetching tracked product fails", async () => {
            jest.mocked(userProductService.getTrackedProductById)
                .mockRejectedValue(new Error("Tracked product not found"));

            const { req, res } = createMocks({
                userId: 1,
                params: { id: "12" },
            });

            await userProductController.getTrackedProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Tracked product not found",
            });
        });
    });

    // UNTRACK PRODUCT
    describe("untrackProduct", () => {
        it("should untrack a product successfully", async () => {
            jest.mocked(userProductService.untrackProduct)
                .mockResolvedValue(undefined as never);

            const { req, res } = createMocks({
                userId: 1,
                params: { id: "12" },
            });

            await userProductController.untrackProduct(req, res);

            expect(userProductService.untrackProduct)
                .toHaveBeenCalledWith(12, 1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Product untracked successfully",
            });
        });

        it("should return 400 when product ID is invalid", async () => {
            const { req, res } = createMocks({
                userId: 1,
                params: { id: "abc" },
            });

            await userProductController.untrackProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                    errors: expect.any(Array),
                })
            );

            expect(userProductService.untrackProduct)
                .not.toHaveBeenCalled();
        });

        it("should return 404 when untracking product fails", async () => {
            jest.mocked(userProductService.untrackProduct)
                .mockRejectedValue(new Error("Unable to untrack product"));

            const { req, res } = createMocks({
                userId: 1,
                params: { id: "12" },
            });

            await userProductController.untrackProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unable to untrack product",
            });
        });
    });

    // GET ALL PRODUCT INSIGHTS
    describe("getInsights", () => {
        it("should fetch product insights successfully", async () => {
            const insights = [
                {
                    productId: 12,
                    insight: "Good time to buy",
                },
            ];

            jest.mocked(productInsightService.getUserProductsInsight)
                .mockResolvedValue(insights as never);

            const { req, res } = createMocks({ userId: 1 });

            await userProductController.getInsights(req, res);

            expect(productInsightService.getUserProductsInsight)
                .toHaveBeenCalledWith(1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Product insights generated successfully",
                data: insights,
            });
        });

        it("should return 500 when generating insights fails", async () => {
            jest.mocked(productInsightService.getUserProductsInsight)
                .mockRejectedValue(new Error("Insight generation failed"));

            const { req, res } = createMocks({ userId: 1 });

            await userProductController.getInsights(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Insight generation failed",
            });
        });
    });

    // GET PRODUCT ATTENTION
    describe("getAttention", () => {
        it("should fetch product attention insights successfully", async () => {
            const attention = [
                {
                    productId: 12,
                    status: "attention_required",
                },
            ];

            jest.mocked(productInsightService.getUserProductAttention)
                .mockResolvedValue(attention as never);

            const { req, res } = createMocks({ userId: 1 });

            await userProductController.getAttention(req, res);

            expect(productInsightService.getUserProductAttention)
                .toHaveBeenCalledWith(1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Product attention insights generated successfully",
                data: attention,
            });
        });

        it("should return 500 when fetching attention insights fails", async () => {
            jest.mocked(productInsightService.getUserProductAttention)
                .mockRejectedValue(new Error("Attention insights failed"));

            const { req, res } = createMocks({ userId: 1 });

            await userProductController.getAttention(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Attention insights failed",
            });
        });
    });

    // GET PRODUCT INSIGHT BY ID
    describe("getProductInsightById", () => {
        it("should fetch product insight by ID successfully", async () => {
            const insight = {
                productId: 12,
                summary: "The product price has decreased recently",
            };

            jest.mocked(productInsightService.getUserProductInsightById)
                .mockResolvedValue(insight as never);

            const { req, res } = createMocks({
                userId: 1,
                params: { id: "12" },
            });

            await userProductController.getProductInsightById(req, res);

            expect(productInsightService.getUserProductInsightById)
                .toHaveBeenCalledWith(12, 1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Product summary generated successfully",
                data: insight,
            });
        });

        it("should return 400 when product ID is invalid", async () => {
            const { req, res } = createMocks({
                userId: 1,
                params: { id: "invalid" },
            });

            await userProductController.getProductInsightById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                    errors: expect.any(Array),
                })
            );

            expect(productInsightService.getUserProductInsightById)
                .not.toHaveBeenCalled();
        });

        it("should return 404 when fetching product insight fails", async () => {
            jest.mocked(productInsightService.getUserProductInsightById)
                .mockRejectedValue(new Error("Product insight not found"));

            const { req, res } = createMocks({
                userId: 1,
                params: { id: "12" },
            });

            await userProductController.getProductInsightById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Product insight not found",
            });
        });
    });
});
