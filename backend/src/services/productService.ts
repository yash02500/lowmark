import schedulingService from "./schedulingService";
import productRepository from "../repositories/productRepository";
import scraperService from "./scraperService";
import normalizeProductUrl from "../utils/normalizeProductUrl";
import priceHistoryService from "./priceHistoryService";
import userProductRepository from "../repositories/userProductRepository";

const createProduct = async (productData: { url: string; }) => {

    const { url } = productData;
    const normalizedUrl = normalizeProductUrl(url);
    const existingProduct = await productRepository.findProductByUrl(normalizedUrl);

    if (existingProduct) {
        throw new Error("Product already exist");
    }

    const scrapedData = await scraperService.scrapeProduct(url);

    if (scrapedData.price === null) {
        throw new Error(
            `Product is ${scrapedData.availability} and has no price`
        );
    }

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

    const previousTrackingState = product.getDataValue("trackingState");
    const url = product.getDataValue("url");
    const scrapedData = await scraperService.scrapeProduct(url);
    const currentPrice = Number(product.getDataValue("currentPrice"));
    const now = new Date();
    const createdAt = product.getDataValue("createdAt") as Date;
    const isNew = now.getTime() - createdAt.getTime() <= 24 * 60 * 60 * 1000;
    const userProducts = await userProductRepository.findActiveUserProductsByProductId(productId);

    const targetPrices = userProducts
        .map((userProduct) =>
            userProduct.get("targetPrice")
        )
        .filter(
            (targetPrice): targetPrice is number =>
                targetPrice !== null &&
                targetPrice !== undefined
        )
        .map(Number);

    // If there is no price, don't use it for target-price comparison
    const targetPriceClose = scrapedData.price !== null &&
        schedulingService.isTargetPriceClose(
            scrapedData.price,
            targetPrices
        );

    const priceChangeCount = await priceHistoryService.getRecentPriceChangeCount(productId);
    const stableForWeeks = await priceHistoryService.isStableForWeeks(productId);

    // Use the NEW availability returned by the scraper
    const trackingState = scrapedData.availability;

    const interval = schedulingService.getCheckIntervalMinutes({
        isNew,
        priceChangeCount,
        targetPriceClose,
        stableForWeeks,
        trackingState,
    });

    const nextCheckAt = schedulingService.calculateNextCheckAt(
        interval,
        now
    );

    // Always update scheduling state,
    // even when the product has no current price.
    await productRepository.updateScheduling(
        productId,
        {
            lastCheckedAt: now,
            nextCheckAt,
            checkIntervalMinutes: interval,
            priority: product.getDataValue("priority"),
            trackingState,
        }
    );

    // Product has no price, for example out of stock.
    // Keep the existing currentPrice in the database.
    if (scrapedData.price === null) {
        return {
            changed: false,
            previousPrice: currentPrice,
            currentPrice: null,
            availabilityChanged: previousTrackingState !== trackingState,
            previousTrackingState,
            currentTrackingState: trackingState,
            product,
            userProducts,
            nextCheckAt,
            checkIntervalMinutes: interval,
            priceDropped: false,
            priceIncreased: false,
        };
    }

    // Price did not change
    if (currentPrice === scrapedData.price) {
        return {
            changed: false,
            previousPrice: currentPrice,
            currentPrice: scrapedData.price,
            priceDropped: false,
            priceIncreased: false,
            availabilityChanged:
                previousTrackingState !== trackingState,
            previousTrackingState,
            currentTrackingState: trackingState,
            product,
            userProducts,
            nextCheckAt,
            checkIntervalMinutes: interval,
        };
    }

    // Price changed
    await productRepository.updateProductPrice(
        productId,
        scrapedData.price
    );

    const priceHistoryResult = await priceHistoryService.recordPrice(
        productId,
        scrapedData.price
    );

    const updatedProduct = await productRepository.findProductById(
        productId
    );

    return {
        changed: true,
        previousPrice: currentPrice,
        currentPrice: scrapedData.price,
        priceDropped: scrapedData.price < currentPrice,
        priceIncreased: scrapedData.price > currentPrice,
        availabilityChanged: previousTrackingState !== trackingState,
        previousTrackingState,
        currentTrackingState: trackingState,
        recorded: priceHistoryResult.recorded,
        product: updatedProduct,
        userProducts,
        nextCheckAt,
        checkIntervalMinutes: interval,
    };
};

export default {
    createProduct,
    getProductById,
    getAllProducts,
    deleteProduct,
    updateProductPrice
};