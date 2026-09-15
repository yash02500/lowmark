import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import pushNotificationService from "../services/pushNotificationService";

interface PushJobData {
    userId: number;
    productId: number;
    title: string;
    message: string;
}

const pushWorker =
    new Worker<PushJobData>(
        "push-notification",
        async (job: Job<PushJobData>) => {
            const {
                userId,
                productId,
                title,
                message,
            } = job.data;

            await pushNotificationService.sendPushNotification({
                userId,
                title,
                message,
                url: `/product/${productId}`,
            });
        },
        {
            connection: redisConnection,
            concurrency: 3,
        }
    );

console.log("Push notification worker started");