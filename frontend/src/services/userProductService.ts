import api from "./api";
import {
    GetTrackedProductsResponse,
    InsightsResponse,
    AttentionResponse,
    UserProduct,
    PriceHistoryResponse,
} from "@/src/types/userProduct";

const getTrackedProducts = async (): Promise<GetTrackedProductsResponse> => {
    const response = await api.get("/user-products");
    return response.data;
};

const getInsights = async (): Promise<InsightsResponse> => {
    const response = await api.get("/user-products/insights");

    return response.data;
};

const getAttention = async (): Promise<AttentionResponse> => {
    const response = await api.get("/user-products/attention");

    return response.data;
};

const getTrackedProductById = async (
    id: number
): Promise<{ success: boolean; message: string; data: UserProduct }> => {
    const response = await api.get(`/user-products/${id}`);

    return response.data;
};

const getProductInsightById = async (
    id: number
) => {
    const response = await api.get(
        `/user-products/${id}/insight`
    );

    return response.data;
};

const getPriceHistory = async (
    productId: number
): Promise<PriceHistoryResponse> => {
    const response = await api.get(
        `/products/${productId}/price-history`
    );

    return response.data;
};

const trackProduct = async (
    productId: number,
    targetPrice?: number
) => {
    const response = await api.post("/user-products", {
        productId,
        targetPrice,
    });

    return response.data;
};

const untrackProduct = async (id: number) => {
    const response = await api.delete(
        `/user-products/${id}`
    );

    return response.data;
};

export default {
    getTrackedProducts,
    getInsights,
    getAttention,
    getTrackedProductById,
    getProductInsightById,
    getPriceHistory,
    trackProduct,
    untrackProduct,
};