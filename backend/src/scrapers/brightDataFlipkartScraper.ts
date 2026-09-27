import { ScrapedProductData } from "./types";

interface BrightDataFlipkartProduct {
    title?: string;
    name?: string;
    image_url?: string;
    price?: string | number | null;
    sale_price?: string | number | null;
    availability?: string;
    item_id?: string;
}

interface TriggerResponse {
    snapshot_id?: string;
}

const parsePrice = (
    value: string | number | null | undefined
): number | null => {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    const parsed = Number(
        value.replace(/[^\d.]/g, "")
    );

    return Number.isFinite(parsed) ? parsed : null;
};

class BrightDataFlipkartScraper {
    async scrape(url: string): Promise<ScrapedProductData> {
        const token =
            process.env.BRIGHT_DATA_API_TOKEN;

        const datasetId =
            process.env.BRIGHT_DATA_FLIPKART_DATASET_ID;

        if (!token) {
            throw new Error(
                "Bright Data API token is not configured."
            );
        }

        if (!datasetId) {
            throw new Error(
                "Bright Data Flipkart dataset ID is not configured."
            );
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        // 1. Trigger the scraper
        const triggerResponse = await fetch(
            `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${encodeURIComponent(
                datasetId
            )}&include_errors=true`,
            {
                method: "POST",
                headers,
                body: JSON.stringify([
                    {
                        url,
                    },
                ]),
            }
        );

        if (!triggerResponse.ok) {
            const errorText =
                await triggerResponse.text();

            throw new Error(
                `Bright Data Flipkart trigger failed (${triggerResponse.status}): ${errorText}`
            );
        }

        const triggerData =
            (await triggerResponse.json()) as TriggerResponse;

        const snapshotId =
            triggerData.snapshot_id;

        if (!snapshotId) {
            throw new Error(
                "Bright Data did not return a Flipkart snapshot ID."
            );
        }

        // 2. Poll the snapshot
        const maxAttempts = 24;
        const delayMs = 5000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise((resolve) =>
                setTimeout(resolve, delayMs)
            );

            const snapshotResponse =
                await fetch(
                    `https://api.brightdata.com/datasets/v3/snapshot/${encodeURIComponent(
                        snapshotId
                    )}?format=json`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            if (snapshotResponse.status === 202) {
                continue;
            }

            if (!snapshotResponse.ok) {
                const errorText =
                    await snapshotResponse.text();

                throw new Error(
                    `Bright Data Flipkart snapshot failed (${snapshotResponse.status}): ${errorText}`
                );
            }

            const data =
                (await snapshotResponse.json()) as BrightDataFlipkartProduct[];

            const product = data?.[0];

            if (!product) {
                throw new Error(
                    "Bright Data returned no Flipkart product data."
                );
            }

            const title = product.name?.trim() || product.title?.trim();
            const imageUrl = product.image_url?.trim();

            const price = parsePrice(
                product.sale_price ??
                product.price
            );

            if (!title) {
                throw new Error(
                    "Bright Data returned no Flipkart product title."
                );
            }

            if (!imageUrl) {
                throw new Error(
                    "Bright Data returned no Flipkart product image."
                );
            }

            if (price === null) {
                throw new Error(
                    "Bright Data returned no valid Flipkart product price."
                );
            }

            return {
                title,
                imageUrl,
                price,
                currency: "INR",
                availability:
                    product.availability === "in_stock"
                        ? "in_stock"
                        : "out_of_stock",
            };
        }

        throw new Error(
            "Bright Data Flipkart scrape timed out."
        );
    }
}

export default BrightDataFlipkartScraper;