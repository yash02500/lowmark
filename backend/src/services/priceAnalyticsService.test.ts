import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import priceAnalyticsService from "./priceAnalyticsService";
import priceHistoryRepository from "../repositories/priceHistoryRepository";
import productRepository from "../repositories/productRepository";

jest.mock("../repositories/priceHistoryRepository", () => ({
    __esModule: true,
    default: {
        findPriceHistoryByProductId: jest.fn(),
    },
}));

jest.mock("../repositories/productRepository", () => ({
    __esModule: true,
    default: {
        findProductById: jest.fn(),
    },
}));

const mockedProductRepository = jest.mocked(productRepository);
const mockedPriceHistoryRepository = jest.mocked(
    priceHistoryRepository
);

const createMockProduct = (currentPrice: number | string) => ({
    getDataValue: jest.fn((key: string) => {
        if (key === "currentPrice") {
            return currentPrice;
        }

        return null;
    }),
});

const createMockHistoryRecord = (
    price: number | string,
    recordedAt: Date
) => ({
    get: jest.fn((key: string) => {
        if (key === "price") {
            return price;
        }

        if (key === "recordedAt") {
            return recordedAt;
        }

        return null;
    }),
});

describe("priceAnalyticsService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getPriceAnalytics", () => {
        it("should throw an error when product does not exist", async () => {
            mockedProductRepository.findProductById.mockResolvedValue(
                null as any
            );

            await expect(
                priceAnalyticsService.getPriceAnalytics(1)
            ).rejects.toThrow("Product not found");

            expect(
                mockedProductRepository.findProductById
            ).toHaveBeenCalledWith(1);

            expect(
                mockedPriceHistoryRepository.findPriceHistoryByProductId
            ).not.toHaveBeenCalled();
        });

        it("should return default analytics when price history is empty", async () => {
            const product = createMockProduct(500);

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                [] as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result).toEqual({
                currentPrice: 500,
                lowestPrice: 500,
                highestPrice: 500,
                averagePrice: 500,
                previousPrice: null,
                priceChange: null,
                priceChangePercentage: null,
                sevenDayChangePercentage: null,
                thirtyDayChangePercentage: null,
                trend: "insufficient_data",
                priceChangeCount: 0,
            });
        });

        it("should call repositories with the correct product ID", async () => {
            const product = createMockProduct(100);

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                [] as any
            );

            await priceAnalyticsService.getPriceAnalytics(25);

            expect(
                mockedProductRepository.findProductById
            ).toHaveBeenCalledWith(25);

            expect(
                mockedPriceHistoryRepository.findPriceHistoryByProductId
            ).toHaveBeenCalledWith(25);
        });

        it("should convert current price to a number", async () => {
            const product = createMockProduct("250");

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                [] as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.currentPrice).toBe(250);
            expect(typeof result.currentPrice).toBe("number");
        });

        it("should calculate the lowest price correctly", async () => {
            const product = createMockProduct(1200);

            const history = [
                createMockHistoryRecord(1100, new Date()),
                createMockHistoryRecord(900, new Date()),
                createMockHistoryRecord(1000, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.lowestPrice).toBe(900);
        });

        it("should calculate the highest price correctly", async () => {
            const product = createMockProduct(1200);

            const history = [
                createMockHistoryRecord(1100, new Date()),
                createMockHistoryRecord(900, new Date()),
                createMockHistoryRecord(1000, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.highestPrice).toBe(1200);
        });

        it("should calculate the average price correctly", async () => {
            const product = createMockProduct(1000);

            const history = [
                createMockHistoryRecord(900, new Date()),
                createMockHistoryRecord(1100, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            // (900 + 1100 + 1000) / 3 = 1000
            expect(result.averagePrice).toBe(1000);
        });

        it("should round average price to two decimal places", async () => {
            const product = createMockProduct(1000);

            const history = [
                createMockHistoryRecord(1000, new Date()),
                createMockHistoryRecord(1001, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            // (1000 + 1000 + 1001) / 3 = 1000.333...
            expect(result.averagePrice).toBe(1000.33);
        });

        it("should calculate previous price and price change", async () => {
            const product = createMockProduct(1200);

            const history = [
                createMockHistoryRecord(1000, new Date()),
                createMockHistoryRecord(900, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.previousPrice).toBe(1000);
            expect(result.priceChange).toBe(200);
        });

        it("should calculate price change percentage correctly", async () => {
            const product = createMockProduct(1200);

            const history = [
                createMockHistoryRecord(1000, new Date()),
                createMockHistoryRecord(900, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.priceChangePercentage).toBe(20);
        });

        it("should return null percentage when previous price is zero", async () => {
            const product = createMockProduct(100);

            const history = [
                createMockHistoryRecord(0, new Date()),
                createMockHistoryRecord(50, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.previousPrice).toBe(0);
            expect(result.priceChange).toBe(100);
            expect(result.priceChangePercentage).toBeNull();
        });

        it("should calculate seven-day and thirty-day price changes", async () => {
            const now = new Date("2026-11-18T12:00:00.000Z");

            jest.useFakeTimers();
            jest.setSystemTime(now);

            try {
                const product = createMockProduct(120);

                // History is expected to be ordered newest first.
                const history = [
                    createMockHistoryRecord(
                        110,
                        new Date("2026-11-17T12:00:00.000Z")
                    ),
                    createMockHistoryRecord(
                        100,
                        new Date("2026-11-13T12:00:00.000Z")
                    ),
                    createMockHistoryRecord(
                        90,
                        new Date("2026-11-05T12:00:00.000Z")
                    ),
                ];

                mockedProductRepository.findProductById.mockResolvedValue(
                    product as any
                );

                mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                    history as any
                );

                const result =
                    await priceAnalyticsService.getPriceAnalytics(1);

                // Seven-day change: (120 - 100) / 100 * 100 = 20%
                expect(result.sevenDayChangePercentage).toBe(20);

                // Thirty-day change: (120 - 90) / 90 * 100 = 33.33%
                expect(result.thirtyDayChangePercentage).toBe(33.33);
            } finally {
                jest.useRealTimers();
            }
        });

        it("should return null seven-day change when no history exists within seven days", async () => {
            const now = new Date("2026-11-18T12:00:00.000Z");

            jest.useFakeTimers();
            jest.setSystemTime(now);

            try {
                const product = createMockProduct(120);

                const history = [
                    createMockHistoryRecord(
                        100,
                        new Date("2026-10-01T12:00:00.000Z")
                    ),
                    createMockHistoryRecord(
                        90,
                        new Date("2026-09-25T12:00:00.000Z")
                    ),
                ];

                mockedProductRepository.findProductById.mockResolvedValue(
                    product as any
                );

                mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                    history as any
                );

                const result =
                    await priceAnalyticsService.getPriceAnalytics(1);

                expect(result.sevenDayChangePercentage).toBeNull();
                expect(result.thirtyDayChangePercentage).toBeNull();
            } finally {
                jest.useRealTimers();
            }
        });

        it("should return increasing trend when recent prices are increasing", async () => {
            const product = createMockProduct(1300);

            // Newest price first: 1200 -> 1100 -> 1000
            const history = [
                createMockHistoryRecord(1000, new Date()),
                createMockHistoryRecord(1100, new Date()),
                createMockHistoryRecord(1200, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.trend).toBe("increasing");
        });

        it("should return decreasing trend when recent prices are decreasing", async () => {
            const product = createMockProduct(700);

            // Newest price first: 800 -> 900 -> 1000
            const history = [
                createMockHistoryRecord(1000, new Date()),
                createMockHistoryRecord(900, new Date()),
                createMockHistoryRecord(800, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.trend).toBe("decreasing");
        });

        it("should return stable trend when recent prices are neither increasing nor decreasing", async () => {
            const product = createMockProduct(1000);

            const history = [
                createMockHistoryRecord(1000, new Date()),
                createMockHistoryRecord(900, new Date()),
                createMockHistoryRecord(1100, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.trend).toBe("stable");
        });

        it("should return insufficient_data trend when history has fewer than two records", async () => {
            const product = createMockProduct(1000);

            const history = [
                createMockHistoryRecord(900, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.trend).toBe("insufficient_data");
        });

        it("should return the correct price change count", async () => {
            const product = createMockProduct(1000);

            const history = [
                createMockHistoryRecord(900, new Date()),
                createMockHistoryRecord(950, new Date()),
                createMockHistoryRecord(980, new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.priceChangeCount).toBe(3);
        });

        it("should convert history prices to numbers", async () => {
            const product = createMockProduct("1200");

            const history = [
                createMockHistoryRecord("1000", new Date()),
                createMockHistoryRecord("1100", new Date()),
            ];

            mockedProductRepository.findProductById.mockResolvedValue(
                product as any
            );

            mockedPriceHistoryRepository.findPriceHistoryByProductId.mockResolvedValue(
                history as any
            );

            const result =
                await priceAnalyticsService.getPriceAnalytics(1);

            expect(result.currentPrice).toBe(1200);
            expect(result.previousPrice).toBe(1000);
            expect(result.lowestPrice).toBe(1000);
            expect(result.highestPrice).toBe(1200);
        });
    });
});
