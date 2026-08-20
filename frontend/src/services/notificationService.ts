import api from "./api";
import { Notification } from "../types/notification";

const getNotifications = async () => {
    const response = await api.get<{
        success: boolean;
        message: string;
        data: Notification[];
    }>("/notifications");

    return response.data;
};

const markAsRead = async (id: number) => {
    const response = await api.patch<{
        success: boolean;
        message: string;
        data: Notification;
    }>(`/notifications/${id}/read`);

    return response.data;
};

const markAllAsRead = async () => {
    const response = await api.patch<{
        success: boolean;
        message: string;
    }>("/notifications/read-all");

    return response.data;
};

const deleteNotification = async (id: number) => {
    const response = await api.delete<{
        success: boolean;
        message: string;
    }>(`/notifications/${id}`);

    return response.data;
};

export default {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};