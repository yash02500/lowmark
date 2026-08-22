"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import authService from "@/src/services/authService";

const VerifyEmailPage = () => {
    const searchParams = useSearchParams();

    const [status, setStatus] = useState<
        "verifying" | "success" | "error"
    >("verifying");

    const [message, setMessage] = useState(
        "Verifying your email..."
    );

    const verificationStarted = useRef<string | null>(null);

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage(
                "Verification token is missing or invalid."
            );
            return;
        }

        // Prevent duplicate verification requests
        // during React development/Strict Mode.
        if (verificationStarted.current === token) {
            return;
        }

        verificationStarted.current = token;

        const verifyEmail = async () => {
            try {
                const response =
                    await authService.verifyEmail(token);

                setStatus("success");
                setMessage(
                    response.message ||
                    "Your email has been verified successfully."
                );
            } catch (error: any) {
                setStatus("error");

                setMessage(
                    error.response?.data?.message ||
                    "Unable to verify your email. The link may be invalid or expired."
                );
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Lowmark
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Verify your email address
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
                    {status === "verifying" && (
                        <>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                                <svg
                                    className="h-7 w-7 animate-spin text-indigo-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="9"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        className="opacity-25"
                                    />
                                    <path
                                        d="M21 12a9 9 0 0 0-9-9"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            <h2 className="mt-5 text-xl font-semibold text-slate-900">
                                Verifying email
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Please wait while we verify
                                your email address.
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                                <svg
                                    className="h-7 w-7 text-green-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M5 12.5 9.5 17 19 7"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <h2 className="mt-5 text-xl font-semibold text-slate-900">
                                Email verified
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {message}
                            </p>

                            <Link
                                href="/dashboard"
                                className="mt-6 inline-block w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                            >
                                Go to Dashboard
                            </Link>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                                <svg
                                    className="h-7 w-7 text-red-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        d="M12 8v5"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                    <circle
                                        cx="12"
                                        cy="17"
                                        r="1.25"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M10.3 4.7 3.8 16a2 2 0 0 0 1.7 3h13a2 2 0 0 0 1.7-3L13.7 4.7a2 2 0 0 0-3.4 0Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>

                            <h2 className="mt-5 text-xl font-semibold text-slate-900">
                                Verification failed
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                {message}
                            </p>

                            <div className="mt-6 space-y-3">
                                <Link
                                    href="/profile"
                                    className="block w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                                >
                                    Go to Profile
                                </Link>

                                <Link
                                    href="/login"
                                    className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default VerifyEmailPage;