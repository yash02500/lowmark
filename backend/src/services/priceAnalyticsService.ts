import priceHistoryRepository from "../repositories/priceHistoryRepository";
import productRepository from "../repositories/productRepository";

const getPriceAnalytics = async (productId: number) => {
    const product = await productRepository.findProductById(productId);

    if (!product) {
        throw new Error("Product not found");
    }

    const history = await priceHistoryRepository.findPriceHistoryByProductId(productId);

    const currentPrice = Number(product.getDataValue("currentPrice"));

    if (history.length === 0) {
        return {
            currentPrice,
            lowestPrice: currentPrice,
            highestPrice: currentPrice,
            averagePrice: currentPrice,
            previousPrice: null,
            priceChange: null,
            priceChangePercentage: null,
            sevenDayChangePercentage: null,
            thirtyDayChangePercentage: null,
            trend: "insufficient_data",
            priceChangeCount: 0,
        };
    }

    const prices = history.map((record) => Number(record.get("price")));
    const lowestPrice = Math.min(currentPrice,...prices);
    const highestPrice = Math.max(currentPrice,...prices);

    const averagePrice =
        [...prices, currentPrice].reduce(
            (sum, price) => sum + price,
            0
        ) / (prices.length + 1);

    const previousPrice = prices[0] ?? null;
    let priceChange: number | null = null;
    let priceChangePercentage: number | null = null;

    if (previousPrice !== null) {
        priceChange = currentPrice - previousPrice;

        if (previousPrice !== 0) {
            priceChangePercentage =
                (priceChange / previousPrice) * 100;
        }
    }

    const now = new Date();

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDayHistory = history.filter(
        (record) => {
            const recordedAt =
                record.get("recordedAt") as Date;

            return recordedAt >= sevenDaysAgo;
        }
    );

    const thirtyDayHistory = history.filter(
        (record) => {
            const recordedAt =
                record.get("recordedAt") as Date;

            return recordedAt >= thirtyDaysAgo;
        }
    );

    const oldestSevenDayPrice =
        sevenDayHistory.length > 0
            ? Number(
                  sevenDayHistory[
                      sevenDayHistory.length - 1
                  ].get("price")
              )
            : null;

    const oldestThirtyDayPrice =
        thirtyDayHistory.length > 0
            ? Number(
                  thirtyDayHistory[
                      thirtyDayHistory.length - 1
                  ].get("price")
              )
            : null;

    const sevenDayChangePercentage =
        oldestSevenDayPrice !== null &&
        oldestSevenDayPrice !== 0
            ? ((currentPrice - oldestSevenDayPrice) /
                  oldestSevenDayPrice) *
              100
            : null;

    const thirtyDayChangePercentage =
        oldestThirtyDayPrice !== null &&
        oldestThirtyDayPrice !== 0
            ? ((currentPrice - oldestThirtyDayPrice) /
                  oldestThirtyDayPrice) *
              100
            : null;

    let trend: "increasing" | "decreasing" | "stable" | "insufficient_data";

    if (history.length < 2) {
        trend = "insufficient_data";
    } else {
        const recentPrices = prices.slice(0, 3);

        const increasing =
            recentPrices.every(
                (price, index) =>
                    index === 0 ||
                    price >= recentPrices[index - 1]
            );

        const decreasing =
            recentPrices.every(
                (price, index) =>
                    index === 0 ||
                    price <= recentPrices[index - 1]
            );

        if (increasing && !decreasing) {
            trend = "increasing";
        } else if (decreasing && !increasing) {
            trend = "decreasing";
        } else {
            trend = "stable";
        }
    }

    return {
        currentPrice,
        lowestPrice,
        highestPrice,
        averagePrice: Number(
            averagePrice.toFixed(2)
        ),
        previousPrice,
        priceChange:
            priceChange !== null
                ? Number(priceChange.toFixed(2))
                : null,
        priceChangePercentage:
            priceChangePercentage !== null
                ? Number(
                      priceChangePercentage.toFixed(2)
                  )
                : null,
        sevenDayChangePercentage:
            sevenDayChangePercentage !== null
                ? Number(
                      sevenDayChangePercentage.toFixed(2)
                  )
                : null,
        thirtyDayChangePercentage:
            thirtyDayChangePercentage !== null
                ? Number(
                      thirtyDayChangePercentage.toFixed(2)
                  )
                : null,
        trend,
        priceChangeCount: history.length,
    };
};

export default {
    getPriceAnalytics,
};