import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import notificationService from "../services/notificationService";
import pushNotificationService from "../services/pushNotificationService";

interface NotificationJobData {
    userId: number;
    productId: number;
    type: string;
    title: string;
    message: string;
}

const notificationWorker =
    new Worker<NotificationJobData>(
        "notification",
        async (job: Job<NotificationJobData>) => {
            const {
                userId,
                productId,
                type,
                title,
                message,
            } = job.data;

            console.log(
                `Processing notification for user ${userId}, product ${productId}`
            );

            const notification =
                await notificationService.createNotification({
                    userId,
                    productId,
                    type,
                    title,
                    message,
                });

            console.log(
                `Notification created: ${notification.getDataValue("id")}`
            );

            await pushNotificationService.sendPushNotification({
                userId,
                title,
                message,
                url: `/product/${productId}`,
            });

            console.log(
                `Push notification processed for user ${userId}`
            );

            return notification;
        },
        {
            connection: redisConnection,
            concurrency: 3,
        }
    );

notificationWorker.on("completed", (job) => {
    console.log(
        `Notification job ${job.id} completed`
    );
});

notificationWorker.on("failed", (job, error) => {
    console.error(
        `Notification job ${job?.id} failed:`,
        error
    );
});

console.log("Notification worker started");