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

            const pagetext = await page.locator("body").innerText();

            if (
                /page you are looking for has been moved or deleted/i.test(
                    pagetext
                )
            ) {
                return {
                    title: "",
                    imageUrl: "",
                    price: null,
                    currency: "INR",
                    availability: "discontinued",
                };
            }

            const title = await page.locator("h1").textContent();

            if (!title) {
                throw new Error("Unable to extract product title");
            }

            const image = await page.locator('img[src*="rukminim2.flixcart.com"]').first().getAttribute("src");

            if (!image) {
                throw new Error("Unable to extract product image");
            }

            let availability: "in_stock" | "out_of_stock" | "discontinued";
            const pageText = await page.locator("body").textContent();

            if (
                /out of stock|currently unavailable|sold out/i.test(pagetext)
            ) {
                availability = "out_of_stock";
            } else {
                availability = "in_stock";
            }

            const priceText = await page.locator('div').filter({ hasText: /^₹[\d,]+$/ }).first().textContent();

            let price: number | null = null;

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

export default FlipkartScraper;