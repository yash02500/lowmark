import { Request, Response } from "express";
import notificationService from "../services/notificationService";

const getNotifications = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.userId!;

        const notifications =
            await notificationService.getUserNotifications(
                userId
            );

        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: notifications,
        });
    } catch (error: any) {
        console.error(
            "Get notifications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch notifications",
        });
    }
};


const markAsRead = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.userId!;

        const id = Number(req.params.id);

        const notification =
            await notificationService.markNotificationAsRead(
                id,
                userId
            );

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};


const markAllAsRead = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.userId!;

        const result =
            await notificationService.markAllNotificationsAsRead(
                userId
            );

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        console.error(
            "Mark all notifications as read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to mark notifications as read",
        });
    }
};


const deleteNotification = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.userId!;

        const id = Number(req.params.id);

        const result =
            await notificationService.deleteNotification(
                id,
                userId
            );

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};


export default {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};