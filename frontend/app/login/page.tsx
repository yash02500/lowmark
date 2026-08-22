"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import authService from "@/src/services/authService";

const loginSchema = z.object({
    email: z
        .email("Please enter a valid email"),

    password: z
        .string()
        .min(7, "Password is required"),
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

    const handleLogin = async (
        data: LoginFormData
    ) => {
        try {
            setServerError("");

            const response =
                await authService.login(data);

            const {
                accessToken,
                refreshToken,
            } = response.data;

            localStorage.setItem(
                "accessToken",
                accessToken
            );

            localStorage.setItem(
                "refreshToken",
                refreshToken
            );

            sessionStorage.removeItem("dashboardInsights");
            sessionStorage.removeItem("dashboardAttention");
            sessionStorage.removeItem("dashboardAI_cachedAt");

            router.push("/dashboard");
        } catch (error: any) {
            setServerError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Lowmark
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Track prices. Buy at the right time.
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Welcome back
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Sign in to your account
                    </p>

                    <form
                        onSubmit={handleSubmit(handleLogin)}
                        className="mt-6 space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                {...register("email")}
                                className={`mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${errors.email
                                        ? "border-red-300 focus:border-red-500"
                                        : "border-gray-300 focus:border-gray-900"
                                    }`}
                            />

                            {errors.email && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                {...register("password")}
                                className={`mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${errors.password
                                        ? "border-red-300 focus:border-red-500"
                                        : "border-gray-300 focus:border-gray-900"
                                    }`}
                            />

                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {serverError && (
                            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                                {serverError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting
                                ? "Signing in..."
                                : "Sign In"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            className="font-medium text-gray-900 hover:underline"
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;