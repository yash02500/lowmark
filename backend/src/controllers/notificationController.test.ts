import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { Request, Response } from "express";
import notificationController from "./notificationController";
import notificationService from "../services/notificationService";

// Mock notification service
jest.mock("../services/notificationService", () => ({
    __esModule: true,
    default: {
        getUserNotifications: jest.fn(),
        markNotificationAsRead: jest.fn(),
        markAllNotificationsAsRead: jest.fn(),
        deleteNotification: jest.fn(),
    },
}));

// Create mock Express request and response
const createMocks = (
    options: {
        userId?: number;
        query?: Record<string, unknown>;
    } = {}
) => {
    const req = {
        userId: options.userId ?? 1,
        query: options.query ?? {},
    } as unknown as Request;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    return { req, res };
};

describe("notificationController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // GET NOTIFICATIONS
    describe("getNotifications", () => {
        it("should fetch user notifications successfully", async () => {
            const notifications = [
                {
                    id: 1,
                    userId: 1,
                    title: "Price dropped",
                    message: "Product price decreased",
                    isRead: false,
                },
            ];

            jest.mocked(notificationService.getUserNotifications)
                .mockResolvedValue(notifications as never);

            const { req, res } = createMocks({ userId: 1 });

            await notificationController.getNotifications(req, res);

            expect(
                notificationService.getUserNotifications
            ).toHaveBeenCalledWith(1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Notifications fetched successfully",
                data: notifications,
            });
        });

        it("should return 500 when fetching notifications fails", async () => {
            jest.mocked(notificationService.getUserNotifications)
                .mockRejectedValue(new Error("Database error"));

            const { req, res } = createMocks({ userId: 1 });

            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => { });

            await notificationController.getNotifications(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unable to fetch notifications",
            });

            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    // MARK AS READ
    describe("markAsRead", () => {
        it("should mark a notification as read successfully", async () => {
            const notification = {
                id: 12,
                userId: 1,
                isRead: true,
            };

            jest.mocked(notificationService.markNotificationAsRead)
                .mockResolvedValue(notification as never);

            const { req, res } = createMocks({
                userId: 1,
                query: { id: "12" },
            });

            await notificationController.markAsRead(req, res);

            expect(
                notificationService.markNotificationAsRead
            ).toHaveBeenCalledWith(12, 1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Notification marked as read",
                data: notification,
            });
        });

        it("should return 400 when notification ID is invalid", async () => {
            const { req, res } = createMocks({
                userId: 1,
                query: { id: "invalid" },
            });

            await notificationController.markAsRead(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(
                notificationService.markNotificationAsRead
            ).not.toHaveBeenCalled();
        });

        it("should return 404 when marking notification as read fails", async () => {
            jest.mocked(notificationService.markNotificationAsRead)
                .mockRejectedValue(new Error("Notification not found"));

            const { req, res } = createMocks({
                userId: 1,
                query: { id: "12" },
            });

            await notificationController.markAsRead(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Notification not found",
            });
        });
    });

    // MARK ALL AS READ
    describe("markAllAsRead", () => {
        it("should mark all notifications as read successfully", async () => {
            const result = {
                message: "All notifications marked as read",
            };

            jest.mocked(notificationService.markAllNotificationsAsRead)
                .mockResolvedValue(result as never);

            const { req, res } = createMocks({ userId: 1 });

            await notificationController.markAllAsRead(req, res);

            expect(
                notificationService.markAllNotificationsAsRead
            ).toHaveBeenCalledWith(1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: result.message,
            });
        });

        it("should return 500 when marking all notifications fails", async () => {
            jest.mocked(notificationService.markAllNotificationsAsRead)
                .mockRejectedValue(new Error("Database error"));

            const { req, res } = createMocks({ userId: 1 });

            const consoleSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => { });

            await notificationController.markAllAsRead(req, res);

            expect(res.status).toHaveBeenCalledWith(500);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Unable to mark notifications as read",
            });

            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    // DELETE NOTIFICATION
    describe("deleteNotification", () => {
        it("should delete a notification successfully", async () => {
            const result = {
                message: "Notification deleted successfully",
            };

            jest.mocked(notificationService.deleteNotification)
                .mockResolvedValue(result as never);

            const { req, res } = createMocks({
                userId: 1,
                query: { id: "12" },
            });

            await notificationController.deleteNotification(req, res);

            expect(
                notificationService.deleteNotification
            ).toHaveBeenCalledWith(12, 1);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: result.message,
            });
        });

        it("should return 400 when notification ID is invalid", async () => {
            const { req, res } = createMocks({
                userId: 1,
                query: { id: "abc" },
            });

            await notificationController.deleteNotification(req, res);

            expect(res.status).toHaveBeenCalledWith(400);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Validation failed",
                })
            );

            expect(
                notificationService.deleteNotification
            ).not.toHaveBeenCalled();
        });

        it("should return 404 when deletion fails", async () => {
            jest.mocked(notificationService.deleteNotification)
                .mockRejectedValue(new Error("Notification not found"));

            const { req, res } = createMocks({
                userId: 1,
                query: { id: "12" },
            });

            await notificationController.deleteNotification(req, res);

            expect(res.status).toHaveBeenCalledWith(404);

            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Notification not found",
            });
        });
    });
});
