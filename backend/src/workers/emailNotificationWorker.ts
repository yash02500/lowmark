import { Worker, Job } from "bullmq";
import redisConnection from "../config/redis";
import authRepository from "../repositories/authRepository";
import emailService from "../services/emailService";

interface EmailJobData {
    userId: number;
    productId: number;
    title: string;
    message: string;
}

const emailWorker =
    new Worker<EmailJobData>(
        "email-notification",
        async (job: Job<EmailJobData>) => {
            const {
                userId,
                productId,
                title,
                message,
            } = job.data;

            const user =
                await authRepository.findUserById(userId);

            if (!user) {
                throw new Error("User not found");
            }

            const email =
                user.getDataValue("email") as string;

            const name =
                user.getDataValue("name") as string;

            await emailService.sendNotificationEmail(
                email,
                name,
                title,
                message,
                productId
            );
        },
        {
            connection: redisConnection,
            concurrency: 3,
        }
    );

console.log("Email notification worker started");