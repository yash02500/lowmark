"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/src/components/sidebar";
import Navbar from "@/src/components/navbar";
import notificationService from "@/src/services/notificationService";
import { Notification } from "@/src/types/notification";

const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
        case "target_price_reached":
            return "🎯";

        case "price_drop":
            return "📉";

        case "back_in_stock":
            return "📦";

        case "out_of_stock":
            return "⚠️";

        case "discontinued":
            return "🚫";

        default:
            return "🔔";
    }
};

const getNotificationStyle = (
    type: Notification["type"]
) => {
    switch (type) {
        case "target_price_reached":
            return "bg-green-50 text-green-600";

        case "price_drop":
            return "bg-blue-50 text-blue-600";

        case "back_in_stock":
            return "bg-emerald-50 text-emerald-600";

        case "out_of_stock":
            return "bg-orange-50 text-orange-600";

        case "discontinued":
            return "bg-red-50 text-red-600";

        default:
            return "bg-gray-50 text-gray-600";
    }
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const NotificationsPage = () => {
    const router = useRouter();

    const [notifications, setNotifications] =
        useState<Notification[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingId, setProcessingId] =
        useState<number | null>(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await notificationService.getNotifications();

            setNotifications(response.data);
        } catch (error: any) {
            if (error.response?.status === 401) {
                return;
            }

            setError(
                error.response?.data?.message ||
                "Failed to fetch notifications"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (
        notification: Notification
    ) => {
        if (notification.isRead) {
            return;
        }

        try {
            setProcessingId(notification.id);

            const response =
                await notificationService.markAsRead(
                    notification.id
                );

            setNotifications((current) =>
                current.map((item) =>
                    item.id === notification.id
                        ? response.data
                        : item
                )
            );
        } catch (error: any) {
            if (error.response?.status === 401) {
                return;
            }

            setError(
                error.response?.data?.message ||
                "Failed to mark notification as read"
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setProcessingId(-1);

            await notificationService.markAllAsRead();

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    isRead: true,
                }))
            );
        } catch (error: any) {
            if (error.response?.status === 401) {
                return;
            }

            setError(
                error.response?.data?.message ||
                "Failed to mark notifications as read"
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (
        notificationId: number
    ) => {
        try {
            setProcessingId(notificationId);

            await notificationService.deleteNotification(
                notificationId
            );

            setNotifications((current) =>
                current.filter(
                    (notification) =>
                        notification.id !== notificationId
                )
            );
        } catch (error: any) {
            if (error.response?.status === 401) {
                return;
            }

            setError(
                error.response?.data?.message ||
                "Failed to delete notification"
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleNotificationClick = async (
        notification: Notification
    ) => {
        await handleMarkAsRead(notification);

        router.push(
            `/product/${notification.productId}`
        );
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <div className="md:ml-60">
                <Navbar />

                <main className="p-4 pb-24 md:p-8 md:pb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Notifications
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Stay updated on your tracked
                                products.
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                disabled={processingId === -1}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processingId === -1
                                    ? "Marking..."
                                    : `Mark all as read (${unreadCount})`}
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {loading && (
                        <div className="mt-8 rounded-xl border bg-white p-8 text-center">
                            <p className="text-gray-500">
                                Loading notifications...
                            </p>
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        notifications.length === 0 && (
                            <div className="mt-8 rounded-xl border bg-white p-10 text-center">
                                <div className="text-4xl">
                                    🔔
                                </div>

                                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                                    No notifications
                                </h2>

                                <p className="mt-2 text-sm text-gray-500">
                                    You'll see price and product
                                    updates here.
                                </p>
                            </div>
                        )}

                    {!loading &&
                        notifications.length > 0 && (
                            <div className="mt-8 space-y-3">
                                {notifications.map(
                                    (notification) => (
                                        <div
                                            key={
                                                notification.id
                                            }
                                            className={`rounded-xl border bg-white p-4 shadow-sm transition ${
                                                !notification.isRead
                                                    ? "border-blue-200"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            <div className="flex gap-4">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${getNotificationStyle(
                                                        notification.type
                                                    )}`}
                                                >
                                                    {getNotificationIcon(
                                                        notification.type
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h2 className="font-semibold text-gray-900">
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </h2>

                                                                {!notification.isRead && (
                                                                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                                                                )}
                                                            </div>

                                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>
                                                        </div>

                                                        <span className="shrink-0 text-xs text-gray-400">
                                                            {formatDate(
                                                                notification.createdAt
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleNotificationClick(
                                                                    notification
                                                                )
                                                            }
                                                            disabled={
                                                                processingId ===
                                                                notification.id
                                                            }
                                                            className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            View Product
                                                        </button>

                                                        {!notification.isRead && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleMarkAsRead(
                                                                        notification
                                                                    )
                                                                }
                                                                disabled={
                                                                    processingId ===
                                                                    notification.id
                                                                }
                                                                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                Mark as read
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    notification.id
                                                                )
                                                            }
                                                            disabled={
                                                                processingId ===
                                                                notification.id
                                                            }
                                                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                </main>
            </div>
        </div>
    );
};

export default NotificationsPage;