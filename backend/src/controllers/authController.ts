import { Request, Response } from "express";
import authService from "../services/authService";
import { registerSchema, loginSchema } from "../validations/authValidation";

const register = async (req: Request, res: Response) => {
    try {
        const registerData = registerSchema.parse(req.body);

        const user = await authService.register(registerData);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const loginData = loginSchema.parse(req.body);
        const user = await authService.login(loginData);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: user,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const getMe = async (req: Request, res: Response) => {
    try {
        const user = await authService.getMe(req.userId!);

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        const accessToken = await authService.refreshAccessToken(refreshToken);

        return res.status(200).json({
            success: true,
            message: "Access token has been refreshed successfully",
            data: {
                accessToken,
            },
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        await authService.logout(refreshToken);

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export default {
    register,
    login,
    getMe,
    logout,
    refreshToken,
}