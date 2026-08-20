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

const refreshToken = async (refreshToken: string) => {
    const response = await api.post("/auth/refresh-token", { refreshToken });
    return response.data;
};

const logout = async () => {
    const response = await api.post("/auth/logout", { refreshToken });
    return response.data;
};

export default {
    register,
    login,
    getMe,
    refreshToken,
    logout,
};