import userProductRepository from "../repositories/userProductRepository";
import priceAnalyticsService from "./priceAnalyticsService";
import aiService from "./aiService";

const getUserProductsInsight = async (userId: number) => {
    const userProducts = await userProductRepository.findUserProducts(userId);

    if (userProducts.length === 0) {
        return {
            trackedProductCount: 0,
            summary: "You are not tracking any products yet.",
        };
    }

    const productInsights = [];

    for (const userProduct of userProducts) {
        const product = userProduct.get("product") as any;

        if (!product) {
            console.warn(`Skipping tracked product ${userProduct.getDataValue("productId")} because the product no longer exists.`);
            continue;
        }

        const productId = product.getDataValue("id");
        const analytics = await priceAnalyticsService.getPriceAnalytics(productId);
        const targetPriceValue = userProduct.get("targetPrice");
        const targetPrice = targetPriceValue !== null ? Number(targetPriceValue) : null;
        const availability = product.getDataValue("trackingState") || "unknown";
        let targetStatus: "reached" | "close" | "not_set" | "above_target";

        if (targetPrice === null) {
            targetStatus = "not_set";
        } else if (
            analytics.currentPrice <= targetPrice
        ) {
            targetStatus = "reached";
        } else {
            const difference = analytics.currentPrice - targetPrice;
            const percentageAboveTarget = (difference / targetPrice) * 100;
            targetStatus = percentageAboveTarget <= 10 ? "close" : "above_target";
        }

        productInsights.push({
            productId,
            title: product.getDataValue("title"),
            currentPrice: analytics.currentPrice,
            lowestPrice: analytics.lowestPrice,
            highestPrice: analytics.highestPrice,
            averagePrice: analytics.averagePrice,
            priceChange: analytics.priceChange,
            priceChangePercentage: analytics.priceChangePercentage,
            sevenDayChangePercentage: analytics.sevenDayChangePercentage,
            thirtyDayChangePercentage: analytics.thirtyDayChangePercentage,
            trend: analytics.trend,
            priceChangeCount: analytics.priceChangeCount,
            availability,
            targetPrice,
            targetStatus,
        });
    }

    const summary = await aiService.generateTrackedProductsInsight(productInsights);

    return {
        trackedProductCount: productInsights.length,
        products: productInsights,
        summary,
    };
};

const getUserProductInsightById = async (userProductId: number, userId: number) => {
    const userProduct = await userProductRepository.findUserProductById(userProductId, userId);

    if (!userProduct) {
        throw new Error("Tracked product not found");
    }

    const product = userProduct.get("product") as any;

    if (!product) {
        throw new Error(
            "The product associated with this tracking record no longer exists"
        );
    }

    const productId = product.getDataValue("id");

    const analytics = await priceAnalyticsService.getPriceAnalytics(productId);

    const summary = await aiService.generateProductInsight(analytics);

    return {
        productId,
        title: product.getDataValue("title"),
        currentPrice: analytics.currentPrice,
        summary,
    };
};

const getUserProductAttention = async (userId: number) => {
    const userProducts = await userProductRepository.findUserProducts(userId);

    if (userProducts.length === 0) {
        return {
            productCount: 0,
            attentionItems: [],
            summary: "You are not tracking any products yet.",
        };
    }

    const attentionItems = [];

    for (const userProduct of userProducts) {
        const product = userProduct.get("product") as any;

        if (!product) {
            console.warn(`Skipping tracked product ${userProduct.getDataValue("productId")} because the product no longer exists.`);
            continue;
        }

        const productId = product.getDataValue("id");
        const analytics = await priceAnalyticsService.getPriceAnalytics(productId);
        const targetPriceValue = userProduct.get("targetPrice");
        const targetPrice = targetPriceValue !== null ? Number(targetPriceValue) : null;

        /*
         * 1. Historical low
         */
        if (
            analytics.currentPrice ===
            analytics.lowestPrice
        ) {
            attentionItems.push({
                productId,
                title: product.getDataValue("title"),
                type: "historical_low",
                priority: "high",
                message: "Current price is at the historical low.",
                currentPrice: analytics.currentPrice,
                lowestPrice: analytics.lowestPrice,
            });
        }

        /*
         * 2. Target price reached
         */
        if (
            targetPrice !== null &&
            analytics.currentPrice <= targetPrice
        ) {
            attentionItems.push({
                productId,
                title: product.getDataValue("title"),
                type: "target_reached",
                priority: "high",
                message: "Current price has reached the target price.",
                currentPrice: analytics.currentPrice,
                targetPrice,
            });
        }

        /*
         * 3. Target price close
         */
        if (
            targetPrice !== null &&
            analytics.currentPrice > targetPrice
        ) {
            const percentageAboveTarget = ((analytics.currentPrice - targetPrice) / targetPrice) * 100;

            if (percentageAboveTarget <= 10) {
                attentionItems.push({
                    productId,
                    title: product.getDataValue("title"),
                    type: "target_close",
                    priority: "medium",
                    message: "Current price is within 10% of the target price.",
                    currentPrice: analytics.currentPrice,
                    targetPrice,
                    percentageAboveTarget: Number(percentageAboveTarget.toFixed(2)),
                });
            }
        }

        /*
         * 4. Significant price drop
         */
        if (
            analytics.priceChangePercentage !== null &&
            analytics.priceChangePercentage <= -10
        ) {
            attentionItems.push({
                productId,
                title: product.getDataValue("title"),
                type: "significant_drop",
                priority: "high",
                message: "Price dropped by at least 10%.",
                currentPrice: analytics.currentPrice,
                priceChangePercentage: analytics.priceChangePercentage,
            });
        }

        /*
         * 5. Significant price increase
         */
        if (
            analytics.priceChangePercentage !== null &&
            analytics.priceChangePercentage >= 10
        ) {
            attentionItems.push({
                productId,
                title: product.getDataValue("title"),
                type: "significant_increase",
                priority: "medium",
                message:
                    "Price increased by at least 10%.",
                currentPrice:
                    analytics.currentPrice,
                priceChangePercentage:
                    analytics.priceChangePercentage,
            });
        }
    }

    const summary =
        await aiService.generateAttentionSummary(
            attentionItems
        );

    return {
        productCount: userProducts.length,
        attentionItems,
        summary,
    };
};

export default {
    getUserProductsInsight,
    getUserProductAttention,
    getUserProductInsightById,
};