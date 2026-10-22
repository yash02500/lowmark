import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import productService from "./productService";
import productRepository from "../repositories/productRepository";
import userProductRepository from "../repositories/userProductRepository";
import scraperService from "./scraperService";
import normalizeProductUrl from "../utils/normalizeProductUrl";
import priceHistoryService from "./priceHistoryService";
import schedulingService from "./schedulingService";

jest.mock("../repositories/productRepository", () => ({
    __esModule: true,
    default: {
        findProductByUrl: jest.fn(),
        createProduct: jest.fn(),
        findProductById: jest.fn(),
        findAllProducts: jest.fn(),
        deleteProduct: jest.fn(),
        updateScheduling: jest.fn(),
        updateProductPrice: jest.fn(),
    },
}));

jest.mock("../repositories/userProductRepository", () => ({
    __esModule: true,
    default: {
        findActiveUserProductsByProductId: jest.fn(),
    },
}));

jest.mock("./scraperService", () => ({
    __esModule: true,
    default: {
        scrapeProduct: jest.fn(),
    },
}));

jest.mock("../utils/normalizeProductUrl", () => ({
    __esModule: true,
    default: jest.fn((url: string) => url.trim()),
}));

jest.mock("./priceHistoryService", () => ({
    __esModule: true,
    default: {
        recordPrice: jest.fn(),
        getRecentPriceChangeCount: jest.fn(),
        isStableForWeeks: jest.fn(),
    },
}));

jest.mock("./schedulingService", () => ({
    __esModule: true,
    default: {
        isTargetPriceClose: jest.fn(),
        getCheckIntervalMinutes: jest.fn(),
        calculateNextCheckAt: jest.fn(),
    },
}));

const productRepo = productRepository as any;
const userProductRepo = userProductRepository as any;
const scraperMock = scraperService as any;
const normalizeUrlMock = normalizeProductUrl as any;
const priceHistoryMock = priceHistoryService as any;
const schedulingMock = schedulingService as any;

const nextCheckAt = new Date("2026-10-23T12:00:00.000Z");

const makeProduct = (overrides: Record<string, any> = {}) => {
    const values: Record<string, any> = {
        id: 10,
        url: "https://www.amazon.in/dp/TEST123",
        title: "Test Product",
        currentPrice: 5000,
        trackingState: "in_stock",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        priority: 2,
        ...overrides,
    };

    return {
        getDataValue: (key: string) => values[key],
    };
};

const makeUserProduct = (targetPrice: number | null) => ({
    get: (key: string) => {
        if (key === "targetPrice") return targetPrice;
        return undefined;
    },
});

const makeScrapedData = (overrides: Record<string, any> = {}) => ({
    title: "Test Product",
    imageUrl: "https://example.com/product.jpg",
    price: 4500,
    currency: "INR",
    platform: "amazon",
    availability: "in_stock",
    ...overrides,
});

const setupPriceUpdate = (
    scrapedOverrides: Record<string, any> = {},
    userTargets: (number | null)[] = [4000],
    productOverrides: Record<string, any> = {}
) => {
    const product = makeProduct(productOverrides);

    productRepo.findProductById.mockResolvedValue(product);
    scraperMock.scrapeProduct.mockResolvedValue(
        makeScrapedData(scrapedOverrides)
    );

    userProductRepo.findActiveUserProductsByProductId.mockResolvedValue(
        userTargets.map(makeUserProduct)
    );

    priceHistoryMock.getRecentPriceChangeCount.mockResolvedValue(0);
    priceHistoryMock.isStableForWeeks.mockResolvedValue(false);
    priceHistoryMock.recordPrice.mockResolvedValue({
        recorded: true,
    });

    schedulingMock.isTargetPriceClose.mockReturnValue(false);
    schedulingMock.getCheckIntervalMinutes.mockReturnValue(720);
    schedulingMock.calculateNextCheckAt.mockReturnValue(nextCheckAt);

    productRepo.updateScheduling.mockResolvedValue(undefined);
    productRepo.updateProductPrice.mockResolvedValue(undefined);

    return product;
};

beforeEach(() => {
    jest.resetAllMocks();

    normalizeUrlMock.mockImplementation(
        (url: string) => url.trim()
    );

    schedulingMock.isTargetPriceClose.mockReturnValue(false);
    schedulingMock.getCheckIntervalMinutes.mockReturnValue(720);
    schedulingMock.calculateNextCheckAt.mockReturnValue(nextCheckAt);
});

