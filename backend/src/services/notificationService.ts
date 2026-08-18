import notificationRepository from "../repositories/notificationRepository";
import notificationQueue from "../queues/notificationQueue";

const createNotification = async (notificationData: {
    userId: number;
    productId: number;
    type: string;
    title: string;
    message: string;
}) => {
    return await notificationRepository.createNotification(
        notificationData
    );
};

const getUserNotifications = async (userId: number) => {
    return await notificationRepository.findUserNotifications(
        userId
    );
};

const markNotificationAsRead = async (
    id: number,
    userId: number
) => {
    const notification =
        await notificationRepository.findNotificationById(
            id,
            userId
        );

    if (!notification) {
        throw new Error("Notification not found");
    }

    if (notification.getDataValue("isRead")) {
        return notification;
    }

    await notificationRepository.markAsRead(
        id,
        userId
    );

    return await notificationRepository.findNotificationById(
        id,
        userId
    );
};

const markAllNotificationsAsRead = async (
    userId: number
) => {
    await notificationRepository.markAllAsRead(
        userId
    );

    return {
        message: "All notifications marked as read",
    };
};

const deleteNotification = async (
    id: number,
    userId: number
) => {
    const notification =
        await notificationRepository.findNotificationById(
            id,
            userId
        );

    if (!notification) {
        throw new Error("Notification not found");
    }

    await notificationRepository.deleteNotification(
        id,
        userId
    );

    return {
        message: "Notification deleted successfully",
    };
};


const queueNotifications = async (data: {
    productId: number;
    previousPrice: number;
    currentPrice: number | null;
    priceDropped?: boolean;
    priceIncreased?: boolean;
    previousTrackingState: string;
    currentTrackingState: string;
    userProducts: any[];
    product: any;
}) => {
    const {
        productId,
        previousPrice,
        currentPrice,
        priceDropped,
        priceIncreased,
        previousTrackingState,
        currentTrackingState,
        userProducts,
        product,
    } = data;

    const title = product.getDataValue("title");

    for (const userProduct of userProducts) {
        const userId = userProduct.getDataValue("userId");
        const targetPrice = userProduct.getDataValue("targetPrice");

        // 1. Target price reached
        if (
            currentPrice !== null &&
            targetPrice !== null &&
            targetPrice !== undefined &&
            previousPrice > Number(targetPrice) &&
            currentPrice <= Number(targetPrice)
        ) {
            await notificationQueue.add(
                "target-price-reached",
                {
                    userId,
                    productId,
                    type: "target_price_reached",
                    title: "Target price reached",
                    message: `${title} has reached your target price of ₹${Number(targetPrice)}. Current price is ₹${currentPrice}.`,
                }
            );
        }

        // 2. Price dropped
        if (
            currentPrice !== null &&
            priceDropped
        ) {
            await notificationQueue.add(
                "price-drop",
                {
                    userId,
                    productId,
                    type: "price_drop",
                    title: "Price dropped",
                    message: `${title} price dropped from ₹${previousPrice} to ₹${currentPrice}.`,
                }
            );
        }

        // 3. Back in stock
        if (
            previousTrackingState === "out_of_stock" &&
            currentTrackingState === "in_stock"
        ) {
            await notificationQueue.add(
                "back-in-stock",
                {
                    userId,
                    productId,
                    type: "back_in_stock",
                    title: "Back in stock",
                    message: `${title} is back in stock.`,
                }
            );
        }

        // 4. Out of stock
        if (
            previousTrackingState === "in_stock" &&
            currentTrackingState === "out_of_stock"
        ) {
            await notificationQueue.add(
                "out-of-stock",
                {
                    userId,
                    productId,
                    type: "out_of_stock",
                    title: "Out of stock",
                    message: `${title} is currently out of stock.`,
                }
            );
        }

        // 5. Discontinued
        if (
            previousTrackingState !== "discontinued" &&
            currentTrackingState === "discontinued"
        ) {
            await notificationQueue.add(
                "discontinued",
                {
                    userId,
                    productId,
                    type: "discontinued",
                    title: "Product discontinued",
                    message: `${title} appears to be discontinued.`,
                }
            );
        }
    }
};

export default {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    queueNotifications,
};