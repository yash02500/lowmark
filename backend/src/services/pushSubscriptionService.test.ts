import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import pushSubscriptionRepository from "../repositories/pushSubscriptionRepository";
import pushSubscriptionService from "./pushSubscriptionService";

jest.mock("../repositories/pushSubscriptionRepository", () => ({
    __esModule: true,
    default: {
        findByEndpoint: jest.fn(),
        createSubscription: jest.fn(),
        findUserSubscriptions: jest.fn(),
        deleteByEndpoint: jest.fn(),
    },
}));

// Use this cast to configure and inspect the Jest mocks
const repo = pushSubscriptionRepository as any;

const subscription = {
    endpoint: "https://push.example.com/subscription/1",
    keys: {
        p256dh: "test-p256dh",
        auth: "test-auth",
    },
};

const makeExistingSubscription = (userId: number) => ({
    getDataValue: (key: string) => {
        if (key === "userId") return userId;
        return undefined;
    },
    update: jest.fn(async (_data: Record<string, unknown>) => undefined),
});

beforeEach(() => {
    jest.resetAllMocks();
});

describe("pushSubscriptionService.saveSubscription", () => {
    it("should create a new subscription when the endpoint does not exist", async () => {
        const createdSubscription = { id: 1 };

        repo.findByEndpoint.mockResolvedValue(null);
        repo.createSubscription.mockResolvedValue(createdSubscription);

        const result = await pushSubscriptionService.saveSubscription(
            7,
            subscription
        );

        expect(repo.findByEndpoint).toHaveBeenCalledWith(
            subscription.endpoint
        );

        expect(repo.createSubscription).toHaveBeenCalledWith({
            userId: 7,
            endpoint: subscription.endpoint,
            p256dh: "test-p256dh",
            auth: "test-auth",
        });

        expect(result).toBe(createdSubscription);
    });

    it("should return the existing subscription if it already belongs to the user", async () => {
        const existingSubscription = makeExistingSubscription(7);

        repo.findByEndpoint.mockResolvedValue(existingSubscription);

        const result = await pushSubscriptionService.saveSubscription(
            7,
            subscription
        );

        expect(result).toBe(existingSubscription);
        expect(existingSubscription.update).not.toHaveBeenCalled();
        expect(repo.createSubscription).not.toHaveBeenCalled();
    });

    it("should transfer an existing subscription to another user", async () => {
        const existingSubscription = makeExistingSubscription(3);

        repo.findByEndpoint.mockResolvedValue(existingSubscription);

        const result = await pushSubscriptionService.saveSubscription(
            7,
            subscription
        );

        expect(existingSubscription.update).toHaveBeenCalledWith({
            userId: 7,
            p256dh: "test-p256dh",
            auth: "test-auth",
        });

        expect(result).toBe(existingSubscription);
        expect(repo.createSubscription).not.toHaveBeenCalled();
    });
});

describe("pushSubscriptionService.getUserSubscriptions", () => {
    it("should return subscriptions belonging to the requested user", async () => {
        const subscriptions = [
            { id: 1, endpoint: subscription.endpoint },
        ];

        repo.findUserSubscriptions.mockResolvedValue(subscriptions);

        const result =
            await pushSubscriptionService.getUserSubscriptions(7);

        expect(repo.findUserSubscriptions).toHaveBeenCalledWith(7);
        expect(result).toBe(subscriptions);
    });

    it("should return an empty array when the user has no subscriptions", async () => {
        repo.findUserSubscriptions.mockResolvedValue([]);

        const result =
            await pushSubscriptionService.getUserSubscriptions(7);

        expect(result).toEqual([]);
    });
});

describe("pushSubscriptionService.deleteSubscription", () => {
    it("should delete the subscription using its endpoint and user ID", async () => {
        repo.deleteByEndpoint.mockResolvedValue(undefined);

        const result =
            await pushSubscriptionService.deleteSubscription(
                7,
                subscription.endpoint
            );

        expect(repo.deleteByEndpoint).toHaveBeenCalledWith(
            subscription.endpoint,
            7
        );

        expect(result).toBe(true);
    });

    it("should propagate a repository error", async () => {
        repo.deleteByEndpoint.mockRejectedValue(
            new Error("Database error")
        );

        await expect(
            pushSubscriptionService.deleteSubscription(
                7,
                subscription.endpoint
            )
        ).rejects.toThrow("Database error");
    });
});
