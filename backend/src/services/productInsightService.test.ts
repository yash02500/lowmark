import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import userProductRepository from "../repositories/userProductRepository";
import priceAnalyticsService from "./priceAnalyticsService";
import aiService from "./aiService";
import userProductModule from "./productInsightService";

const {
    getUserProductsInsight,
    getUserProductAttention,
    getUserProductInsightById,
} = userProductModule;

// Mock the repository
jest.mock("../repositories/userProductRepository", () => ({
    __esModule: true,
    default: {
        findUserProducts: jest.fn(),
        findUserProductById: jest.fn(),
    },
}));

// Mock price analytics
jest.mock("./priceAnalyticsService", () => ({
    __esModule: true,
    default: {
        getPriceAnalytics: jest.fn(),
    },
}));

// Mock AI calls
jest.mock("./aiService", () => ({
    __esModule: true,
    default: {
        generateTrackedProductsInsight: jest.fn(),
        generateProductInsight: jest.fn(),
        generateAttentionSummary: jest.fn(),
    },
}));

const repository = userProductRepository as any;
const analyticsMock = priceAnalyticsService as any;
const aiMock = aiService as any;

const makeProduct = (
    id: number,
    overrides: Record<string, any> = {}
) => {
    const values: Record<string, any> = {
        id,
        title: `Test Product ${id}`,
        trackingState: "in_stock",
        ...overrides,
    };

    return {
        getDataValue: (key: string) => values[key],
    };
};

const makeUserProduct = (
    product: any,
    targetPrice: number | null,
    productId: number
) => ({
    get: (key: string) => {
        if (key === "product") return product;
        if (key === "targetPrice") return targetPrice;

        return undefined;
    },

    getDataValue: (key: string) => {
        if (key === "productId") return productId;

        return undefined;
    },
});

const makeAnalytics = (
    overrides: Record<string, any> = {}
) => ({
    currentPrice: 100,
    lowestPrice: 80,
    highestPrice: 120,
    averagePrice: 100,
    priceChange: 0,
    priceChangePercentage: 0,
    sevenDayChangePercentage: 0,
    thirtyDayChangePercentage: 0,
    trend: "stable",
    priceChangeCount: 0,
    ...overrides,
});

beforeEach(() => {
    jest.resetAllMocks();

    analyticsMock.getPriceAnalytics.mockResolvedValue(
        makeAnalytics()
    );

    aiMock.generateTrackedProductsInsight.mockResolvedValue(
        "AI tracked products summary"
    );

    aiMock.generateProductInsight.mockResolvedValue(
        "AI product summary"
    );

    aiMock.generateAttentionSummary.mockResolvedValue(
        "AI attention summary"
    );
});

afterEach(() => {
    jest.restoreAllMocks();
});

// 1. getUserProductsInsight
describe("getUserProductsInsight", () => {
    it("should return an empty-state response when no products are tracked", async () => {
        repository.findUserProducts.mockResolvedValue([]);

        const result = await getUserProductsInsight(7);

        expect(result).toEqual({
            trackedProductCount: 0,
            summary: "You are not tracking any products yet.",
        });

        expect(
            aiMock.generateTrackedProductsInsight
        ).not.toHaveBeenCalled();
    });

    it("should classify a target price as reached", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(10), 100, 10),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 90,
            })
        );

        const result = await getUserProductsInsight(7);

        expect(result.trackedProductCount).toBe(1);
        expect(result.products?.[0].targetStatus).toBe("reached");
        expect(result.products?.[0].targetPrice).toBe(100);

        expect(
            aiMock.generateTrackedProductsInsight
        ).toHaveBeenCalledWith([
            expect.objectContaining({
                productId: 10,
                title: "Test Product 10",
                currentPrice: 90,
                targetStatus: "reached",
            }),
        ]);

        expect(result.summary).toBe(
            "AI tracked products summary"
        );
    });

    it("should classify a target price as close when the current price is exactly 10% above it", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(11), 100, 11),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 110,
            })
        );

        const result = await getUserProductsInsight(7);

        expect(result.products?.[0].targetStatus).toBe("close");
    });

    it("should classify a target price as above_target when the current price is more than 10% above it", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(12), 100, 12),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 111,
            })
        );

        const result = await getUserProductsInsight(7);

        expect(result.products?.[0].targetStatus).toBe(
            "above_target"
        );
    });

    it("should classify a missing target price as not_set", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(13), null, 13),
        ]);

        const result = await getUserProductsInsight(7);

        expect(result.products?.[0].targetStatus).toBe("not_set");
        expect(result.products?.[0].targetPrice).toBeNull();
    });

    it("should skip tracked products that no longer exist", async () => {
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => { });

        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(null, 100, 14),
            makeUserProduct(makeProduct(15), null, 15),
        ]);

        const result = await getUserProductsInsight(7);

        expect(result.trackedProductCount).toBe(1);
        expect(result.products?.[0].productId).toBe(15);
        expect(analyticsMock.getPriceAnalytics).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalled();
    });

    it("should use unknown availability when trackingState is missing", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(
                makeProduct(16, {
                    trackingState: null,
                }),
                null,
                16
            ),
        ]);

        const result = await getUserProductsInsight(7);

        expect(result.products?.[0].availability).toBe("unknown");
    });
});

