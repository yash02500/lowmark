import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Worker, Job } from "bullmq";
import notificationService from "../services/notificationService";
import pushNotificationQueue from "../queues/pushNotificationQueue";
import emailNotificationQueue from "../queues/emailNotificationQueue";
import redisConnection from "../config/redis";

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
    },
}));

// Mock notification service
jest.mock("../services/notificationService", () => ({
    __esModule: true,
    default: {
        createNotification: jest.fn(),
    },
}));

// Mock push notification queue
jest.mock("../queues/pushNotificationQueue", () => ({
    __esModule: true,
    default: {
        add: jest.fn(),
    },
}));

// Mock email notification queue
jest.mock("../queues/emailNotificationQueue", () => ({
    __esModule: true,
    default: {
        add: jest.fn(),
    },
}));

// Import worker after mocks
import "./notificationWorker";

interface NotificationJobData {
    userId: number;
    productId: number;
    type: string;
    title: string;
    message: string;
}

type NotificationProcessor = (
    job: Job<NotificationJobData>
) => Promise<unknown>;

// Capture worker constructor arguments during module initialization
const workerMock = Worker as unknown as jest.Mock;
const workerCall = workerMock.mock.calls[0] as unknown[] | undefined;

const notificationProcessor =
    workerCall?.[1] as NotificationProcessor;

// Test data
const jobData: NotificationJobData = {
    userId: 1,
    productId: 12,
    type: "PRICE_DROP",
    title: "Price dropped!",
    message: "The product price has decreased to ₹1500.",
};

const notification = {
    id: 1,
    userId: 1,
    productId: 12,
    type: "PRICE_DROP",
    title: "Price dropped!",
    message: "The product price has decreased to ₹1500.",
    isRead: false,
};

const createJob = (data: NotificationJobData) => {
    return {
        data,
    } as Job<NotificationJobData>;
};

describe("notificationWorker", () => {
    beforeEach(() => {
        jest.mocked(notificationService.createNotification).mockReset();
        jest.mocked(pushNotificationQueue.add).mockReset();
        jest.mocked(emailNotificationQueue.add).mockReset();
    });

    // WORKER INITIALIZATION
    describe("worker initialization", () => {
        it("should initialize notification worker with correct configuration", () => {
            expect(workerCall).toBeDefined();

            expect(workerCall?.[0]).toBe("notification");

            expect(workerCall?.[2]).toEqual({
                connection: redisConnection,
                concurrency: 3,
            });

            expect(notificationProcessor).toBeDefined();
        });
    });

    // PROCESS NOTIFICATION JOB
    describe("notification job processing", () => {
        it("should create notification and enqueue push and email jobs successfully", async () => {
            jest.mocked(notificationService.createNotification)
                .mockResolvedValue(notification as never);

            jest.mocked(pushNotificationQueue.add)
                .mockResolvedValue({} as never);

            jest.mocked(emailNotificationQueue.add)
                .mockResolvedValue({} as never);

            const result = await notificationProcessor(
                createJob(jobData)
            );

            // Verify database notification creation
            expect(notificationService.createNotification)
                .toHaveBeenCalledWith({
                    userId: 1,
                    productId: 12,
                    type: "PRICE_DROP",
                    title: "Price dropped!",
                    message: "The product price has decreased to ₹1500.",
                });

            // Verify push job
            expect(pushNotificationQueue.add)
                .toHaveBeenCalledWith(
                    "send-push",
                    {
                        userId: 1,
                        productId: 12,
                        title: "Price dropped!",
                        message: "The product price has decreased to ₹1500.",
                    }
                );

            // Verify email job
            expect(emailNotificationQueue.add)
                .toHaveBeenCalledWith(
                    "send-email",
                    {
                        userId: 1,
                        productId: 12,
                        title: "Price dropped!",
                        message: "The product price has decreased to ₹1500.",
                    }
                );

            // Worker returns created notification
            expect(result).toBe(notification);
        });

        it("should throw an error when creating notification fails", async () => {
            jest.mocked(notificationService.createNotification)
                .mockRejectedValue(
                    new Error("Unable to create notification")
                );

            await expect(
                notificationProcessor(createJob(jobData))
            ).rejects.toThrow("Unable to create notification");

            expect(pushNotificationQueue.add)
                .not.toHaveBeenCalled();

            expect(emailNotificationQueue.add)
                .not.toHaveBeenCalled();
        });

        it("should throw an error when adding push notification job fails", async () => {
            jest.mocked(notificationService.createNotification)
                .mockResolvedValue(notification as never);

            jest.mocked(pushNotificationQueue.add)
                .mockRejectedValue(new Error("Push queue failed"));

            await expect(
                notificationProcessor(createJob(jobData))
            ).rejects.toThrow("Push queue failed");

            expect(notificationService.createNotification)
                .toHaveBeenCalledTimes(1);

            expect(pushNotificationQueue.add)
                .toHaveBeenCalledTimes(1);

            // Email job is not added because push queue failed first
            expect(emailNotificationQueue.add)
                .not.toHaveBeenCalled();
        });

        it("should throw an error when adding email notification job fails", async () => {
            jest.mocked(notificationService.createNotification)
                .mockResolvedValue(notification as never);

            jest.mocked(pushNotificationQueue.add)
                .mockResolvedValue({} as never);

            jest.mocked(emailNotificationQueue.add)
                .mockRejectedValue(new Error("Email queue failed"));

            await expect(
                notificationProcessor(createJob(jobData))
            ).rejects.toThrow("Email queue failed");

            expect(notificationService.createNotification)
                .toHaveBeenCalledTimes(1);

            expect(pushNotificationQueue.add)
                .toHaveBeenCalledTimes(1);

            expect(emailNotificationQueue.add)
                .toHaveBeenCalledTimes(1);
        });
    });
});
