import AmazonScraper from "../scrapers/amazonScraper";
import BrightDataAmazonScraper from "../scrapers/brightDataAmazonScraper";
import BrightDataFlipkartScraper from "../scrapers/brightDataFlipkartScraper";
import FlipkartScraper from "../scrapers/flipkartScraper";
import detectPlatform from "../scrapers/platformDetector";
import { ScrapedProductData } from "../scrapers/types";

const invalidScrapedTitles = [
  "are you a human",
  "verify you are human",
  "verify you are a human",
  "captcha",
  "access denied",
  "checking your browser",
  "just a moment",
  "robot check",
  "please verify",
];

const validateScrapedProductData = (
  data: ScrapedProductData
) => {
  const title = data.title?.trim();

  if (!title) {
    throw new Error(
      "Scraper returned an empty product title."
    );
  }

  if (!data.imageUrl) {
    throw new Error(
      "Scraper returned no product image."
    );
  }

  if (
    data.price !== null &&
    (!Number.isFinite(data.price) ||
      data.price < 0)
  ) {
    throw new Error(
      "Scraper returned an invalid product price."
    );
  }

  if (data.currency !== "INR") {
    throw new Error(
      "Scraper returned an unsupported currency."
    );
  }

  const normalizedTitle =
    title.toLowerCase();

  const isBlocked =
    invalidScrapedTitles.some((phrase) =>
      normalizedTitle.includes(phrase)
    );

  if (isBlocked) {
    throw new Error(
      "Retailer returned a bot-check or verification page."
    );
  }
};

const scrapeProduct = async (
  url: string
): Promise<
  ScrapedProductData & { platform: string }
> => {
  const platform = detectPlatform(url);

  const provider =
    process.env.PRICE_DATA_PROVIDER ||
    "playwright";

  let data: ScrapedProductData;

  if (platform === "amazon") {
    if (provider === "brightdata") {
      const scraper = new BrightDataAmazonScraper();
      data = await scraper.scrape(url);
    } else {
      const scraper = new AmazonScraper();
      data = await scraper.scrape(url);
    }
  } else if (platform === "flipkart") {
    if (provider === "brightdata") {
      const scraper = new BrightDataFlipkartScraper();
      data = await scraper.scrape(url);
    } else {
      const scraper = new FlipkartScraper();
      data = await scraper.scrape(url);
    }
  } else {
    throw new Error(
      "Scraper not implemented for this platform"
    );
  }

  validateScrapedProductData(data);

  return {
    ...data,
    platform,
  };
};

export default {
  scrapeProduct,
};