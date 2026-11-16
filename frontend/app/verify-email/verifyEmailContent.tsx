"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    CheckCircle2,
    CircleAlert,
    LoaderCircle,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";

import authService from "@/src/services/authService";

const VerifyEmailContent = () => {
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
            setMessage("Verification token is missing or invalid.");
            return;
        }

        if (verificationStarted.current === token) {
            return;
        }

        verificationStarted.current = token;

        const verifyEmail = async () => {
            try {
                const response = await authService.verifyEmail(token);

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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061714] px-4 py-10">
            <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-xl font-black text-[#06251d] shadow-lg shadow-emerald-500/20">
                        L
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        LowMark
                    </h1>

                    <p className="mt-2 text-sm text-emerald-100/60">
                        Email verification
                    </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/6 p-7 text-center shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">
                    {status === "verifying" && (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10">
                                <LoaderCircle className="h-8 w-8 animate-spin text-emerald-400" />
                            </div>

                            <h2 className="mt-6 text-xl font-semibold text-white">
                                Verifying your email
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-emerald-100/60">
                                Please wait while we confirm your email
                                address. This should only take a moment.
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10">
                                <CheckCircle2 className="h-9 w-9 text-emerald-400" />
                            </div>

                            <h2 className="mt-6 text-xl font-semibold text-white">
                                Email verified!
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-emerald-100/60">
                                {message}
                            </p>

                            <Link
                                href="/dashboard"
                                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-semibold text-[#06251d] transition hover:bg-emerald-300"
                            >
                                Go to Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-400/10">
                                <CircleAlert className="h-9 w-9 text-rose-400" />
                            </div>

                            <h2 className="mt-6 text-xl font-semibold text-white">
                                Verification failed
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-emerald-100/60">
                                {message}
                            </p>

                            <div className="mt-7 space-y-3">
                                <Link
                                    href="/profile"
                                    className="flex w-full items-center justify-center rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-semibold text-[#06251d] transition hover:bg-emerald-300"
                                >
                                    Go to Profile
                                </Link>

                                <Link
                                    href="/login"
                                    className="block w-full rounded-xl border border-white/10 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-white/5"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-emerald-100/40">
                    <ShieldCheck className="h-4 w-4" />
                    Your account security matters to us.
                </div>
            </div>
        </main>
    );
};

export default VerifyEmailContent;
