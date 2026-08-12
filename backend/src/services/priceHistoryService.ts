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

export default {
    recordPrice,
    getPriceHistory,
    getLatestPrice,
};