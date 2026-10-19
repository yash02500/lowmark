import { describe, it, expect, beforeEach, afterEach, afterAll, jest } from "@jest/globals";
import webpush from "web-push";
import pushSubscriptionRepository from "../repositories/pushSubscriptionRepository";

// Save existing environment variables
const originalVapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const originalVapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const originalVapidSubject = process.env.VAPID_SUBJECT;

// Provide test-only VAPID values before importing the service
process.env.VAPID_PUBLIC_KEY = "test-public-key";
process.env.VAPID_PRIVATE_KEY = "test-private-key";
process.env.VAPID_SUBJECT = "mailto:test@example.com";

jest.mock("web-push", () => ({
    __esModule: true,
    default: {
        setVapidDetails: jest.fn(),
        sendNotification: jest.fn(),
    },
}));

jest.mock("../repositories/pushSubscriptionRepository", () => ({
    __esModule: true,
    default: {
        findUserSubscriptions: jest.fn(),
        deleteByEndpoint: jest.fn(),
    },
}));

// Import the service after configuring the VAPID environment
const pushNotificationService =
    require("./pushNotificationService").default;

const webpushMock = webpush as any;
const repositoryMock = pushSubscriptionRepository as any;

const sendNotificationMock = webpushMock.sendNotification as jest.Mock;

const makeSubscription = (
    endpoint: string,
    p256dh = "test-p256dh",
    auth = "test-auth"
) => ({
    getDataValue: (key: string) => {
        const values: Record<string, string> = {
            endpoint,
            p256dh,
            auth,
        };

        return values[key];
    },
});

const notificationData = {
    userId: 7,
    title: "Price dropped",
    message: "Your product price dropped to ₹4,500.",
    url: "/product/123",
};

beforeEach(() => {
    jest.clearAllMocks();

    // Keep test output clean when the service logs delivery results
    jest.spyOn(console, "log").mockImplementation(() => { });
    jest.spyOn(console, "error").mockImplementation(() => { });
});

afterEach(() => {
    jest.restoreAllMocks();
});

afterAll(() => {
    // Restore the original environment values.
    if (originalVapidPublicKey === undefined) {
        delete process.env.VAPID_PUBLIC_KEY;
    } else {
        process.env.VAPID_PUBLIC_KEY = originalVapidPublicKey;
    }

    if (originalVapidPrivateKey === undefined) {
        delete process.env.VAPID_PRIVATE_KEY;
    } else {
        process.env.VAPID_PRIVATE_KEY = originalVapidPrivateKey;
    }

    if (originalVapidSubject === undefined) {
        delete process.env.VAPID_SUBJECT;
    } else {
        process.env.VAPID_SUBJECT = originalVapidSubject;
    }
});

describe("pushNotificationService.sendPushNotification", () => {
    it("should send a push notification to the user's subscription", async () => {
        const subscription = makeSubscription(
            "https://push.example.com/subscription/1"
        );

        repositoryMock.findUserSubscriptions.mockResolvedValue([
            subscription,
        ]);

        await pushNotificationService.sendPushNotification(
            notificationData
        );

        expect(
            repositoryMock.findUserSubscriptions
        ).toHaveBeenCalledWith(7);

        expect(sendNotificationMock).toHaveBeenCalledTimes(1);

        expect(sendNotificationMock).toHaveBeenCalledWith(
            {
                endpoint: "https://push.example.com/subscription/1",
                keys: {
                    p256dh: "test-p256dh",
                    auth: "test-auth",
                },
            },
            JSON.stringify({
                title: "Price dropped",
                message: "Your product price dropped to ₹4,500.",
                url: "/product/123",
            })
        );
    });

    it("should not send anything when the user has no subscriptions", async () => {
        repositoryMock.findUserSubscriptions.mockResolvedValue([]);

        await pushNotificationService.sendPushNotification(
            notificationData
        );

        expect(sendNotificationMock).not.toHaveBeenCalled();

        expect(
            repositoryMock.deleteByEndpoint
        ).not.toHaveBeenCalled();
    });

    it("should send notifications to all user subscriptions", async () => {
        const subscriptions = [
            makeSubscription("https://push.example.com/subscription/1"),
            makeSubscription(
                "https://push.example.com/subscription/2",
                "different-p256dh",
                "different-auth"
            ),
        ];

        repositoryMock.findUserSubscriptions.mockResolvedValue(
            subscriptions
        );

        await pushNotificationService.sendPushNotification(
            notificationData
        );

        expect(sendNotificationMock).toHaveBeenCalledTimes(2);
    });

    it("should delete a subscription when the push service returns 404", async () => {
        const endpoint =
            "https://push.example.com/expired-subscription";

        repositoryMock.findUserSubscriptions.mockResolvedValue([
            makeSubscription(endpoint),
        ]);

        sendNotificationMock.mockImplementationOnce(() =>
            Promise.reject({
                statusCode: 404,
                message: "Subscription not found",
            })
        );

        await expect(
            pushNotificationService.sendPushNotification(
                notificationData
            )
        ).resolves.toBeUndefined();

        expect(
            repositoryMock.deleteByEndpoint
        ).toHaveBeenCalledWith(endpoint, 7);
    });

    it("should delete a subscription when the push service returns 410", async () => {
        const endpoint =
            "https://push.example.com/gone-subscription";

        repositoryMock.findUserSubscriptions.mockResolvedValue([
            makeSubscription(endpoint),
        ]);

        sendNotificationMock.mockImplementationOnce(() =>
            Promise.reject({
                statusCode: 410,
                message: "Subscription is gone",
            })
        );

        await expect(
            pushNotificationService.sendPushNotification(
                notificationData
            )
        ).resolves.toBeUndefined();

        expect(
            repositoryMock.deleteByEndpoint
        ).toHaveBeenCalledWith(endpoint, 7);
    });

    it("should retain the subscription when delivery fails with a temporary error", async () => {
        const endpoint =
            "https://push.example.com/temporary-error";

        repositoryMock.findUserSubscriptions.mockResolvedValue([
            makeSubscription(endpoint),
        ]);

        sendNotificationMock.mockImplementationOnce(() =>
            Promise.reject({
                statusCode: 500,
                message: "Internal server error",
            })
        );

        await expect(
            pushNotificationService.sendPushNotification(
                notificationData
            )
        ).resolves.toBeUndefined();

        expect(
            repositoryMock.deleteByEndpoint
        ).not.toHaveBeenCalled();
    });

    it("should continue sending to other subscriptions if one delivery fails", async () => {
        repositoryMock.findUserSubscriptions.mockResolvedValue([
            makeSubscription("https://push.example.com/subscription/1"),
            makeSubscription("https://push.example.com/subscription/2"),
        ]);

        sendNotificationMock.mockImplementationOnce(() =>
            Promise.reject({
                statusCode: 500,
                message: "Internal server error",
            })
        );

        await pushNotificationService.sendPushNotification(
            notificationData
        );

        expect(sendNotificationMock).toHaveBeenCalledTimes(2);
    });
});
