import productRepository from "../repositories/productRepository";
import priceCheckQueue from "../queues/priceCheckQueue";

const processDueProducts = async () => {
    const products = await productRepository.findProductsDueForCheck();

    console.log(`Found ${products.length} products due for check`);

    for (const product of products) {
        const productId = product.getDataValue("id");
        const priority = product.getDataValue("priority") || 10;

        try {
            const jobId = `product-${productId}`;

            const existingJob =
                await priceCheckQueue.getJob(jobId);

            if (existingJob) {
                const state = await existingJob.getState();

                if (
                    state === "waiting" ||
                    state === "active" ||
                    state === "delayed"
                ) {
                    console.log(
                        `Product ${productId} already has a ${state} job`
                    );

                    continue;
                }
            }

            await priceCheckQueue.add(
                "check-product",
                {
                    productId,
                },
                {
                    jobId,
                    priority,
                }
            );

            console.log(
                `Queued product ${productId} with priority ${priority}`
            );
        } catch (error) {
            console.error(
                `Failed to queue product ${productId}:`,
                error
            );
        }
    }
};

export default {
    processDueProducts,
};