// import { ScrapedProductData } from "./types";

// interface BrightDataAmazonProduct {
//     title_clean?: string;
//     title?: string;
//     image_url?: string;
//     image?: string;
//     final_price?: number | null;
//     currency?: string;
//     availability?: string;
//     is_available?: boolean;
//     error?: unknown;
// }

// interface BrightDataSnapshotResponse {
//     snapshot_id?: string;
// }

// interface BrightDataProgressResponse {
//     snapshot_id: string;
//     dataset_id?: string;
//     status: "starting" | "running" | "ready" | "failed" | string;
//     error_message?: string;
// }

// class BrightDataAmazonScraper {
//     async scrape(url: string): Promise<ScrapedProductData> {
//         const token = process.env.BRIGHT_DATA_API_TOKEN;
//         const datasetId =
//             process.env.BRIGHT_DATA_AMAZON_DATASET_ID;
//         const zipcode =
//             process.env.BRIGHT_DATA_ZIPCODE || "";

//         if (!token) {
//             throw new Error(
//                 "Bright Data API token is not configured."
//             );
//         }

//         if (!datasetId) {
//             throw new Error(
//                 "Bright Data Amazon dataset ID is not configured."
//             );
//         }

//         const endpoint =
//             `https://api.brightdata.com/datasets/v3/scrape` +
//             `?dataset_id=${encodeURIComponent(datasetId)}` +
//             `&notify=false` +
//             `&include_errors=true`;

//         const response = await fetch(endpoint, {
//             method: "POST",
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 input: [
//                     {
//                         url,
//                         zipcode,
//                         language: "",
//                     },
//                 ],
//                 limit_per_input: null,
//             }),
//         });

//         if (!response.ok) {
//             const errorText = await response.text();

//             throw new Error(
//                 `Bright Data Amazon request failed (${response.status}): ${errorText}`
//             );
//         }

//         const data =
//             (await response.json()) as BrightDataAmazonProduct[];

//         const product = data?.[0];

//         if (!product) {
//             throw new Error(
//                 "Bright Data returned no Amazon product data."
//             );
//         }

//         if (product.error) {
//             throw new Error(
//                 "Bright Data could not fetch the Amazon product."
//             );
//         }

//         const title =
//             product.title_clean?.trim() ||
//             product.title?.trim();

//         const imageUrl =
//             product.image_url ||
//             product.image ||
//             "";

//         const price =
//             product.final_price ?? null;

//         if (!title) {
//             throw new Error(
//                 "Bright Data returned no Amazon product title."
//             );
//         }

//         if (!imageUrl) {
//             throw new Error(
//                 "Bright Data returned no Amazon product image."
//             );
//         }

//         const availability =
//             product.is_available === true ||
//                 /in stock/i.test(
//                     product.availability || ""
//                 )
//                 ? "in_stock"
//                 : "out_of_stock";

//         return {
//             title,
//             imageUrl,
//             price,
//             currency: product.currency || "INR",
//             availability,
//         };
//     }
// }

// export default BrightDataAmazonScraper;

import { ScrapedProductData } from "./types";

interface BrightDataAmazonProduct {
    title_clean?: string;
    title?: string;
    image_url?: string;
    image?: string;
    final_price?: number | null;
    initial_price?: number | null;
    currency?: string;
    availability?: string;
    is_available?: boolean;
    error?: unknown;
}

interface BrightDataSnapshotResponse {
    snapshot_id?: string;
}

interface BrightDataProgressResponse {
    snapshot_id: string;
    dataset_id?: string;
    status: string;
    error_message?: string;
}

class BrightDataAmazonScraper {
    private readonly maxPollingAttempts = 18;
    private readonly pollingDelayMs = 5000;

    private async wait(ms: number): Promise<void> {
        await new Promise((resolve) =>
            setTimeout(resolve, ms)
        );
    }

    private async getSnapshotResult(
        token: string,
        snapshotId: string
    ): Promise<BrightDataAmazonProduct[]> {
        for (
            let attempt = 1;
            attempt <= this.maxPollingAttempts;
            attempt++
        ) {
            const progressUrl =
                `https://api.brightdata.com/datasets/v3/progress/${encodeURIComponent(
                    snapshotId
                )}`;

            const progressResponse = await fetch(
                progressUrl,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!progressResponse.ok) {
                const errorText =
                    await progressResponse.text();

                throw new Error(
                    `Bright Data snapshot progress check failed (${progressResponse.status}): ${errorText}`
                );
            }

            const progress =
                (await progressResponse.json()) as BrightDataProgressResponse;

            console.log(
                `Bright Data Amazon snapshot ${snapshotId} status: ${progress.status} (attempt ${attempt}/${this.maxPollingAttempts})`
            );

            if (progress.status === "failed") {
                throw new Error(
                    progress.error_message ||
                    "Bright Data Amazon snapshot failed."
                );
            }

            if (progress.status === "ready") {
                const snapshotUrl =
                    `https://api.brightdata.com/datasets/v3/snapshot/${encodeURIComponent(
                        snapshotId
                    )}?format=json`;

                const snapshotResponse =
                    await fetch(snapshotUrl, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                if (!snapshotResponse.ok) {
                    const errorText =
                        await snapshotResponse.text();

                    throw new Error(
                        `Bright Data Amazon snapshot download failed (${snapshotResponse.status}): ${errorText}`
                    );
                }

                const snapshotData =
                    await snapshotResponse.json();

                if (Array.isArray(snapshotData)) {
                    return snapshotData as BrightDataAmazonProduct[];
                }

                return [
                    snapshotData as BrightDataAmazonProduct,
                ];
            }

            await this.wait(
                this.pollingDelayMs
            );
        }

        throw new Error(
            "Bright Data Amazon snapshot did not become ready within the allowed time."
        );
    }

    async scrape(
        url: string
    ): Promise<ScrapedProductData> {
        const token =
            process.env.BRIGHT_DATA_API_TOKEN;

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

        const response = await fetch(
            endpoint,
            {
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
            }
        );

        if (!response.ok) {
            const errorText =
                await response.text();

            throw new Error(
                `Bright Data Amazon request failed (${response.status}): ${errorText}`
            );
        }

        const initialResponse = await response.json();

        console.log("Bright Data Amazon response received");

        let data: BrightDataAmazonProduct[];

        // 1. Bright Data returned an array directly
        if (Array.isArray(initialResponse)) {
            data =
                initialResponse as BrightDataAmazonProduct[];
        }

        // 2. Bright Data returned a snapshot ID
        else if (
            initialResponse &&
            typeof initialResponse === "object" &&
            "snapshot_id" in initialResponse &&
            initialResponse.snapshot_id
        ) {
            console.log(
                `Bright Data Amazon returned snapshot ${initialResponse.snapshot_id}`
            );

            data =
                await this.getSnapshotResult(
                    token,
                    initialResponse.snapshot_id
                );
        }

        // 3. Bright Data returned one product object directly
        else if (
            initialResponse &&
            typeof initialResponse === "object"
        ) {
            data = [
                initialResponse as BrightDataAmazonProduct,
            ];
        }

        else {
            throw new Error(
                "Bright Data returned an unexpected Amazon response."
            );
        }

        const product = data[0];

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
            currency:
                product.currency || "INR",
            availability,
        };
    }
}

export default BrightDataAmazonScraper;