import { describe, it, expect } from "@jest/globals";
import schedulingService from "./schedulingService";

describe("schedulingService.getCheckIntervalMinutes", () => {
    it("should schedule discontinued products after 3 days", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: true,
            priceChangeCount: 5,
            stableForWeeks: false,
            trackingState: "discontinued",
        });

        expect(result).toBe(4320);
    });

    it("should schedule out-of-stock products after 6 hours", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: false,
            priceChangeCount: 5,
            stableForWeeks: false,
            trackingState: "out_of_stock",
        });

        expect(result).toBe(360);
    });

    it("should check products every 15 minutes during a sale period", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: false,
            priceChangeCount: 0,
            stableForWeeks: true,
            isSalePeriod: true,
            trackingState: "in_stock",
        });

        expect(result).toBe(15);
    });

    it("should check newly added products every 30 minutes", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: true,
            priceChangeCount: 0,
            stableForWeeks: false,
            trackingState: "in_stock",
        });

        expect(result).toBe(30);
    });

    it("should check products near the target price every 15 minutes", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: false,
            priceChangeCount: 0,
            targetPriceClose: true,
            stableForWeeks: false,
            trackingState: "in_stock",
        });

        expect(result).toBe(15);
    });

    it("should check frequently changing products every hour", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: false,
            priceChangeCount: 3,
            stableForWeeks: false,
            trackingState: "in_stock",
        });

        expect(result).toBe(60);
    });

    it("should check stable products after 24 hours", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: false,
            priceChangeCount: 0,
            stableForWeeks: true,
            trackingState: "in_stock",
        });

        expect(result).toBe(1440);
    });

    it("should use the default 12-hour interval", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: false,
            priceChangeCount: 0,
            stableForWeeks: false,
            trackingState: "in_stock",
        });

        expect(result).toBe(720);
    });

    it("should prioritize a sale period over the new-product rule", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: true,
            priceChangeCount: 0,
            stableForWeeks: false,
            isSalePeriod: true,
            trackingState: "in_stock",
        });

        expect(result).toBe(15);
    });

    it("should prioritize the new-product rule over the target-price rule", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: true,
            priceChangeCount: 0,
            targetPriceClose: true,
            stableForWeeks: false,
            trackingState: "in_stock",
        });

        expect(result).toBe(30);
    });

    it("should prioritize frequent price changes over long-term stability", () => {
        const result = schedulingService.getCheckIntervalMinutes({
            isNew: false,
            priceChangeCount: 3,
            stableForWeeks: true,
            trackingState: "in_stock",
        });

        expect(result).toBe(60);
    });
});

describe("schedulingService.calculateNextCheckAt", () => {
    it("should calculate the next check time correctly", () => {
        const from = new Date("2026-01-01T10:00:00.000Z");

        const result = schedulingService.calculateNextCheckAt(
            60,
            from
        );

        expect(result.toISOString()).toBe(
            "2026-01-01T11:00:00.000Z"
        );
    });

    it("should calculate a next check time several hours later", () => {
        const from = new Date("2026-01-01T10:00:00.000Z");

        const result = schedulingService.calculateNextCheckAt(
            720,
            from
        );

        expect(result.toISOString()).toBe(
            "2026-01-01T22:00:00.000Z"
        );
    });
});

describe("schedulingService.isTargetPriceClose", () => {
    it("should return false when there are no target prices", () => {
        const result = schedulingService.isTargetPriceClose(
            10000,
            []
        );

        expect(result).toBe(false);
    });

    it("should return true when the target price equals the current price", () => {
        const result = schedulingService.isTargetPriceClose(
            10000,
            [10000]
        );

        expect(result).toBe(true);
    });

    it("should return true when the target price is above the current price", () => {
        const result = schedulingService.isTargetPriceClose(
            10000,
            [10500]
        );

        expect(result).toBe(true);
    });

    it("should return true when the target is exactly 5 percent below the current price", () => {
        const result = schedulingService.isTargetPriceClose(
            10000,
            [9500]
        );

        expect(result).toBe(true);
    });

    it("should return false when the target is more than 5 percent below the current price", () => {
        const result = schedulingService.isTargetPriceClose(
            10000,
            [9499]
        );

        expect(result).toBe(false);
    });

    it("should return true if any target price is close enough", () => {
        const result = schedulingService.isTargetPriceClose(
            10000,
            [8000, 7000, 9600]
        );

        expect(result).toBe(true);
    });

    it("should return false when all target prices are more than 5 percent below the current price", () => {
        const result = schedulingService.isTargetPriceClose(
            10000,
            [8000, 9000, 9499]
        );

        expect(result).toBe(false);
    });
});
