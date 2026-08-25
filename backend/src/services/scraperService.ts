import AmazonScraper from "../scrapers/amazonScraper";
import FlipkartScraper from "../scrapers/flipkartScraper";
import detectPlatform from "../scrapers/platformDetector";
import { ScrapedProductData } from "../scrapers/types";

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

  if (
    /are you a human|verify (you are )?human|captcha|access denied|checking your browser|robot check|just a moment|please verify/i.test(
      title
    )
  ) {
    throw new Error(
      "Retailer returned a bot-check or verification page."
    );
  }
};

const scrapeProduct = async (
  url: string
): Promise<ScrapedProductData & { platform: string }> => {
  const platform = detectPlatform(url);

  let data: ScrapedProductData;

  if (platform === "amazon") {
    const scraper = new AmazonScraper();
    data = await scraper.scrape(url);
  } else if (platform === "flipkart") {
    const scraper = new FlipkartScraper();
    data = await scraper.scrape(url);
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