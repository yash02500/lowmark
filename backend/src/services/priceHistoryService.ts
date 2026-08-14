import priceHistoryRepository from "../repositories/priceHistoryRepository";
import productRepository from "../repositories/productRepository";
import userProductRepository from "../repositories/userProductRepository";

const recordPrice = async (
    productId: number,
    price: number,
    recordedAt?: Date
) => {
    const product = await productRepository.findProductById(productId);

    if (!product) {
        throw new Error("Product not found");
    }

    const latestPrice = await priceHistoryRepository.findLatestPrice(productId);

    if (latestPrice) {
        const latestPriceValue = Number(latestPrice.get("price"));

        if (latestPriceValue === price) {
            return {
                recorded: false,
                priceHistory: latestPrice,
            }
        }
    }

    const priceHistory = await priceHistoryRepository.createPriceHistory({
        productId,
        price,
        recordedAt,
    });

    return {
        recorded: true,
        priceHistory,
    }
};

const getPriceHistory = async (productId: number, userId: number) => {
    const product = await productRepository.findProductById(productId);

    if (!product) {
        throw new Error("Product not found");
    }

    const userProduct = await userProductRepository.findUserProduct(
        userId,
        productId
    );

    if (!userProduct) {
        throw new Error("You are not tracking this product");
    }

    return await priceHistoryRepository.findPriceHistoryByProductId(
        productId
    );
};

const getLatestPrice = async (productId: number, userId: number) => {
    const product = await productRepository.findProductById(productId);

    if (!product) {
        throw new Error("Product not found");
    }

    const userProduct = await userProductRepository.findUserProduct(
        userId,
        productId
    );

    if (!userProduct) {
        throw new Error("You are not tracking this product");
    }

    return await priceHistoryRepository.findLatestPrice(productId);
};

const getRecentPriceChangeCount = async (productId: number, limit = 10) => {
    const history = await priceHistoryRepository.findRecentPriceHistory(
        productId,
        limit
    );

    let changeCount = 0;

    for (let i = 0; i < history.length - 1; i++) {
        const currentPrice = Number(
            history[i].get("price")
        );

        const previousPrice = Number(
            history[i + 1].get("price")
        );

        if (currentPrice !== previousPrice) {
            changeCount++;
        }
    }

    return changeCount;
};

const isStableForWeeks = async (productId: number, stableDays = 14) => {
    const history = await priceHistoryRepository.findPriceHistoryByProductId(productId);

    if (history.length < 2) {
        return false;
    }

    const latestPrice = Number(
        history[0].get("price")
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - stableDays);

    const recentHistory = history.filter((record) => {
        const recordedAt = record.get("recordedAt") as Date;
        return recordedAt >= cutoffDate;
    });

    if (recentHistory.length === 0) {
        return false;
    }

    return recentHistory.every((record) => {
        const price = Number(record.get("price"));
        return price === latestPrice;
    });
};

export default {
    recordPrice,
    getPriceHistory,
    getLatestPrice,
    getRecentPriceChangeCount,
    isStableForWeeks,
};