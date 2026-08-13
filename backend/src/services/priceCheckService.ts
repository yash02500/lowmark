import userProductRepository from "../repositories/userProductRepository";
import productService from "./productService";

const checkTrackedProductPrices = async () => {
    const userProducts = await userProductRepository.findActiveUserProducts();

    for (const userProduct of userProducts) {
        const product = userProduct.dataValues.product;

        if (!product) {
            continue;
        }

        const productId = product.id;
        
        try {
            await productService.updateProductPrice(productId);
        } catch (error) {
            console.error(`Failed to update product ${productId}:`,error);
        }
    }
};

export default {
    checkTrackedProductPrices,
};