// CREATE PRODUCT
describe("productService.createProduct", () => {
    it("should return an existing product without scraping again", async () => {
        const existingProduct = makeProduct();

        productRepo.findProductByUrl.mockResolvedValue(existingProduct);

        const result = await productService.createProduct({
            url: " https://www.amazon.in/dp/TEST123 ",
        });

        expect(normalizeUrlMock).toHaveBeenCalled();
        expect(productRepo.findProductByUrl).toHaveBeenCalledWith(
            "https://www.amazon.in/dp/TEST123"
        );

        expect(result).toBe(existingProduct);
        expect(scraperMock.scrapeProduct).not.toHaveBeenCalled();
        expect(productRepo.createProduct).not.toHaveBeenCalled();
    });

    it("should scrape and save a new product and record its initial price", async () => {
        const createdProduct = makeProduct({ id: 25 });

        productRepo.findProductByUrl.mockResolvedValue(null);
        scraperMock.scrapeProduct.mockResolvedValue(
            makeScrapedData({ price: 2500 })
        );
        productRepo.createProduct.mockResolvedValue(createdProduct);
        priceHistoryMock.recordPrice.mockResolvedValue({
            recorded: true,
        });

        const result = await productService.createProduct({
            url: "https://www.amazon.in/dp/NEW123",
        });

        expect(scraperMock.scrapeProduct).toHaveBeenCalledWith(
            "https://www.amazon.in/dp/NEW123"
        );

        expect(productRepo.createProduct).toHaveBeenCalledWith({
            url: "https://www.amazon.in/dp/NEW123",
            title: "Test Product",
            imageUrl: "https://example.com/product.jpg",
            currentPrice: 2500,
            currency: "INR",
            platform: "amazon",
        });

        expect(priceHistoryMock.recordPrice).toHaveBeenCalledWith(
            25,
            2500
        );

        expect(result).toBe(createdProduct);
    });

    it("should reject a newly scraped product with no price", async () => {
        productRepo.findProductByUrl.mockResolvedValue(null);

        scraperMock.scrapeProduct.mockResolvedValue(
            makeScrapedData({
                price: null,
                availability: "out_of_stock",
            })
        );

        await expect(
            productService.createProduct({
                url: "https://www.amazon.in/dp/TEST123",
            })
        ).rejects.toThrow(
            "Product is out_of_stock and has no price"
        );

        expect(productRepo.createProduct).not.toHaveBeenCalled();
        expect(priceHistoryMock.recordPrice).not.toHaveBeenCalled();
    });
});

// GET PRODUCTS
describe("productService.getProductById", () => {
    it("should return a product when it exists", async () => {
        const product = makeProduct();

        productRepo.findProductById.mockResolvedValue(product);

        const result = await productService.getProductById(10);

        expect(productRepo.findProductById).toHaveBeenCalledWith(10);
        expect(result).toBe(product);
    });

    it("should throw when the product does not exist", async () => {
        productRepo.findProductById.mockResolvedValue(null);

        await expect(
            productService.getProductById(999)
        ).rejects.toThrow("Product not found");
    });
});

describe("productService.getAllProducts", () => {
    it("should return all products from the repository", async () => {
        const products = [
            { id: 1 },
            { id: 2 },
        ];

        productRepo.findAllProducts.mockResolvedValue(products);

        const result = await productService.getAllProducts();

        expect(result).toBe(products);
        expect(productRepo.findAllProducts).toHaveBeenCalledTimes(1);
    });
});

// DELETE PRODUCT
describe("productService.deleteProduct", () => {
    it("should delete an existing product", async () => {
        productRepo.deleteProduct.mockResolvedValue(1);

        const result = await productService.deleteProduct(10);

        expect(productRepo.deleteProduct).toHaveBeenCalledWith(10);
        expect(result).toBe(true);
    });

    it("should throw when the product does not exist", async () => {
        productRepo.deleteProduct.mockResolvedValue(0);

        await expect(
            productService.deleteProduct(999)
        ).rejects.toThrow("Product not found");
    });
});

