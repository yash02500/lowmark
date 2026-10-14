import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import notificationService from "./notificationService";
import notificationQueue from "../queues/notificationQueue";

// Mock the database repository
jest.mock("../repositories/notificationRepository", () => ({
    __esModule: true,
    default: {
        createNotification: jest.fn(),
        findUserNotifications: jest.fn(),
        findNotificationById: jest.fn(),
        markAsRead: jest.fn(),
        markAllAsRead: jest.fn(),
        deleteNotification: jest.fn(),
    },
}));

// Mock BullMQ so tests don't add real Redis jobs
jest.mock("../queues/notificationQueue", () => ({
    __esModule: true,
    default: {
        add: jest.fn(),
    },
}));

const addMock = notificationQueue.add as unknown as jest.Mock;

const makeUserProduct = (
    userId: number,
    targetPrice: number | null
) => ({
    getDataValue: (key: string) => {
        if (key === "userId") return userId;
        if (key === "targetPrice") return targetPrice;
        return undefined;
    },
});

type QueueData = Parameters<typeof notificationService.queueNotifications>[0];

const makeQueueData = (
    overrides: Partial<QueueData> = {}
): QueueData => ({
    productId: 123,
    previousPrice: 6000,
    currentPrice: 5500,
    priceDropped: false,
    previousTrackingState: "in_stock",
    currentTrackingState: "in_stock",
    userProducts: [makeUserProduct(7, 5000)],
    product: {
        getDataValue: (key: string) =>
            key === "title" ? "Test Product" : undefined,
    },
    ...overrides,
});

describe("notificationService.queueNotifications", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("queues a target notification when price crosses below the target", async () => {
        await notificationService.queueNotifications(
            makeQueueData({
                previousPrice: 5500,
                currentPrice: 4900,
            })
        );

        expect(addMock).toHaveBeenCalledTimes(1);
        expect(addMock).toHaveBeenCalledWith(
            "target-price-reached",
            expect.objectContaining({
                userId: 7,
                productId: 123,
                type: "target_price_reached",
                title: "Target price reached",
            })
        );
    });

    it("queues a target notification when price equals the target", async () => {
        await notificationService.queueNotifications(
            makeQueueData({
                previousPrice: 5500,
                currentPrice: 5000,
            })
        );

        expect(addMock).toHaveBeenCalledTimes(1);
        expect(addMock).toHaveBeenCalledWith(
            "target-price-reached",
            expect.objectContaining({
                type: "target_price_reached",
            })
        );
    });

    it("does not queue a target notification when price was already at the target", async () => {
        await notificationService.queueNotifications(
            makeQueueData({
                previousPrice: 5000,
                currentPrice: 4800,
            })
        );

        expect(addMock).not.toHaveBeenCalled();
    });

    it("queues a price-drop notification when priceDropped is true", async () => {
        await notificationService.queueNotifications(
            makeQueueData({
                previousPrice: 5000,
                currentPrice: 4500,
                priceDropped: true,
                userProducts: [makeUserProduct(7, 3000)],
            })
        );

        expect(addMock).toHaveBeenCalledTimes(1);
        expect(addMock).toHaveBeenCalledWith(
            "price-drop",
            expect.objectContaining({
                type: "price_drop",
                title: "Price dropped",
            })
        );
    });

    it("queues a back-in-stock notification on the correct transition", async () => {
        await notificationService.queueNotifications(
            makeQueueData({
                currentPrice: null,
                previousTrackingState: "out_of_stock",
                currentTrackingState: "in_stock",
                userProducts: [makeUserProduct(7, null)],
            })
        );

        expect(addMock).toHaveBeenCalledTimes(1);
        expect(addMock).toHaveBeenCalledWith(
            "back-in-stock",
            expect.objectContaining({
                type: "back_in_stock",
            })
        );
    });

    it("queues an out-of-stock notification on the correct transition", async () => {
        await notificationService.queueNotifications(
            makeQueueData({
                currentPrice: null,
                previousTrackingState: "in_stock",
                currentTrackingState: "out_of_stock",
                userProducts: [makeUserProduct(7, null)],
            })
        );

        expect(addMock).toHaveBeenCalledTimes(1);
        expect(addMock).toHaveBeenCalledWith(
            "out-of-stock",
            expect.objectContaining({
                type: "out_of_stock",
            })
        );
    });

    it("queues a discontinued notification when the product becomes discontinued", async () => {
        await notificationService.queueNotifications(
            makeQueueData({
                currentPrice: null,
                previousTrackingState: "in_stock",
                currentTrackingState: "discontinued",
                userProducts: [makeUserProduct(7, null)],
            })
        );

        expect(addMock).toHaveBeenCalledTimes(1);
        expect(addMock).toHaveBeenCalledWith(
            "discontinued",
            expect.objectContaining({
                type: "discontinued",
            })
        );
    });
});
