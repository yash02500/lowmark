import productRepository from "../repositories/productRepository";
import detectPlatform from "../scrapers/platformDetector";
import scraperService from "./scraperService";

const createProduct = async (productData: {url: string;}) => {

    const { url } = productData;
    const existingProduct = await productRepository.findProductByUrl(url);

    if(existingProduct) {
        throw new Error("Product already exist");
    }

    const scrapedData = await scraperService.scrapeProduct(url);

    const product = await productRepository.createProduct({
        url,
        title: scrapedData.title,
        imageUrl: scrapedData.imageUrl,
        currentPrice: scrapedData.price,
        currency: scrapedData.currency,
        platform: detectPlatform(url),
    });

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