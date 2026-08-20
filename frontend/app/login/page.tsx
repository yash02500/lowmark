"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import authService from "@/src/services/authService";

const loginSchema = z.object({
    email: z
        .email("Please enter a valid email"),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const router = useRouter();

    const [serverError, setServerError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const handleLogin = async (data: LoginFormData) => {
        try {
            setServerError("");

            const response = await authService.login(data);

            const { accessToken, refreshToken } =
                response.data;

            localStorage.setItem(
                "accessToken",
                accessToken
            );

            localStorage.setItem(
                "refreshToken",
                refreshToken
            );

            router.push("/dashboard");
        } catch (error: any) {
            setServerError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        }
    };

    return (
        <main>
            <h1>Login</h1>

            <form onSubmit={handleSubmit(handleLogin)}>
                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        {...register("email")}
                    />

                    {errors.email && (
                        <p>{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        {...register("password")}
                    />

                    {errors.password && (
                        <p>{errors.password.message}</p>
                    )}
                </div>

                {serverError && (
                    <p>{serverError}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? "Logging in..."
                        : "Login"}
                </button>
            </form>
        </main>
    );
};

export default LoginPage;