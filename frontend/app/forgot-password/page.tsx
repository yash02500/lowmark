"use client";

import { useState } from "react";
import Link from "next/link";

import authService from "@/src/services/authService";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await authService.forgotPassword(email);

            setMessage(
                response.message ||
                "If an account exists for that email, a password reset link has been sent."
            );
        } catch (error: any) {
            setError(
                error.response?.data?.message ||
                "Unable to process your request."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Lowmark
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Reset your password
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Forgot password?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        Enter your email address and
                        we'll send you a password reset
                        link if an account exists.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target
                                            .value
                                    )
                                }
                                required
                                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        {message && (
                            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Sending..."
                                : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;