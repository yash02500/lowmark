import productRepository from "../repositories/productRepository";

const createProduct = async (productData: {
    url: string;
    title: string;
    imageUrl?: string;
    currentPrice: number;
    platform: string;
    currency?: string;
}) => {
    const product = await productRepository.createProduct(productData);
    return product;
};

const getProductById = async (id: number) => {
    const product = await productRepository.findProductById(id);

    if (!product) {
        throw new Error("Product not found");
    }

    return product;
};

const getAllProducts = async () => {
    return await productRepository.findAllProducts();
};

const deleteProduct = async (id: number) => {
    const deletedRows = await productRepository.deleteProduct(id);

    if (deletedRows === 0) {
        throw new Error("Product not found");
    }

    return true;
};

export default {
    createProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
};