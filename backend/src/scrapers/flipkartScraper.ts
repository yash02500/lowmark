import { chromium } from "playwright";
import { ProductScraper, ScrapedProductData } from "./types";

class FlipkartScraper implements ProductScraper {
    async scrape(url: string): Promise<ScrapedProductData> {
        const browser = await chromium.launch({
            headless: true,
        });

        try {
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 30000,
            });

            const title = await page.locator("h1").textContent();

            if (!title) {
                throw new Error("Unable to extract product title");
            }

            const image = await page.locator('img[src*="rukminim2.flixcart.com"]').first().getAttribute("src");

            if (!image) {
                throw new Error("Unable to extract product image");
            }

            const priceText = await page.locator('div').filter({ hasText: /^₹[\d,]+$/ }).first().textContent();

            if (!priceText) {
                throw new Error("Unable to extract product price");
            }

            const price = Number(priceText.replace(/[^\d.]/g, ""));

            if (Number.isNaN(price)) {
                throw new Error("Invalid product price");
            }

            return {
                title: title.trim(),
                imageUrl: image,
                price,
                currency: "INR",
            };
        } finally {
            await browser.close();
        }
    }
}

export default FlipkartScraper;