import AmazonScraper from "../scrapers/amazonScraper";
import FlipkartScraper from "../scrapers/flipkartScraper";
import detectPlatform from "../scrapers/platformDetector";
import { ScrapedProductData } from "../scrapers/types";

const scrapeProduct = async (url: string): Promise<ScrapedProductData & { platform: string}> => {
  const platform = detectPlatform(url);

  if (platform === "amazon") {
    const scraper = new AmazonScraper();
    const data = await scraper.scrape(url);

    return {
        ...data,
        platform
    }
  }
  
  if (platform === "flipkart") {
    const scraper = new FlipkartScraper();
    const data = await scraper.scrape(url);

    return {
        ...data,
        platform
    }
  }

  throw new Error("Scraper not implemented for this platform");
};

export default {
  scrapeProduct,
};