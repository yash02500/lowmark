import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Worker, Job } from "bullmq";
import authRepository from "../repositories/authRepository";
import emailService from "../services/emailService";
import redisConnection from "../config/redis";

// Mock Redis worker so no real worker starts during testing
jest.mock("bullmq", () => ({
    Worker: jest.fn().mockImplementation(() => ({
        close: jest.fn(),
        on: jest.fn(),
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

// Mock auth repository
jest.mock("../repositories/authRepository", () => ({
    __esModule: true,
    default: {
        findUserById: jest.fn(),
    },
}));

// Mock email service
jest.mock("../services/emailService", () => ({
    __esModule: true,
    default: {
        sendNotificationEmail: jest.fn(),
    },
}));

// Import worker after mocks have been declared
import "./emailNotificationWorker";

interface EmailJobData {
    userId: number;
    productId: number;
    title: string;
    message: string;
}

type EmailProcessor = (
    job: Job<EmailJobData>
) => Promise<void>;

// Capture the processor passed to BullMQ Worker
const workerMock = Worker as unknown as jest.Mock;

const workerCall = workerMock.mock.calls[0];

const emailProcessor = workerCall?.[1] as EmailProcessor;

describe("emailNotificationWorker", () => {
    beforeEach(() => {
        jest.mocked(authRepository.findUserById).mockReset();
        jest.mocked(emailService.sendNotificationEmail).mockReset();
    });

    // WORKER INITIALIZATION
    describe("worker initialization", () => {
        it("should initialize email notification worker with correct configuration", () => {
            expect(workerCall).toBeDefined();
            expect(workerCall?.[0]).toBe("email-notification");
            expect(workerCall?.[2]).toEqual({
                connection: redisConnection,
                concurrency: 3,
            });
        });
    });

    // PROCESS EMAIL JOB
    describe("email job processing", () => {
        const jobData: EmailJobData = {
            userId: 1,
            productId: 12,
            title: "Price dropped!",
            message: "The product price has decreased to ₹1500.",
        };

        const user = {
            getDataValue: jest.fn((field: string) => {
                if (field === "email") return "test@example.com";
                if (field === "name") return "Test User";
                return undefined;
            }),
        };

        const createJob = (data: EmailJobData) => {
            return {
                data,
            } as Job<EmailJobData>;
        };

        it("should fetch user details and send notification email successfully", async () => {
            jest.mocked(authRepository.findUserById)
                .mockResolvedValue(user as never);

            jest.mocked(emailService.sendNotificationEmail)
                .mockResolvedValue(undefined as never);

            await emailProcessor(createJob(jobData));

            expect(authRepository.findUserById)
                .toHaveBeenCalledWith(1);

            expect(user.getDataValue)
                .toHaveBeenCalledWith("email");

            expect(user.getDataValue)
                .toHaveBeenCalledWith("name");

            expect(emailService.sendNotificationEmail)
                .toHaveBeenCalledWith(
                    "test@example.com",
                    "Test User",
                    "Price dropped!",
                    "The product price has decreased to ₹1500.",
                    12
                );
        });

        it("should throw an error when user does not exist", async () => {
            jest.mocked(authRepository.findUserById)
                .mockResolvedValue(null as never);

            await expect(
                emailProcessor(createJob(jobData))
            ).rejects.toThrow("User not found");

            expect(authRepository.findUserById)
                .toHaveBeenCalledWith(1);

            expect(emailService.sendNotificationEmail)
                .not.toHaveBeenCalled();
        });

        it("should throw an error when fetching user fails", async () => {
            jest.mocked(authRepository.findUserById)
                .mockRejectedValue(new Error("Database error"));

            await expect(
                emailProcessor(createJob(jobData))
            ).rejects.toThrow("Database error");

            expect(emailService.sendNotificationEmail)
                .not.toHaveBeenCalled();
        });

        it("should throw an error when sending notification email fails", async () => {
            jest.mocked(authRepository.findUserById)
                .mockResolvedValue(user as never);

            jest.mocked(emailService.sendNotificationEmail)
                .mockRejectedValue(new Error("Email delivery failed"));

            await expect(
                emailProcessor(createJob(jobData))
            ).rejects.toThrow("Email delivery failed");

            expect(authRepository.findUserById)
                .toHaveBeenCalledWith(1);

            expect(emailService.sendNotificationEmail)
                .toHaveBeenCalledTimes(1);
        });
    });
});
