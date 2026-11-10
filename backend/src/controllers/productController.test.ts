import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Request, Response } from "express";
import productController from "./productController";
import productService from "../services/productService";

// Mock product service
jest.mock("../services/productService", () => ({
    __esModule: true,
    default: {
        createProduct: jest.fn(),
        getProductById: jest.fn(),
        getAllProducts: jest.fn(),
        deleteProduct: jest.fn(),
    },
}));

// Create mock Express request and response
const createMocks = (
    options: {
        params?: Record<string, string>;
        body?: Record<string, unknown>;
    } = {}
) => {
    const req = {
        params: options.params ?? {},
        body: options.body ?? {},
    } as unknown as Request;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    return { req, res };
};

describe("productController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // CREATE PRODUCT
    describe("createProduct", () => {
        it("should create a product successfully", async () => {
            const input = {
                url: "https://www.amazon.in/dp/B0EXAMPLE",
            };

            const product = {
                id: 1,
                title: "Test Product",
                url: input.url,
                currentPrice: 1500,
                platform: "amazon",
            };

            jest.mocked(productService.createProduct)
                .mockResolvedValue(product as never);

            const { req, res } = createMocks({
                body: input,
            });

            await productController.createProduct(req, res);

            expect(productService.createProduct).toHaveBeenCalledWith(input);

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Product created successfully",
                data: product,
            });
        });

        it("should return 400 when product URL validation fails", async () => {
            const { req, res } = createMocks({
                body: {
                    url: "invalid-url",
                },
            });

            await productController.createProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                    errors: expect.any(Array),
                })
            );

            expect(productService.createProduct).not.toHaveBeenCalled();
        });

        it("should return 404 when product creation fails", async () => {
            const input = {
                url: "https://www.amazon.in/dp/B0EXAMPLE",
            };

            jest.mocked(productService.createProduct)
                .mockRejectedValue(new Error("Unable to create product"));

            const { req, res } = createMocks({
                body: input,
            });

            await productController.createProduct(req, res);

            expect(productService.createProduct).toHaveBeenCalledWith(input);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unable to create product",
            });
        });
    });

    // GET PRODUCT BY ID
    describe("getProductById", () => {
        it("should fetch a product successfully", async () => {
            const product = {
                id: 12,
                title: "Test Product",
                currentPrice: 1500,
            };

            jest.mocked(productService.getProductById)
                .mockResolvedValue(product as never);

            const { req, res } = createMocks({
                params: {
                    id: "12",
                },
            });

            await productController.getProductById(req, res);

            expect(productService.getProductById).toHaveBeenCalledWith(12);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Product fetched successfully",
                data: product,
            });
        });

        it("should return 400 when product ID is invalid", async () => {
            const { req, res } = createMocks({
                params: {
                    id: "invalid",
                },
            });

            await productController.getProductById(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                    errors: expect.any(Array),
                })
            );

            expect(productService.getProductById).not.toHaveBeenCalled();
        });

        it("should return 404 when fetching product fails", async () => {
            jest.mocked(productService.getProductById)
                .mockRejectedValue(new Error("Product not found"));

            const { req, res } = createMocks({
                params: {
                    id: "12",
                },
            });

            await productController.getProductById(req, res);

            expect(productService.getProductById).toHaveBeenCalledWith(12);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Product not found",
            });
        });
    });

    // GET ALL PRODUCTS
    describe("getAllProducts", () => {
        it("should fetch all products successfully", async () => {
            const products = [
                {
                    id: 1,
                    title: "Product One",
                    currentPrice: 1500,
                },
                {
                    id: 2,
                    title: "Product Two",
                    currentPrice: 2000,
                },
            ];

            jest.mocked(productService.getAllProducts)
                .mockResolvedValue(products as never);

            const { req, res } = createMocks();

            await productController.getAllProducts(req, res);

            expect(productService.getAllProducts).toHaveBeenCalledTimes(1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Products fetched successfully",
                data: products,
            });
        });

        it("should return 500 when fetching products fails", async () => {
            jest.mocked(productService.getAllProducts)
                .mockRejectedValue(new Error("Database error"));

            const { req, res } = createMocks();

            await productController.getAllProducts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Database error",
            });
        });
    });

    // DELETE PRODUCT
    describe("deleteProduct", () => {
        it("should delete a product successfully", async () => {
            jest.mocked(productService.deleteProduct)
                .mockResolvedValue(undefined as never);

            const { req, res } = createMocks({
                params: {
                    id: "12",
                },
            });

            await productController.deleteProduct(req, res);

            expect(productService.deleteProduct).toHaveBeenCalledWith(12);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Product deleted successfully",
            });
        });

        it("should return 400 when product ID is invalid", async () => {
            const { req, res } = createMocks({
                params: {
                    id: "abc",
                },
            });

            await productController.deleteProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                    errors: expect.any(Array),
                })
            );

            expect(productService.deleteProduct).not.toHaveBeenCalled();
        });

        it("should return 404 when product deletion fails", async () => {
            jest.mocked(productService.deleteProduct)
                .mockRejectedValue(new Error("Product not found"));

            const { req, res } = createMocks({
                params: {
                    id: "12",
                },
            });

            await productController.deleteProduct(req, res);

            expect(productService.deleteProduct).toHaveBeenCalledWith(12);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Product not found",
            });
        });
    });
});