// 2. getUserProductAttention
describe("getUserProductAttention", () => {
    it("should return an empty-state response when no products are tracked", async () => {
        repository.findUserProducts.mockResolvedValue([]);

        const result = await getUserProductAttention(7);

        expect(result).toEqual({
            productCount: 0,
            attentionItems: [],
            summary: "You are not tracking any products yet.",
        });

        expect(
            aiMock.generateAttentionSummary
        ).not.toHaveBeenCalled();
    });

    it("should create a historical-low alert", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(30), null, 30),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 80,
                lowestPrice: 80,
                priceChangePercentage: 0,
            })
        );

        const result = await getUserProductAttention(7);

        expect(result.attentionItems).toContainEqual(
            expect.objectContaining({
                productId: 30,
                type: "historical_low",
                priority: "high",
                currentPrice: 80,
                lowestPrice: 80,
            })
        );
    });

    it("should create a target-reached alert", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(31), 100, 31),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 95,
                lowestPrice: 80,
                priceChangePercentage: 0,
            })
        );

        const result = await getUserProductAttention(7);

        expect(result.attentionItems).toContainEqual(
            expect.objectContaining({
                productId: 31,
                type: "target_reached",
                priority: "high",
                targetPrice: 100,
            })
        );
    });

    it("should create a target-close alert with a rounded percentage", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(32), 100, 32),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 107.126,
                lowestPrice: 80,
                priceChangePercentage: 0,
            })
        );

        const result = await getUserProductAttention(7);

        expect(result.attentionItems).toContainEqual(
            expect.objectContaining({
                productId: 32,
                type: "target_close",
                priority: "medium",
                targetPrice: 100,
                percentageAboveTarget: 7.13,
            })
        );
    });

    it("should not create a target-close alert when the price is more than 10% above the target", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(33), 100, 33),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 111,
                lowestPrice: 80,
                priceChangePercentage: 0,
            })
        );

        const result = await getUserProductAttention(7);

        expect(
            result.attentionItems.some(
                (item: any) => item.type === "target_close"
            )
        ).toBe(false);
    });

    it("should create a significant price-drop alert", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(34), null, 34),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 90,
                lowestPrice: 80,
                priceChangePercentage: -10,
            })
        );

        const result = await getUserProductAttention(7);

        expect(result.attentionItems).toContainEqual(
            expect.objectContaining({
                productId: 34,
                type: "significant_drop",
                priority: "high",
                priceChangePercentage: -10,
            })
        );
    });

    it("should create a significant price-increase alert", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(35), null, 35),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 110,
                lowestPrice: 80,
                priceChangePercentage: 10,
            })
        );

        const result = await getUserProductAttention(7);

        expect(result.attentionItems).toContainEqual(
            expect.objectContaining({
                productId: 35,
                type: "significant_increase",
                priority: "medium",
                priceChangePercentage: 10,
            })
        );
    });

    it("should not create a significant price-change alert when the percentage is null", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(36), null, 36),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 100,
                lowestPrice: 80,
                priceChangePercentage: null,
            })
        );

        const result = await getUserProductAttention(7);

        expect(
            result.attentionItems.some(
                (item: any) =>
                    item.type === "significant_drop" ||
                    item.type === "significant_increase"
            )
        ).toBe(false);
    });

    it("should skip tracked products whose associated product no longer exists", async () => {
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => { });

        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(null, 100, 37),
        ]);

        const result = await getUserProductAttention(7);

        expect(result.productCount).toBe(1);
        expect(result.attentionItems).toEqual([]);
        expect(warnSpy).toHaveBeenCalled();

        expect(
            aiMock.generateAttentionSummary
        ).toHaveBeenCalledWith([]);
    });

    it("should generate and return the AI attention summary", async () => {
        repository.findUserProducts.mockResolvedValue([
            makeUserProduct(makeProduct(38), null, 38),
        ]);

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 80,
                lowestPrice: 80,
            })
        );

        aiMock.generateAttentionSummary.mockResolvedValue(
            "This product is at its historical low."
        );

        const result = await getUserProductAttention(7);

        expect(
            aiMock.generateAttentionSummary
        ).toHaveBeenCalledWith(result.attentionItems);

        expect(result.summary).toBe(
            "This product is at its historical low."
        );
    });
});

// 3. getUserProductInsightById
describe("getUserProductInsightById", () => {
    it("should throw when the tracked product does not exist", async () => {
        repository.findUserProductById.mockResolvedValue(null);

        await expect(
            getUserProductInsightById(99, 7)
        ).rejects.toThrow("Tracked product not found");

        expect(
            analyticsMock.getPriceAnalytics
        ).not.toHaveBeenCalled();

        expect(
            aiMock.generateProductInsight
        ).not.toHaveBeenCalled();
    });

    it("should throw when the associated product no longer exists", async () => {
        repository.findUserProductById.mockResolvedValue(
            makeUserProduct(null, 100, 40)
        );

        await expect(
            getUserProductInsightById(40, 7)
        ).rejects.toThrow(
            "The product associated with this tracking record no longer exists"
        );

        expect(
            analyticsMock.getPriceAnalytics
        ).not.toHaveBeenCalled();
    });

    it("should return the individual product insight", async () => {
        repository.findUserProductById.mockResolvedValue(
            makeUserProduct(makeProduct(41), 100, 41)
        );

        analyticsMock.getPriceAnalytics.mockResolvedValue(
            makeAnalytics({
                currentPrice: 95,
                lowestPrice: 80,
            })
        );

        aiMock.generateProductInsight.mockResolvedValue(
            "Price is approaching the target."
        );

        const result = await getUserProductInsightById(50, 7);

        expect(
            repository.findUserProductById
        ).toHaveBeenCalledWith(50, 7);

        expect(
            analyticsMock.getPriceAnalytics
        ).toHaveBeenCalledWith(41);

        expect(
            aiMock.generateProductInsight
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                currentPrice: 95,
            })
        );

        expect(result).toEqual({
            productId: 41,
            title: "Test Product 41",
            currentPrice: 95,
            summary: "Price is approaching the target.",
        });
    });
});