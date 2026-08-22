"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import authService from "@/src/services/authService";

const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters"),

    email: z
        .email("Please enter a valid email"),

    password: z
        .string()
        .min(7, "Password must be at least 6 characters"),
});

type RegisterFormData =
    z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const router = useRouter();

    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const handleRegister = async (
        data: RegisterFormData
    ) => {
        try {
            setServerError("");
            setSuccessMessage("");

            await authService.register(data);

            setSuccessMessage(
                "Account created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                router.push("/login");
            }, 1000);
        } catch (error: any) {
            setServerError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
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
                        Start tracking smarter today.
                    </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        Create your account
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Set up your Lowmark account
                    </p>

                    <form
                        onSubmit={handleSubmit(
                            handleRegister
                        )}
                        className="mt-6 space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                placeholder="Your name"
                                autoComplete="name"
                                {...register("name")}
                                className={`mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${errors.name
                                        ? "border-red-300 focus:border-red-500"
                                        : "border-gray-300 focus:border-gray-900"
                                    }`}
                            />

                            {errors.name && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

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
                                placeholder="Create a password"
                                autoComplete="new-password"
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

                        {successMessage && (
                            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                                {successMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting
                                ? "Creating account..."
                                : "Create Account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-gray-900 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default RegisterPage;