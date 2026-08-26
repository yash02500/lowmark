import { ScrapedProductData } from "./types";

interface BrightDataAmazonProduct {
    title_clean?: string;
    title?: string;
    image_url?: string;
    image?: string;
    final_price?: number | null;
    currency?: string;
    availability?: string;
    is_available?: boolean;
    error?: unknown;
}

class BrightDataAmazonScraper {
    async scrape(url: string): Promise<ScrapedProductData> {
        const token = process.env.BRIGHT_DATA_API_TOKEN;
        const datasetId =
            process.env.BRIGHT_DATA_AMAZON_DATASET_ID;
        const zipcode =
            process.env.BRIGHT_DATA_ZIPCODE || "";

        if (!token) {
            throw new Error(
                "Bright Data API token is not configured."
            );
        }

        if (!datasetId) {
            throw new Error(
                "Bright Data Amazon dataset ID is not configured."
            );
        }

        const endpoint =
            `https://api.brightdata.com/datasets/v3/scrape` +
            `?dataset_id=${encodeURIComponent(datasetId)}` +
            `&notify=false` +
            `&include_errors=true`;

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input: [
                    {
                        url,
                        zipcode,
                        language: "",
                    },
                ],
                limit_per_input: null,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Bright Data Amazon request failed (${response.status}): ${errorText}`
            );
        }

        const data =
            (await response.json()) as BrightDataAmazonProduct[];

        const product = data?.[0];

        if (!product) {
            throw new Error(
                "Bright Data returned no Amazon product data."
            );
        }

        if (product.error) {
            throw new Error(
                "Bright Data could not fetch the Amazon product."
            );
        }

        const title =
            product.title_clean?.trim() ||
            product.title?.trim();

        const imageUrl =
            product.image_url ||
            product.image ||
            "";

        const price =
            product.final_price ?? null;

        if (!title) {
            throw new Error(
                "Bright Data returned no Amazon product title."
            );
        }

        if (!imageUrl) {
            throw new Error(
                "Bright Data returned no Amazon product image."
            );
        }

        const availability =
            product.is_available === true ||
                /in stock/i.test(
                    product.availability || ""
                )
                ? "in_stock"
                : "out_of_stock";

        return {
            title,
            imageUrl,
            price,
            currency: product.currency || "INR",
            availability,
        };
    }
}

export default BrightDataAmazonScraper;