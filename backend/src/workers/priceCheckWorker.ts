import { Worker } from "bullmq";
import redisConnection from "../config/redis";
import productService from "../services/productService";

const priceCheckWorker = new Worker(
    "price-check",
    async (job) => {
        const { productId } = job.data;

        console.log(
            `Processing price check for product ${productId}`
        );

        await productService.updateProductPrice(productId);

        console.log(
            `Price check completed for product ${productId}`
        );
    },
    {
        connection: redisConnection,
        concurrency: 3,
    }
);

priceCheckWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

priceCheckWorker.on("failed", (job, error) => {
    console.error(
        `Job ${job?.id} failed:`,
        error.message
    );
});

const shutdown = async () => {
    console.log("Shutting down price check worker...");

    await priceCheckWorker.close();
    await redisConnection.quit();

    console.log("Price check worker shut down");

    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("Price check worker started");