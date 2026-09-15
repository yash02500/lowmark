import { Queue } from "bullmq";
import redisConnection from "../config/redis";

const pushNotificationQueue = new Queue("push-notification", {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export default pushNotificationQueue;