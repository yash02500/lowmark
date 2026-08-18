import Notification from "../models/notification";

const createNotification = async (notificationData: {
    userId: number;
    productId: number;
    type: string;
    title: string;
    message: string;
}) => {
    return await Notification.create(notificationData);
};

const findUserNotifications = async (userId: number) => {
    return await Notification.findAll({
        where: {
            userId,
        },
        order: [["createdAt", "DESC"]],
    });
};

const findNotificationById = async (id: number, userId: number) => {
    return await Notification.findOne({
        where: {
            id,
            userId,
        },
    });
};

const markAsRead = async (id: number, userId: number) => {
    return await Notification.update(
        {
            isRead: true,
        },
        {
            where: {
                id,
                userId,
            },
        }
    );
};

const markAllAsRead = async (userId: number) => {
    return await Notification.update(
        {
            isRead: true,
        },
        {
            where: {
                userId,
                isRead: false,
            },
        }
    );
};

const deleteNotification = async (id: number, userId: number) => {
    return await Notification.destroy({
        where: {
            id,
            userId,
        },
    });
};

export default {
    createNotification,
    findUserNotifications,
    findNotificationById,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};