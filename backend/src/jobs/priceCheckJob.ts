import cron from "node-cron";
import priceCheckService from "../services/priceCheckService";

const startPriceCheckJob = () => {
    cron.schedule("0 * * * *", async () => {
        console.log("Starting price check...");

        await priceCheckService.checkTrackedProductPrices();

        console.log("Price check completed");
    });
};

export default startPriceCheckJob;