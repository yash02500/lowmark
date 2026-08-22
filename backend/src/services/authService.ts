import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authRepository from "../repositories/authRepository";
import { RegisterInput, LoginInput } from "../validations/authValidation";
import emailVerificationService from "./emailVerificationService";
import dotenv from "dotenv";
dotenv.config();

const register = async (userData: RegisterInput) => {
    const existingUser = await authRepository.findUserEmail(userData.email);

    if (existingUser) {
        throw new Error("Email already registered")
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await authRepository.createUser({
        ...userData,
        password: hashedPassword,
    });

    await emailVerificationService.createVerificationToken(
        Number(newUser.get("id")),
        newUser.get("email") as string,
        newUser.get("name") as string
    );

    return {
        id: newUser.get("id"),
        name: newUser.get("name"),
        email: newUser.get("email"),
        emailVerified: newUser.get("emailVerified"),
        createdAt: newUser.get("createdAt"),
    }
};

const login = async (userData: LoginInput) => {
    const user = await authRepository.findUserEmail(userData.email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
        userData.password,
        user.get("password") as string
    );

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET not defined");
    }

    const token = jwt.sign(
        { userId: user.get("id") },
        jwtSecret,
        {
            expiresIn: "60m",
        }
    );

    const refreshToken = jwt.sign(
        {
            userId: user.get("id"),
            type: "refresh",
        },
        jwtSecret,
        {
            expiresIn: "7d",
        }
    );

    const refreshTokenExpiresAt = new Date();

    refreshTokenExpiresAt.setDate(
        refreshTokenExpiresAt.getDate() + 7
    );

    await authRepository.createRefreshToken(
        user.get("id") as number,
        refreshToken,
        refreshTokenExpiresAt
    );

    const userResponse = user.toJSON();
    delete userResponse.password;

    return {
        user: userResponse,
        accessToken: token,
        refreshToken,
    }
};

const getMe = async (userId: number) => {
    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const userResponse = user.toJSON();
    delete userResponse.password;

    return userResponse;
};

const updateMe = async (
    userId: number,
    userData: {
        name: string;
        email: string;
    }) => {
    const user = await authRepository.findUserById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const name = userData.name.trim();
    const email = userData.email.trim().toLowerCase();

    if (!name) {
        throw new Error("Name is required");
    }

    if (!email) {
        throw new Error("Email is required");
    }

    const currentEmail = user.get("email") as string;

    if (email !== currentEmail) {
        const existingUser = await authRepository.findUserEmail(email);

        if (existingUser && Number(existingUser.get("id")) !== userId) {
            throw new Error(
                "Email already registered"
            );
        }

        await user.update({
            name,
            email,
            emailVerified: false,
        });

        await emailVerificationService.createVerificationToken(
            userId,
            email,
            name
        );
    } else {
        await user.update({
            name,
        });
    }

    return {
        id: user.get("id"),
        name: user.get("name"),
        email: user.get("email"),
        emailVerified: user.get("emailVerified"),
        createdAt: user.get("createdAt"),
        updatedAt: user.get("updatedAt"),
    };
};

const refreshAccessToken = async (refreshToken: string) => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET not defined");
    }

    const storedToken = await authRepository.findRefreshToken(refreshToken);

    if (!storedToken) {
        throw new Error("Invalid refresh token");
    }

    const tokenData = storedToken.toJSON();

    if (new Date(tokenData.expiresAt) < new Date()) {
        await authRepository.deleteRefreshToken(refreshToken);
        throw new Error("Refresh token expired");
    }

    const decoded = jwt.verify(
        refreshToken,
        jwtSecret
    ) as {
        userId: number;
        type: string;
    };

    if (decoded.type !== "refresh") {
        throw new Error("Invalid refresh token");
    }

    const accessToken = jwt.sign(
        { userId: decoded.userId },
        jwtSecret,
        {
            expiresIn: "15m",
        }
    );

    return accessToken;
};

const logout = async (refreshToken: string) => {
    const deletedRows = await authRepository.deleteRefreshToken(refreshToken);

    if (deletedRows === 0) {
        throw new Error("Invalid refresh token");
    }
};

export default {
    register,
    login,
    getMe,
    refreshAccessToken,
    logout,
    updateMe,
};