export interface ScrapedProductData {
    title: string;
    imageUrl?: string;
    price: number | null;
    currency: string;
    availability: "in_stock" | "out_of_stock" | "discontinued";
}

export interface ProductScraper {
    scrape(url: string): Promise<ScrapedProductData>;
}