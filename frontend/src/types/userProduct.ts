export interface Product {
    id: number;
    url: string;
    title: string;
    imageUrl?: string;
    currentPrice: string | null;
    platform: string;
    currency: string;
    lastCheckedAt: string | null;
    nextCheckAt: string | null;
    checkIntervalMinutes: number;
    priority: number;
    trackingState:
        | "in_stock"
        | "out_of_stock"
        | "discontinued";
    createdAt: string;
    updatedAt: string;
}

export interface UserProduct {
    id: number;
    userId: number;
    productId: number;
    targetPrice: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    product: Product;
}

export interface GetTrackedProductsResponse {
    success: boolean;
    message: string;
    data: UserProduct[];
}

export interface ProductInsight {
    productId: number;
    title: string;
    currentPrice: number;
    lowestPrice: number;
    highestPrice: number;
    averagePrice: number;
    priceChange: number | null;
    priceChangePercentage: number | null;
    sevenDayChangePercentage: number | null;
    thirtyDayChangePercentage: number | null;
    trend: string;
    priceChangeCount: number;
    availability: string;
    targetPrice: number | null;
    targetStatus: string | null;
}

export interface InsightsData {
    trackedProductCount: number;
    products: ProductInsight[];
    summary: string;
}

export interface InsightsResponse {
    success: boolean;
    message: string;
    data: InsightsData;
}

export interface AttentionItem {
    productId: number;
    title: string;
    type: string;
    priority: string;
    message: string;
    currentPrice: number;
    lowestPrice?: number;
    targetPrice?: number;
    percentageAboveTarget?: number;
}

export interface AttentionData {
    productCount: number;
    attentionItems: AttentionItem[];
    summary: string;
}

export interface AttentionResponse {
    success: boolean;
    message: string;
    data: AttentionData;
}

export interface PriceHistory {
    id: number;
    productId: number;
    price: string;
    recordedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface PriceHistoryResponse {
    success: boolean;
    message: string;
    data: PriceHistory[];
}