import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import notificationService from "../services/notificationService";
import pushNotificationService from "../services/pushNotificationService";
import authRepository from "../repositories/authRepository";
import emailService from "../services/emailService";

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

            // Get user details
            const user = await authRepository.findUserById(userId);

            if (!user) {
                throw new Error("User not found");
            }

            const email = user.getDataValue("email") as string;
            const name = user.getDataValue("name") as string;

            // Create database notification
            const notification = await notificationService.createNotification({
                userId,
                productId,
                type,
                title,
                message,
            });

            console.log(
                `Notification created: ${notification.getDataValue("id")}`
            );

            // Send push notification
            await pushNotificationService.sendPushNotification({
                userId,
                title,
                message,
                url: `/product/${productId}`,
            });

            console.log(
                `Push notification processed for user ${userId}`
            );

            // Send email notification
            await emailService.sendNotificationEmail(
                email,
                name,
                title,
                message,
                productId
            );

            console.log(
                `Email notification processed for user ${userId}`
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