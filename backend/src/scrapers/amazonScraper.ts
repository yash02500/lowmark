import { chromium } from "playwright";
import { ProductScraper, ScrapedProductData } from "./types";

class AmazonScraper implements ProductScraper {
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

            // Give Amazon a short moment to render the product page
            await page.waitForTimeout(2000);

            const titleLocator = page.locator("span#productTitle");

            let title = await titleLocator
                .first()
                .textContent({ timeout: 5000 })
                .catch(() => null);

            if (!title) {
                throw new Error(
                    "Unable to extract Amazon product title. Amazon may have blocked the request or changed the page."
                );
            }

            const image = await page
                .locator("#landingImage")
                .getAttribute("src", { timeout: 5000 })
                .catch(() => null);

            if (!image) {
                throw new Error(
                    "Unable to extract Amazon product image."
                );
            }

            let availability: "in_stock" | "out_of_stock" | "discontinued";

            const unavailableText = await page
                .locator("#availability")
                .textContent({ timeout: 5000 })
                .catch(() => null);

            if (
                unavailableText &&
                /currently unavailable|out of stock/i.test(
                    unavailableText
                )
            ) {
                availability = "out_of_stock";
            } else {
                availability = "in_stock";
            }

            let price: number | null = null;

            const priceText = await page
                .locator(".a-price .a-offscreen")
                .first()
                .textContent({ timeout: 5000 })
                .catch(() => null);

            if (priceText) {
                price = Number(
                    priceText.replace(/[^\d.]/g, "")
                );

                if (Number.isNaN(price)) {
                    price = null;
                }
            }

            return {
                title: title.trim(),
                imageUrl: image,
                price,
                currency: "INR",
                availability,
            };
        } finally {
            await browser.close();
        }
    }
}

export default AmazonScraper;