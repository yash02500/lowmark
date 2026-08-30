import api from "./api";

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            name: string;
            email: string;
            emailVerified: boolean;
        };
        accessToken: string;
        refreshToken: string;
    };
}

const register = async (data: RegisterData) => {
    const response = await api.post("/auth/register", data);
    return response.data;
};

const login = async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
};

const getMe = async () => {
    const response = await api.get("/auth/me");
    return response.data;
};

const updateMe = async (data: {
    name: string;
    email: string;
}) => {
    const response = await api.patch(
        "/auth/me",
        data
    );

    return response.data;
};

const refreshToken = async (refreshToken: string) => {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data;
};

const logout = async () => {
    const response = await api.post("/auth/logout", { refreshToken });
    return response.data;
};

const verifyEmail = async (token: string) => {
    const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.data;
};

const resendVerification = async () => {
    const response = await api.post(
        "/auth/resend-verification"
    );

    return response.data;
};

const forgotPassword = async (email: string) => {
    const response = await api.post(
            "/auth/forgot-password",
            { email }
        );

    return response.data;
};

const resetPassword = async (token: string, password: string) => {
    const response = await api.post(
            "/auth/reset-password",
            {
                token,
                password,
            }
        );

    return response.data;
};

export default {
    register,
    login,
    getMe,
    updateMe,
    refreshToken,
    verifyEmail,
    resendVerification,
    logout,
    forgotPassword,
    resetPassword,
};