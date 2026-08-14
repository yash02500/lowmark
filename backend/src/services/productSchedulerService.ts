import productRepository from "../repositories/productRepository";
import productService from "./productService";

const processDueProducts = async () => {
    const products = await productRepository.findProductsDueForCheck();

    console.log(`Found ${products.length} products due for check`);

    for (const product of products) {
        const productId = product.getDataValue("id");

        try {
            console.log(`Checking product ${productId}`);
            await productService.updateProductPrice(productId);
        } catch (error) {
            console.error(
                `Failed to check product ${productId}:`,
                error
            );
        }
    }
};

export default {
    processDueProducts,
};