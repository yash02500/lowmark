import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

interface RetryableRequestConfig
    extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

const clearAuthAndNotify = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    window.dispatchEvent(
        new Event("auth-expired")
    );
};

const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem(
        "refreshToken"
    );

    if (!refreshToken) {
        throw new Error("Refresh token not found");
    }

    const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        {
            refreshToken,
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const newAccessToken = response.data?.data?.accessToken;

    if (!newAccessToken) {
        throw new Error(
            "New access token was not returned"
        );
    }

    localStorage.setItem(
        "accessToken",
        newAccessToken
    );

    return newAccessToken;
};

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token =
            localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config as RetryableRequestConfig;

        const status = error.response?.status;
        const requestUrl = originalRequest?.url || "";

        const shouldSkipRefresh =
            requestUrl.includes("/auth/login") ||
            requestUrl.includes("/auth/register") ||
            requestUrl.includes("/auth/refresh-token") ||
            requestUrl.includes("/auth/forgot-password") ||
            requestUrl.includes("/auth/reset-password");

        if (
            status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            shouldSkipRefresh
        ) {
            return Promise.reject(error);
        }

        if (typeof window === "undefined") {
            return Promise.reject(error);
        }

        const refreshToken =
            localStorage.getItem("refreshToken");

        if (!refreshToken) {
            clearAuthAndNotify();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {

            if (!refreshPromise) {
                refreshPromise = refreshAccessToken()
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const newAccessToken = await refreshPromise;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Retry the original request
            return api(originalRequest);
        } catch (refreshError) {
            clearAuthAndNotify();

            return Promise.reject(
                refreshError
            );
        }
    }
);

export default api;