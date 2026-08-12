export interface ScrapedProductData {
    title: string;
    imageUrl?: string;
    price: number;
    currency: string;
}

export interface ProductScraper {
    scrape(url: string): Promise<ScrapedProductData>;
}