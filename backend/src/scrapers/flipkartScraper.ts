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

            await page.waitForTimeout(1500);

            const pageText =
                await page
                    .locator("body")
                    .innerText()
                    .catch(() => "");

            /*
             * Bot / verification / blocked page
             */
            if (
                /are you a human|verify (you are )?human|captcha|access denied|checking your browser|robot check|just a moment|please verify/i.test(
                    pageText
                )
            ) {
                throw new Error(
                    "Flipkart returned a bot-check or verification page."
                );
            }

            /*
             * Product removed / unavailable page
             */
            if (
                /page you are looking for has been moved or deleted/i.test(
                    pageText
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

            /*
             * Product title
             */
            const title = await page
                .locator("h1")
                .first()
                .textContent()
                .catch(() => null);

            if (!title?.trim()) {
                throw new Error(
                    "Unable to extract Flipkart product title."
                );
            }

            const cleanedTitle = title.trim();

            /*
             * Final title safety check
             */
            if (
                /are you a human|captcha|verify|access denied|robot/i.test(
                    cleanedTitle
                )
            ) {
                throw new Error(
                    "Flipkart returned an invalid product title."
                );
            }

            /*Product image*/
            const image =
                await page
                    .locator(
                        'img[src*="rukminim2.flixcart.com"]'
                    )
                    .first()
                    .getAttribute("src")
                    .catch(() => null);

            if (!image) {
                throw new Error(
                    "Unable to extract Flipkart product image."
                );
            }

            /*Availability*/
            let availability:
                | "in_stock"
                | "out_of_stock"
                | "discontinued";

            if (
                /out of stock|currently unavailable|sold out/i.test(
                    pageText
                )
            ) {
                availability = "out_of_stock";
            } else {
                availability = "in_stock";
            }

            /* Price*/
            const priceText =
                await page
                    .locator("div")
                    .filter({
                        hasText: /^₹[\d,]+$/,
                    })
                    .first()
                    .textContent()
                    .catch(() => null);

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
                title: cleanedTitle,
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