// UPDATE PRODUCT PRICE
describe("productService.updateProductPrice", () => {
    it("should throw when the product does not exist", async () => {
        productRepo.findProductById.mockResolvedValue(null);

        await expect(
            productService.updateProductPrice(999)
        ).rejects.toThrow("Product not found");

        expect(scraperMock.scrapeProduct).not.toHaveBeenCalled();
    });

    it("should update scheduling but preserve the saved price when scraper returns null", async () => {
        const product = setupPriceUpdate(
            {
                price: null,
                availability: "out_of_stock",
            },
            [4000]
        );

        const result = await productService.updateProductPrice(10);

        expect(productRepo.updateScheduling).toHaveBeenCalledWith(
            10,
            expect.objectContaining({
                lastCheckedAt: expect.any(Date),
                nextCheckAt,
                checkIntervalMinutes: 720,
                priority: 2,
                trackingState: "out_of_stock",
            })
        );

        expect(productRepo.updateProductPrice).not.toHaveBeenCalled();
        expect(priceHistoryMock.recordPrice).not.toHaveBeenCalled();

        expect(result.changed).toBe(false);
        expect(result.previousPrice).toBe(5000);
        expect(result.currentPrice).toBeNull();
        expect(result.availabilityChanged).toBe(true);
        expect(result.product).toBe(product);
    });

    it("should not record a new price when the price has not changed", async () => {
        setupPriceUpdate({
            price: 5000,
            availability: "in_stock",
        });

        const result = await productService.updateProductPrice(10);

        expect(productRepo.updateScheduling).toHaveBeenCalledTimes(1);
        expect(productRepo.updateProductPrice).not.toHaveBeenCalled();
        expect(priceHistoryMock.recordPrice).not.toHaveBeenCalled();

        expect(result.changed).toBe(false);
        expect(result.previousPrice).toBe(5000);
        expect(result.currentPrice).toBe(5000);
        expect(result.priceDropped).toBe(false);
        expect(result.priceIncreased).toBe(false);
    });

    it("should update product and price history when the price drops", async () => {
        const product = setupPriceUpdate({
            price: 4500,
            availability: "in_stock",
        });

        const updatedProduct = makeProduct({
            currentPrice: 4500,
        });

        // First call returns the original product; second returns the updated product
        productRepo.findProductById.mockReset();
        productRepo.findProductById
            .mockResolvedValueOnce(product)
            .mockResolvedValueOnce(updatedProduct);

        const result = await productService.updateProductPrice(10);

        expect(productRepo.updateProductPrice).toHaveBeenCalledWith(
            10,
            4500
        );

        expect(priceHistoryMock.recordPrice).toHaveBeenCalledWith(
            10,
            4500
        );

        expect(result.changed).toBe(true);
        expect(result.previousPrice).toBe(5000);
        expect(result.currentPrice).toBe(4500);
        expect(result.priceDropped).toBe(true);
        expect(result.priceIncreased).toBe(false);
        expect(result.recorded).toBe(true);
        expect(result.product).toBe(updatedProduct);
    });

    it("should identify a price increase correctly", async () => {
        const product = setupPriceUpdate({
            price: 5500,
            availability: "in_stock",
        });

        const updatedProduct = makeProduct({
            currentPrice: 5500,
        });

        productRepo.findProductById.mockReset();
        productRepo.findProductById
            .mockResolvedValueOnce(product)
            .mockResolvedValueOnce(updatedProduct);

        const result = await productService.updateProductPrice(10);

        expect(productRepo.updateProductPrice).toHaveBeenCalledWith(
            10,
            5500
        );

        expect(result.changed).toBe(true);
        expect(result.priceDropped).toBe(false);
        expect(result.priceIncreased).toBe(true);
    });

    it("should compare the scraped price against tracked target prices", async () => {
        setupPriceUpdate(
            { price: 4800 },
            [5000, null, 4500]
        );

        await productService.updateProductPrice(10);

        expect(schedulingMock.isTargetPriceClose).toHaveBeenCalledWith(
            4800,
            [5000, 4500]
        );
    });

    it("should calculate scheduling information on each price check", async () => {
        setupPriceUpdate({ price: 5000 });

        await productService.updateProductPrice(10);

        expect(
            priceHistoryMock.getRecentPriceChangeCount
        ).toHaveBeenCalledWith(10);

        expect(
            priceHistoryMock.isStableForWeeks
        ).toHaveBeenCalledWith(10);

        expect(
            schedulingMock.getCheckIntervalMinutes
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                isNew: false,
                priceChangeCount: 0,
                stableForWeeks: false,
                trackingState: "in_stock",
            })
        );

        expect(
            schedulingMock.calculateNextCheckAt
        ).toHaveBeenCalledWith(720, expect.any(Date));
    });
});
