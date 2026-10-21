import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import userProductRepository from "../repositories/userProductRepository";
import productRepository from "../repositories/productRepository";
import userProductService from "./userProductService";

jest.mock("../repositories/userProductRepository", () => ({
    __esModule: true,
    default: {
        findUserProduct: jest.fn(),
        createUserProduct: jest.fn(),
        findUserProducts: jest.fn(),
        findUserProductById: jest.fn(),
        deleteUserProduct: jest.fn(),
    },
}));

jest.mock("../repositories/productRepository", () => ({
    __esModule: true,
    default: {
        findProductById: jest.fn(),
    },
}));

// Cast the repositories so Jest mock methods are configurable
const userProductRepo = userProductRepository as any;
const productRepo = productRepository as any;

beforeEach(() => {
    jest.resetAllMocks();
});

// TRACK PRODUCT
describe("userProductService.trackProduct", () => {
    it("should track a product successfully", async () => {
        const product = { id: 10, title: "Test Product" };
        const createdUserProduct = {
            id: 1,
            userId: 7,
            productId: 10,
            targetPrice: 5000,
            isActive: true,
        };

        productRepo.findProductById.mockResolvedValue(product);
        userProductRepo.findUserProduct.mockResolvedValue(null);
        userProductRepo.createUserProduct.mockResolvedValue(
            createdUserProduct
        );

        const result = await userProductService.trackProduct(
            7,
            10,
            5000
        );

        expect(productRepo.findProductById).toHaveBeenCalledWith(10);

        expect(userProductRepo.findUserProduct).toHaveBeenCalledWith(
            7,
            10
        );

        expect(userProductRepo.createUserProduct).toHaveBeenCalledWith({
            userId: 7,
            productId: 10,
            targetPrice: 5000,
            isActive: true,
        });

        expect(result).toBe(createdUserProduct);
    });

    it("should track a product without an optional target price", async () => {
        const product = { id: 10 };
        const createdUserProduct = {
            id: 1,
            userId: 7,
            productId: 10,
            isActive: true,
        };

        productRepo.findProductById.mockResolvedValue(product);
        userProductRepo.findUserProduct.mockResolvedValue(null);
        userProductRepo.createUserProduct.mockResolvedValue(
            createdUserProduct
        );

        const result = await userProductService.trackProduct(
            7,
            10
        );

        expect(userProductRepo.createUserProduct).toHaveBeenCalledWith({
            userId: 7,
            productId: 10,
            targetPrice: undefined,
            isActive: true,
        });

        expect(result).toBe(createdUserProduct);
    });

    it("should reject when the product does not exist", async () => {
        productRepo.findProductById.mockResolvedValue(null);

        await expect(
            userProductService.trackProduct(7, 999, 5000)
        ).rejects.toThrow("Product not found");

        expect(userProductRepo.findUserProduct).not.toHaveBeenCalled();
        expect(userProductRepo.createUserProduct).not.toHaveBeenCalled();
    });

    it("should reject when the user already tracks the product", async () => {
        productRepo.findProductById.mockResolvedValue({ id: 10 });

        userProductRepo.findUserProduct.mockResolvedValue({
            id: 1,
            userId: 7,
            productId: 10,
        });

        await expect(
            userProductService.trackProduct(7, 10, 5000)
        ).rejects.toThrow(
            "You are already tracking this product"
        );

        expect(userProductRepo.createUserProduct).not.toHaveBeenCalled();
    });
});

// GET TRACKED PRODUCTS
describe("userProductService.getTrackedProducts", () => {
    it("should return tracked products for the requested user", async () => {
        const trackedProducts = [
            { id: 1, userId: 7, productId: 10 },
            { id: 2, userId: 7, productId: 20 },
        ];

        userProductRepo.findUserProducts.mockResolvedValue(
            trackedProducts
        );

        const result =
            await userProductService.getTrackedProducts(7);

        expect(userProductRepo.findUserProducts).toHaveBeenCalledWith(7);
        expect(result).toBe(trackedProducts);
    });

    it("should return an empty array when the user tracks no products", async () => {
        userProductRepo.findUserProducts.mockResolvedValue([]);

        const result =
            await userProductService.getTrackedProducts(7);

        expect(result).toEqual([]);
    });
});

// GET TRACKED PRODUCT BY ID
describe("userProductService.getTrackedProductById", () => {
    it("should return a tracked product belonging to the user", async () => {
        const trackedProduct = {
            id: 15,
            userId: 7,
            productId: 10,
        };

        userProductRepo.findUserProductById.mockResolvedValue(
            trackedProduct
        );

        const result =
            await userProductService.getTrackedProductById(15, 7);

        expect(
            userProductRepo.findUserProductById
        ).toHaveBeenCalledWith(15, 7);

        expect(result).toBe(trackedProduct);
    });

    it("should reject when the tracked product is not found", async () => {
        userProductRepo.findUserProductById.mockResolvedValue(null);

        await expect(
            userProductService.getTrackedProductById(999, 7)
        ).rejects.toThrow("Tracked product not found");
    });
});

// UNTRACK PRODUCT
describe("userProductService.untrackProduct", () => {
    it("should delete a tracked product and return true", async () => {
        const trackedProduct = {
            id: 15,
            userId: 7,
            productId: 10,
        };

        userProductRepo.findUserProductById.mockResolvedValue(
            trackedProduct
        );
        userProductRepo.deleteUserProduct.mockResolvedValue(undefined);

        const result =
            await userProductService.untrackProduct(15, 7);

        expect(
            userProductRepo.findUserProductById
        ).toHaveBeenCalledWith(15, 7);

        expect(userProductRepo.deleteUserProduct).toHaveBeenCalledWith(
            15,
            7
        );

        expect(result).toBe(true);
    });

    it("should reject when the tracked product does not exist", async () => {
        userProductRepo.findUserProductById.mockResolvedValue(null);

        await expect(
            userProductService.untrackProduct(999, 7)
        ).rejects.toThrow("Tracked product not found");

        expect(userProductRepo.deleteUserProduct).not.toHaveBeenCalled();
    });
});
