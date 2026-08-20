"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        .min(8, "Password must be at least 8 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const router = useRouter();

    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const handleRegister = async (data: RegisterFormData) => {
        try {
            setServerError("");
            setSuccessMessage("");

            await authService.register(data);

            setSuccessMessage(
                "Registration successful. Redirecting to login..."
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
        <main>
            <h1>Create Account</h1>

            <form onSubmit={handleSubmit(handleRegister)}>
                {/* Name */}
                <div>
                    <label htmlFor="name">
                        Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        {...register("name")}
                    />

                    {errors.name && (
                        <p>{errors.name.message}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...register("email")}
                    />

                    {errors.email && (
                        <p>{errors.email.message}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        {...register("password")}
                    />

                    {errors.password && (
                        <p>{errors.password.message}</p>
                    )}
                </div>

                {/* Server error */}
                {serverError && (
                    <p>{serverError}</p>
                )}

                {/* Success */}
                {successMessage && (
                    <p>{successMessage}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? "Creating account..."
                        : "Create Account"}
                </button>
            </form>

            <p>
                Already have an account?{" "}
                <button
                    type="button"
                    onClick={() => router.push("/login")}
                >
                    Login
                </button>
            </p>
        </main>
    );
};

export default RegisterPage;