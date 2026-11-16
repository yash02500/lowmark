"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    BellRing,
    Check,
    CheckCheck,
    Trash2,
    ExternalLink,
    Package,
    TrendingDown,
    Target,
    AlertTriangle,
    Ban,
    LoaderCircle,
    Sparkles,
    BellOff,
} from "lucide-react";

import Sidebar from "@/src/components/sidebar";
import Navbar from "@/src/components/navbar";
import notificationService from "@/src/services/notificationService";
import { Notification } from "@/src/types/notification";
import pushNotificationService from "@/src/services/pushNotificationService";
import userProductService from "@/src/services/userProductService";

const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
        case "target_price_reached":
            return Target;
        case "price_drop":
            return TrendingDown;
        case "back_in_stock":
            return Package;
        case "out_of_stock":
            return AlertTriangle;
        case "discontinued":
            return Ban;
        default:
            return Bell;
    }
};

const getNotificationStyle = (type: Notification["type"]) => {
    switch (type) {
        case "target_price_reached":
            return "bg-emerald-50 text-emerald-700";
        case "price_drop":
            return "bg-blue-50 text-blue-700";
        case "back_in_stock":
            return "bg-teal-50 text-teal-700";
        case "out_of_stock":
            return "bg-amber-50 text-amber-700";
        case "discontinued":
            return "bg-red-50 text-red-700";
        default:
            return "bg-slate-100 text-slate-600";
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

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [processingId, setProcessingId] = useState<number | null>(null);

    const [pushLoading, setPushLoading] = useState(false);
    const [pushMessage, setPushMessage] = useState("");
    const [pushEnabled, setPushEnabled] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await notificationService.getNotifications();
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

    useEffect(() => {
        const checkPushSubscription = async () => {
            try {
                const subscription =
                    await pushNotificationService.getExistingSubscription();

                setPushEnabled(Boolean(subscription));
            } catch (error) {
                console.error(
                    "Failed to check push subscription:",
                    error
                );
            }
        };

        checkPushSubscription();
    }, []);

    const handleMarkAsRead = async (notification: Notification) => {
        if (notification.isRead) {
            return;
        }

        try {
            setProcessingId(notification.id);
            setError("");

            const response = await notificationService.markAsRead(
                notification.id
            );

            setNotifications((current) =>
                current.map((item) =>
                    item.id === notification.id ? response.data : item
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
            setError("");

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

    const handleDelete = async (notificationId: number) => {
        try {
            setProcessingId(notificationId);
            setError("");

            await notificationService.deleteNotification(notificationId);

            setNotifications((current) =>
                current.filter(
                    (notification) => notification.id !== notificationId
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
        try {
            setProcessingId(notification.id);
            setError("");

            // Fetch the current user's tracked products
            const response = await userProductService.getTrackedProducts();

            // Find the tracking record associated with this product
            const trackedProduct = response.data.find(
                (item) => item.productId === notification.productId
            );

            if (!trackedProduct) {
                setError(
                    "You are no longer tracking this product, or it could not be found."
                );
                return;
            }

            // Mark notification as read
            if (!notification.isRead) {
                const readResponse =
                    await notificationService.markAsRead(notification.id);

                setNotifications((current) =>
                    current.map((item) =>
                        item.id === notification.id
                            ? readResponse.data
                            : item
                    )
                );
            }

            // Navigate using UserProduct ID, not Product ID
            router.push(`/product/${trackedProduct.id}`);
        } catch (error: any) {
            if (error.response?.status === 401) {
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to open this tracked product."
            );
        } finally {
            setProcessingId(null);
        }
    };


    const handleEnablePushNotifications = async () => {
        try {
            setPushLoading(true);
            setPushMessage("");

            await pushNotificationService.subscribeToPush();

            setPushEnabled(true);
            setPushMessage("Push notifications enabled successfully.");
        } catch (error: any) {
            setPushMessage(
                error.message || "Unable to enable push notifications."
            );
        } finally {
            setPushLoading(false);
        }
    };

    const handleDisablePushNotifications = async () => {
        try {
            setPushLoading(true);
            setPushMessage("");

            await pushNotificationService.unsubscribeFromPush();

            setPushEnabled(false);
            setPushMessage("Push notifications disabled.");
        } catch (error: any) {
            setPushMessage(
                error.message || "Unable to disable push notifications."
            );
        } finally {
            setPushLoading(false);
        }
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    return (
        <div className="min-h-screen bg-[#f8faf9]">
            <Sidebar />

            <div className="md:ml-64">
                <Navbar />

                <main className="px-4 py-6 pb-28 md:px-8 md:py-9 md:pb-10">
                    <div className="mx-auto max-w-5xl">
                        {/* Page heading */}
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                    <Bell size={14} />
                                    Activity center
                                </div>

                                <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                                    Notifications
                                </h1>

                                <p className="mt-2 text-sm text-slate-500">
                                    Stay updated on price changes and your
                                    tracked products.
                                </p>
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    disabled={processingId === -1}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processingId === -1 ? (
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <CheckCheck size={17} />
                                    )}

                                    Mark all as read ({unreadCount})
                                </button>
                            )}
                        </div>

                        {/* Summary cards */}
                        <section className="mt-7 grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                    <BellRing size={21} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Total notifications
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-950">
                                        {notifications.length}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <Sparkles size={21} />
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-400">
                                        Unread notifications
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-950">
                                        {unreadCount}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Push notification settings */}
                        <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                                    {pushEnabled ? (
                                        <BellRing size={19} />
                                    ) : (
                                        <BellOff size={19} />
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Browser push notifications
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {pushEnabled
                                            ? "You're subscribed to receive browser notifications."
                                            : "Enable browser notifications to stay informed about price updates."}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    pushEnabled
                                        ? handleDisablePushNotifications
                                        : handleEnablePushNotifications
                                }
                                disabled={pushLoading}
                                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${pushEnabled
                                    ? "border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-100"
                                    : "bg-[#087f5b] text-white hover:bg-emerald-800"
                                    }`}
                            >
                                {pushLoading ? (
                                    <span className="flex items-center gap-2">
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Please wait...
                                    </span>
                                ) : pushEnabled ? (
                                    "Disable notifications"
                                ) : (
                                    "Enable notifications"
                                )}
                            </button>
                        </section>

                        {pushMessage && (
                            <p
                                role="status"
                                className="mt-3 text-sm text-slate-600"
                            >
                                {pushMessage}
                            </p>
                        )}

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        {/* Notification list heading */}
                        <div className="mt-9 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Recent activity
                                </h2>
                                <p className="mt-1 text-xs text-slate-400">
                                    Your latest product updates
                                </p>
                            </div>

                            {!loading && notifications.length > 0 && (
                                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
                                    {notifications.length} items
                                </span>
                            )}
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="mt-5 space-y-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                                    >
                                        <div className="flex gap-4">
                                            <div className="h-11 w-11 rounded-xl bg-slate-100" />
                                            <div className="flex-1 space-y-3">
                                                <div className="h-4 w-1/3 rounded bg-slate-100" />
                                                <div className="h-3 w-4/5 rounded bg-slate-100" />
                                                <div className="h-3 w-1/2 rounded bg-slate-100" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading &&
                            !error &&
                            notifications.length === 0 && (
                                <div className="mt-5 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <Bell size={30} />
                                    </div>

                                    <h2 className="mt-5 text-lg font-bold text-slate-900">
                                        You're all caught up!
                                    </h2>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                        There are no notifications right now.
                                        We'll show your product and price
                                        updates here.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => router.push("/products")}
                                        className="mt-6 rounded-xl bg-[#087f5b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                    >
                                        Track a product
                                    </button>
                                </div>
                            )}

                        {/* Notifications */}
                        {!loading && notifications.length > 0 && (
                            <div className="mt-5 space-y-3">
                                {notifications.map((notification) => {
                                    const Icon = getNotificationIcon(
                                        notification.type
                                    );

                                    const isProcessing =
                                        processingId === notification.id;

                                    return (
                                        <article
                                            key={notification.id}
                                            className={`rounded-2xl border bg-white p-5 transition-all duration-200 hover:shadow-md ${!notification.isRead
                                                ? "border-emerald-200 shadow-sm shadow-emerald-900/3"
                                                : "border-slate-200/80"
                                                }`}
                                        >
                                            <div className="flex gap-4">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getNotificationStyle(
                                                        notification.type
                                                    )}`}
                                                >
                                                    <Icon size={21} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="font-bold text-slate-900">
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </h3>

                                                                {!notification.isRead && (
                                                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>
                                                        </div>

                                                        <time className="shrink-0 text-xs text-slate-400">
                                                            {formatDate(
                                                                notification.createdAt
                                                            )}
                                                        </time>
                                                    </div>

                                                    <div className="mt-5 flex flex-wrap gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleNotificationClick(
                                                                    notification
                                                                )
                                                            }
                                                            disabled={isProcessing}
                                                            className="inline-flex items-center gap-2 rounded-lg bg-[#071b17] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-900 disabled:opacity-50"
                                                        >
                                                            View product
                                                            <ExternalLink
                                                                size={13}
                                                            />
                                                        </button>

                                                        {!notification.isRead && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleMarkAsRead(
                                                                        notification
                                                                    )
                                                                }
                                                                disabled={isProcessing}
                                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                                                            >
                                                                {isProcessing ? (
                                                                    <LoaderCircle
                                                                        size={13}
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Check
                                                                        size={13}
                                                                    />
                                                                )}
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
                                                            disabled={isProcessing}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                        >
                                                            <Trash2 size={13} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NotificationsPage;
