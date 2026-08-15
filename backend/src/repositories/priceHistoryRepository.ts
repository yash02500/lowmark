import PriceHistory from "../models/priceHistory";

const createPriceHistory = async (priceHistoryData: {
    productId: number;
    price: number;
    recordedAt?: Date;
}) => {
    return await PriceHistory.create(priceHistoryData);
};

const findPriceHistoryByProductId = async (productId: number) => {
    return await PriceHistory.findAll({
        where: {
            productId,
        },
        order: [["recordedAt", "DESC"]],
    });
};

const findLatestPrice = async (productId: number) => {
    return await PriceHistory.findOne({
        where: {
            productId,
        },
        order: [["recordedAt", "DESC"]],
    });
};

const findRecentPriceHistory = async (
    productId: number,
    limit: number
) => {
    return await PriceHistory.findAll({
        where: {
            productId,
        },
        order: [["recordedAt", "DESC"]],
        limit,
    });
};

export default {
    createPriceHistory,
    findPriceHistoryByProductId,
    findLatestPrice,
    findRecentPriceHistory,
};