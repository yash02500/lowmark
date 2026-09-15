import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import notificationService from "../services/notificationService";
import pushNotificationQueue from "../queues/pushNotificationQueue";
import emailNotificationQueue from "../queues/emailNotificationQueue";

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

            const notification =
                await notificationService.createNotification({
                    userId,
                    productId,
                    type,
                    title,
                    message,
                });

            await pushNotificationQueue.add(
                "send-push",
                {
                    userId,
                    productId,
                    title,
                    message,
                }
            );

            await emailNotificationQueue.add(
                "send-email",
                {
                    userId,
                    productId,
                    title,
                    message,
                }
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