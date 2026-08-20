import api from "./api";

export interface CreateProductResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        url: string;
        title: string;
        imageUrl: string;
        currentPrice: string;
        currency: string;
        platform: string;
        trackingState: string;
    };
}

const createProduct = async (
    url: string
): Promise<CreateProductResponse> => {
    const response = await api.post("/products", {
        url,
    });

    return response.data;
};

export default {
    createProduct,
};