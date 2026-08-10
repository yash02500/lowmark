import userProductRepository from "../repositories/userProductRepository";
import productRepository from "../repositories/productRepository";

const trackProduct = async (
    userId: number,
    productId: number,
    targetPrice?: number
) => {
    //Check whether product exists
    const product = await productRepository.findProductById(productId);

    if (!product) {
        throw new Error("Product not found");
    }

    //Check whether user is already tracking it
    const existingUserProduct =
        await userProductRepository.findUserProduct(
            userId,
            productId
        );

    if (existingUserProduct) {
        throw new Error("You are already tracking this product");
    }

    //Create tracking relationship
    const userProduct =
        await userProductRepository.createUserProduct({
            userId,
            productId,
            targetPrice,
            isActive: true,
        });

    return userProduct;
};

const getTrackedProducts = async (userId: number) => {
    return await userProductRepository.findUserProducts(userId);
};

const getTrackedProductById = async (
    id: number,
    userId: number
) => {
    const userProduct =
        await userProductRepository.findUserProductById(
            id,
            userId
        );

    if (!userProduct) {
        throw new Error("Tracked product not found");
    }

    return userProduct;
};

const untrackProduct = async (
    id: number,
    userId: number
) => {
    const userProduct =
        await userProductRepository.findUserProductById(
            id,
            userId
        );

    if (!userProduct) {
        throw new Error("Tracked product not found");
    }

    await userProductRepository.deleteUserProduct(
        id,
        userId
    );

    return true;
};

export default {
    trackProduct,
    getTrackedProducts,
    getTrackedProductById,
    untrackProduct,
};