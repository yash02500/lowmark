import { describe, it, expect, beforeEach, afterAll, jest } from "@jest/globals";
import AmazonScraper from "../scrapers/amazonScraper";
import BrightDataAmazonScraper from "../scrapers/brightDataAmazonScraper";
import BrightDataFlipkartScraper from "../scrapers/brightDataFlipkartScraper";
import FlipkartScraper from "../scrapers/flipkartScraper";
import detectPlatform from "../scrapers/platformDetector";

import scraperService from "./scraperService";

// Mock every external scraper
jest.mock("../scrapers/amazonScraper", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("../scrapers/brightDataAmazonScraper", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("../scrapers/brightDataFlipkartScraper", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("../scrapers/flipkartScraper", () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock("../scrapers/platformDetector", () => ({
    __esModule: true,
    default: jest.fn(),
}));

const originalProvider = process.env.PRICE_DATA_PROVIDER;

// Configure a mocked scraper instance for a particular test
const configureScraper = (
    scraperClass: any,
    data: any
) => {
    const scrape = jest.fn(async (_url: string) => data);

    scraperClass.mockImplementation(() => ({
        scrape,
    }));

    return scrape;
};

const validProductData = (overrides: Record<string, any> = {}) => ({
    title: "Test Product",
    imageUrl: "https://example.com/product.jpg",
    price: 1500,
    currency: "INR",
    ...overrides,
});

beforeEach(() => {
    jest.clearAllMocks();

    // Make tests independent of the machine's environment configuration
    delete process.env.PRICE_DATA_PROVIDER;

    (detectPlatform as any).mockReturnValue("amazon");
});

afterAll(() => {
    if (originalProvider === undefined) {
        delete process.env.PRICE_DATA_PROVIDER;
    } else {
        process.env.PRICE_DATA_PROVIDER = originalProvider;
    }
});

describe("scraperService.scrapeProduct", () => {

    // PROVIDER SELECTION
    it("should use Bright Data for Amazon when configured", async () => {
        process.env.PRICE_DATA_PROVIDER = "brightdata";

        const url = "https://www.amazon.in/dp/TEST123";
        const data = validProductData();

        const scrape = configureScraper(
            BrightDataAmazonScraper as any,
            data
        );

        const result = await scraperService.scrapeProduct(url);

        expect(scrape).toHaveBeenCalledWith(url);
        expect(AmazonScraper).not.toHaveBeenCalled();

        expect(result).toEqual({
            ...data,
            platform: "amazon",
        });
    });

    it("should use the Playwright Amazon scraper by default", async () => {
        const url = "https://www.amazon.in/dp/TEST123";
        const data = validProductData();

        const scrape = configureScraper(
            AmazonScraper as any,
            data
        );

        const result = await scraperService.scrapeProduct(url);

        expect(scrape).toHaveBeenCalledWith(url);
        expect(BrightDataAmazonScraper).not.toHaveBeenCalled();

        expect(result.platform).toBe("amazon");
    });

    it("should use Bright Data for Flipkart when configured", async () => {
        process.env.PRICE_DATA_PROVIDER = "brightdata";

        (detectPlatform as any).mockReturnValue("flipkart");

        const url = "https://www.flipkart.com/test-product/p/TEST123";
        const data = validProductData();

        const scrape = configureScraper(
            BrightDataFlipkartScraper as any,
            data
        );

        const result = await scraperService.scrapeProduct(url);

        expect(scrape).toHaveBeenCalledWith(url);
        expect(FlipkartScraper).not.toHaveBeenCalled();

        expect(result.platform).toBe("flipkart");
    });

    it("should use the Playwright Flipkart scraper by default", async () => {
        (detectPlatform as any).mockReturnValue("flipkart");

        const url = "https://www.flipkart.com/test-product/p/TEST123";
        const data = validProductData();

        const scrape = configureScraper(
            FlipkartScraper as any,
            data
        );

        const result = await scraperService.scrapeProduct(url);

        expect(scrape).toHaveBeenCalledWith(url);
        expect(BrightDataFlipkartScraper).not.toHaveBeenCalled();

        expect(result.platform).toBe("flipkart");
    });

    it("should reject an unsupported platform", async () => {
        (detectPlatform as any).mockReturnValue("other");

        await expect(
            scraperService.scrapeProduct("https://example.com/product")
        ).rejects.toThrow(
            "Scraper not implemented for this platform"
        );

        expect(AmazonScraper).not.toHaveBeenCalled();
        expect(FlipkartScraper).not.toHaveBeenCalled();
    });

    // SCRAPED DATA VALIDATION
    it("should reject an empty product title", async () => {
        configureScraper(
            AmazonScraper as any,
            validProductData({ title: "   " })
        );

        await expect(
            scraperService.scrapeProduct("https://www.amazon.in/dp/TEST123")
        ).rejects.toThrow(
            "Scraper returned an empty product title."
        );
    });

    it("should reject missing product images", async () => {
        configureScraper(
            AmazonScraper as any,
            validProductData({ imageUrl: "" })
        );

        await expect(
            scraperService.scrapeProduct("https://www.amazon.in/dp/TEST123")
        ).rejects.toThrow(
            "Scraper returned no product image."
        );
    });

    it("should reject a negative price", async () => {
        configureScraper(
            AmazonScraper as any,
            validProductData({ price: -100 })
        );

        await expect(
            scraperService.scrapeProduct("https://www.amazon.in/dp/TEST123")
        ).rejects.toThrow(
            "Scraper returned an invalid product price."
        );
    });

    it("should reject a non-finite price", async () => {
        configureScraper(
            AmazonScraper as any,
            validProductData({ price: Infinity })
        );

        await expect(
            scraperService.scrapeProduct("https://www.amazon.in/dp/TEST123")
        ).rejects.toThrow(
            "Scraper returned an invalid product price."
        );
    });

    it("should accept a null price when the product has no available price", async () => {
        const data = validProductData({ price: null });

        configureScraper(AmazonScraper as any, data);

        const result = await scraperService.scrapeProduct(
            "https://www.amazon.in/dp/TEST123"
        );

        expect(result.price).toBeNull();
        expect(result.platform).toBe("amazon");
    });

    it("should reject an unsupported currency", async () => {
        configureScraper(
            AmazonScraper as any,
            validProductData({ currency: "USD" })
        );

        await expect(
            scraperService.scrapeProduct("https://www.amazon.in/dp/TEST123")
        ).rejects.toThrow(
            "Scraper returned an unsupported currency."
        );
    });

    it("should reject a retailer bot-check page", async () => {
        configureScraper(
            BrightDataAmazonScraper as any,
            validProductData({
                title: "Are you a human? Please verify",
            })
        );

        process.env.PRICE_DATA_PROVIDER = "brightdata";

        await expect(
            scraperService.scrapeProduct("https://www.amazon.in/dp/TEST123")
        ).rejects.toThrow(
            "Retailer returned a bot-check or verification page."
        );
    });

    it("should propagate an error from the scraper", async () => {
        const scrape = jest.fn(async (_url: string) => {
            throw new Error("Bright Data unavailable");
        });

        (BrightDataAmazonScraper as any).mockImplementation(() => ({
            scrape,
        }));

        process.env.PRICE_DATA_PROVIDER = "brightdata";

        await expect(
            scraperService.scrapeProduct("https://www.amazon.in/dp/TEST123")
        ).rejects.toThrow("Bright Data unavailable");
    });
});
