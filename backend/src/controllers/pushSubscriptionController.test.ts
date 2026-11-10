import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { Request, Response } from "express";
import pushSubscriptionController from "./pushSubscriptionController";
import pushSubscriptionService from "../services/pushSubscriptionService";

// Mock push subscription service
jest.mock("../services/pushSubscriptionService", () => ({
    __esModule: true,
    default: {
        saveSubscription: jest.fn(),
        deleteSubscription: jest.fn(),
    },
}));

// Create mock Express request and response
const createMocks = (
    options: {
        userId?: number;
        body?: Record<string, any>;
    } = {}
) => {
    const req = {
        userId: options.userId ?? 1,
        body: options.body ?? {},
    } as unknown as Request;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    return { req, res };
};

describe("pushSubscriptionController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // SUBSCRIBE
    describe("subscribe", () => {
        it("should save push subscription successfully", async () => {
            const subscriptionInput = {
                endpoint: "https://push-service.example/subscription/123",
                keys: {
                    p256dh: "test-p256dh-key",
                    auth: "test-auth-key",
                },
            };

            const subscription = {
                id: 1,
                userId: 1,
                ...subscriptionInput,
            };

            jest.mocked(pushSubscriptionService.saveSubscription)
                .mockResolvedValue(subscription as never);

            const { req, res } = createMocks({
                userId: 1,
                body: subscriptionInput,
            });

            await pushSubscriptionController.subscribe(req, res);

            expect(
                pushSubscriptionService.saveSubscription
            ).toHaveBeenCalledWith(1, subscriptionInput);

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Push subscription saved successfully",
                data: subscription,
            });
        });

        it("should return 400 when endpoint is missing", async () => {
            const { req, res } = createMocks({
                userId: 1,
                body: {
                    keys: {
                        p256dh: "test-p256dh-key",
                        auth: "test-auth-key",
                    },
                },
            });

            await pushSubscriptionController.subscribe(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid push subscription",
            });

            expect(
                pushSubscriptionService.saveSubscription
            ).not.toHaveBeenCalled();
        });

        it("should return 400 when p256dh key is missing", async () => {
            const { req, res } = createMocks({
                userId: 1,
                body: {
                    endpoint: "https://push-service.example/subscription/123",
                    keys: {
                        auth: "test-auth-key",
                    },
                },
            });

            await pushSubscriptionController.subscribe(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid push subscription",
            });

            expect(
                pushSubscriptionService.saveSubscription
            ).not.toHaveBeenCalled();
        });

        it("should return 400 when auth key is missing", async () => {
            const { req, res } = createMocks({
                userId: 1,
                body: {
                    endpoint: "https://push-service.example/subscription/123",
                    keys: {
                        p256dh: "test-p256dh-key",
                    },
                },
            });

            await pushSubscriptionController.subscribe(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid push subscription",
            });

            expect(
                pushSubscriptionService.saveSubscription
            ).not.toHaveBeenCalled();
        });

        it("should return 500 when saving subscription fails", async () => {
            jest.mocked(pushSubscriptionService.saveSubscription)
                .mockRejectedValue(new Error("Database error"));

            const { req, res } = createMocks({
                userId: 1,
                body: {
                    endpoint: "https://push-service.example/subscription/123",
                    keys: {
                        p256dh: "test-p256dh-key",
                        auth: "test-auth-key",
                    },
                },
            });

            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => { });

            await pushSubscriptionController.subscribe(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unable to save push subscription",
            });

            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    // UNSUBSCRIBE
    describe("unsubscribe", () => {
        it("should remove push subscription successfully", async () => {
            jest.mocked(pushSubscriptionService.deleteSubscription)
                .mockResolvedValue(true as never);

            const endpoint =
                "https://push-service.example/subscription/123";

            const { req, res } = createMocks({
                userId: 1,
                body: { endpoint },
            });

            await pushSubscriptionController.unsubscribe(req, res);

            expect(
                pushSubscriptionService.deleteSubscription
            ).toHaveBeenCalledWith(1, endpoint);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Push subscription removed successfully",
            });
        });

        it("should return 400 when endpoint is missing", async () => {
            const { req, res } = createMocks({
                userId: 1,
                body: {},
            });

            await pushSubscriptionController.unsubscribe(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Endpoint is required",
            });

            expect(
                pushSubscriptionService.deleteSubscription
            ).not.toHaveBeenCalled();
        });

        it("should return 500 when removing subscription fails", async () => {
            jest.mocked(pushSubscriptionService.deleteSubscription)
                .mockRejectedValue(new Error("Database error"));

            const endpoint =
                "https://push-service.example/subscription/123";

            const { req, res } = createMocks({
                userId: 1,
                body: { endpoint },
            });

            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => { });

            await pushSubscriptionController.unsubscribe(req, res);

            expect(
                pushSubscriptionService.deleteSubscription
            ).toHaveBeenCalledWith(1, endpoint);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unable to remove push subscription",
            });

            expect(consoleSpy).toHaveBeenCalled();
        });
    });
});
