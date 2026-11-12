import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Worker } from "bullmq";
import redisConnection from "../config/redis";
import productService from "../services/productService";
import notificationService from "../services/notificationService";

// Mock BullMQ Worker
jest.mock("bullmq", () => ({
    Worker: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
        close: jest.fn(),
    })),
}));

// Mock Redis connection
jest.mock("../config/redis", () => ({
    __esModule: true,
    default: {
        host: "localhost",
        port: 6379,
        quit: jest.fn(),
    },
}));

// Mock product service
jest.mock("../services/productService", () => ({
    __esModule: true,
    default: {
        updateProductPrice: jest.fn(),
    },
}));

// Mock notification service
jest.mock("../services/notificationService", () => ({
    __esModule: true,
    default: {
        queueNotifications: jest.fn(),
    },
}));

// Import worker after mocks
import "./priceCheckWorker";

type PriceCheckProcessor = (
    job: { data: { productId: number } }
) => Promise<void>;

// Capture worker constructor arguments during module initialization
const workerMock = Worker as unknown as jest.Mock;
const workerCall = workerMock.mock.calls[0] as unknown[] | undefined;

const priceCheckProcessor =
    workerCall?.[1] as PriceCheckProcessor | undefined;

// Test data
const mockPriceCheckResult = {
    previousPrice: 2000,
    currentPrice: 1500,
    priceDropped: true,
    priceIncreased: false,
    previousTrackingState: "in_stock",
    currentTrackingState: "in_stock",
    userProducts: [
        {
            id: 1,
            userId: 1,
            productId: 12,
            targetPrice: 1600,
        },
    ],
    product: {
        id: 12,
        title: "Test Product",
        currentPrice: 1500,
    },
};

const runProcessor = (productId: number) => {
    if (!priceCheckProcessor) {
        throw new Error("Price check worker processor was not initialized");
    }

    return priceCheckProcessor({
        data: { productId },
    });
};

describe("priceCheckWorker", () => {
    beforeEach(() => {
        jest.mocked(productService.updateProductPrice).mockReset();

        jest.mocked(notificationService.queueNotifications).mockReset();
    });

    // WORKER INITIALIZATION
    describe("worker initialization", () => {
        it("should initialize price check worker with correct configuration", () => {
            expect(workerCall).toBeDefined();

            expect(workerCall?.[0]).toBe("price-check");

            expect(workerCall?.[2]).toEqual({
                connection: redisConnection,
                concurrency: 3,
            });

            expect(priceCheckProcessor).toBeDefined();
        });
    });

    // PROCESS PRICE CHECK JOB
    describe("price check job processing", () => {
        it("should update product price successfully", async () => {
            jest.mocked(productService.updateProductPrice)
                .mockResolvedValue(mockPriceCheckResult as never);

            jest.mocked(notificationService.queueNotifications)
                .mockResolvedValue(undefined as never);

            await runProcessor(12);

            expect(productService.updateProductPrice)
                .toHaveBeenCalledWith(12);

        });

        it("should queue notifications with correct price check data", async () => {
            jest.mocked(productService.updateProductPrice)
                .mockResolvedValue(mockPriceCheckResult as never);

            jest.mocked(notificationService.queueNotifications)
                .mockResolvedValue(undefined as never);

            await runProcessor(12);

            expect(notificationService.queueNotifications)
                .toHaveBeenCalledWith({
                    productId: 12,
                    previousPrice: 2000,
                    currentPrice: 1500,
                    priceDropped: true,
                    priceIncreased: false,
                    previousTrackingState: "in_stock",
                    currentTrackingState: "in_stock",
                    userProducts: mockPriceCheckResult.userProducts,
                    product: mockPriceCheckResult.product,
                });
        });

        it("should process the correct product ID from the job", async () => {
            jest.mocked(productService.updateProductPrice)
                .mockResolvedValue(mockPriceCheckResult as never);

            jest.mocked(notificationService.queueNotifications)
                .mockResolvedValue(undefined as never);

            await runProcessor(25);

            expect(productService.updateProductPrice)
                .toHaveBeenCalledWith(25);
        });

        it("should throw an error when product price update fails", async () => {
            jest.mocked(productService.updateProductPrice)
                .mockRejectedValue(new Error("Price scraping failed"));

            await expect(
                runProcessor(12)
            ).rejects.toThrow("Price scraping failed");

            expect(productService.updateProductPrice)
                .toHaveBeenCalledWith(12);

            expect(notificationService.queueNotifications)
                .not.toHaveBeenCalled();
        });

        it("should throw an error when queuing notifications fails", async () => {
            jest.mocked(productService.updateProductPrice)
                .mockResolvedValue(mockPriceCheckResult as never);

            jest.mocked(notificationService.queueNotifications)
                .mockRejectedValue(new Error("Notification queue failed"));

            await expect(
                runProcessor(12)
            ).rejects.toThrow("Notification queue failed");

            expect(productService.updateProductPrice)
                .toHaveBeenCalledWith(12);

            expect(notificationService.queueNotifications)
                .toHaveBeenCalledTimes(1);
        });
    });
});
