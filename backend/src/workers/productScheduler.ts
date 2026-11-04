import productSchedulerService from "../services/productSchedulerService";

// 1 minute interval
const POLL_INTERVAL_MS = 60 * 1000;
let isRunning = false;

const runScheduler = async () => {
    if(isRunning) {
        console.log("Previous scheduler execution is still running. Skipping.");
        return;
    }

    isRunning = true;

    try {
        console.log("Running product scheduler...");
        await productSchedulerService.processDueProducts();
    } catch (error) {
        console.error("Product scheduler failed:", error);
    } finally {
        isRunning = false;
    }
};

void runScheduler();

setInterval(() => {
    void runScheduler();
}, POLL_INTERVAL_MS);