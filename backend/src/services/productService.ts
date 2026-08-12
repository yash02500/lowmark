import productRepository from "../repositories/productRepository";
import scraperService from "./scraperService";
import normalizeProductUrl from "../utils/normalizeProductUrl";
import priceHistoryService from "./priceHistoryService";

const createProduct = async (productData: { url: string; }) => {

    const { url } = productData;
    const normalizedUrl = normalizeProductUrl(url);
    const existingProduct = await productRepository.findProductByUrl(normalizedUrl);

    if (existingProduct) {
        throw new Error("Product already exist");
    }

    const scrapedData = await scraperService.scrapeProduct(url);

    const product = await productRepository.createProduct({
        url: normalizedUrl,
        title: scrapedData.title,
        imageUrl: scrapedData.imageUrl,
        currentPrice: scrapedData.price,
        currency: scrapedData.currency,
        platform: scrapedData.platform,
    });

    await priceHistoryService.recordPrice(
        product.getDataValue("id"),
        scrapedData.price
    );

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

const updateProductPrice = async (productId: number) => {
    const product = await productRepository.findProductById(productId);

    if (!product) {
        throw new Error("Product not found");
    }

    const url = product.getDataValue("url");
    const scrapedData = await scraperService.scrapeProduct(url);
    const currentPrice = Number(product.getDataValue("currentPrice"));

    if (currentPrice === scrapedData.price) {
        return {
            changed: false,
            product,
        };
    }

    await productRepository.updateProductPrice(
        productId,
        scrapedData.price
    );

    const priceHistoryResult = await priceHistoryService.recordPrice(
        productId,
        scrapedData.price
    );

    const updatedProduct = await productRepository.findProductById(productId);

    return {
        changed: true,
        recorded: priceHistoryResult.recorded,
        product: updatedProduct,
    };
};

export default {
    createProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
    updateProductPrice
};