"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import authService from "@/src/services/authService";

const ResetPasswordContent = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"form" | "success" | "error">("form");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        event: React.SubmitEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");

        if (!token) {
            setStatus("error");
            setMessage(
                "Password reset token is missing or invalid."
            );
            return;
        }

        if (password.length < 8) {
            setStatus("error");
            setMessage(
                "Password must be at least 8 characters."
            );
            return;
        }

        if (
            password !==
            confirmPassword
        ) {
            setStatus("error");
            setMessage(
                "Passwords do not match."
            );
            return;
        }

        setLoading(true);

        try {
            const response =
                await authService.resetPassword(
                    token,
                    password
                );

            setStatus("success");

            setMessage(
                response.message ||
                "Password reset successfully."
            );
        } catch (error: any) {
            setStatus("error");

            setMessage(
                error.response?.data?.message ||
                "Unable to reset your password. The link may be invalid or expired."
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
                    {status === "success" ? (
                        <>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Password reset
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                {message}
                            </p>

                            <Link
                                href="/login"
                                className="mt-6 block w-full rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white"
                            >
                                Go to Login
                            </Link>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-slate-900">
                                Create a new password
                            </h2>

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className="mt-6 space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        New password
                                    </label>

                                    <input
                                        id="password"
                                        type="password"
                                        value={
                                            password
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setPassword(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                        minLength={
                                            8
                                        }
                                        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-slate-700"
                                    >
                                        Confirm password
                                    </label>

                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={
                                            confirmPassword
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setConfirmPassword(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                        minLength={
                                            8
                                        }
                                        className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                {message && (
                                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={
                                        loading
                                    }
                                    className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading
                                        ? "Resetting..."
                                        : "Reset Password"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ResetPasswordContent;