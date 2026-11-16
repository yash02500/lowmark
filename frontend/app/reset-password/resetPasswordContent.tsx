"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Eye,
    EyeOff,
    LockKeyhole,
    LoaderCircle,
    ShieldCheck,
    TrendingDown,
} from "lucide-react";

import authService from "@/src/services/authService";

const ResetPasswordContent = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [status, setStatus] = useState<"form" | "success" | "error">("form");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");

        if (!token) {
            setStatus("error");
            setMessage("Password reset token is missing or invalid.");
            return;
        }

        if (password.length < 8) {
            setStatus("error");
            setMessage("Password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setStatus("error");
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await authService.resetPassword(
                token,
                password
            );

            setStatus("success");
            setMessage(
                response.message || "Password reset successfully."
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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061713] px-4 py-10">
            <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl shadow-black/30 lg:grid-cols-2">
                {/* Brand panel */}
                <section className="relative hidden flex-col justify-between overflow-hidden bg-[#092a20] p-10 text-white lg:flex xl:p-12">
                    <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full border border-emerald-300/10" />
                    <div className="pointer-events-none absolute -right-12 top-36 h-48 w-48 rounded-full border border-emerald-300/10" />

                    <div className="relative">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-[#052e24]">
                                <TrendingDown size={24} strokeWidth={2.5} />
                            </div>

                            <span className="text-2xl font-bold tracking-tight">
                                LowMark
                            </span>
                        </Link>

                        <div className="mt-24 max-w-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                                Secure account recovery
                            </p>

                            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                                A fresh start for your account.
                            </h1>

                            <p className="mt-5 text-base leading-7 text-emerald-100/60">
                                Create a new password and get back to
                                tracking prices and finding better deals.
                            </p>
                        </div>
                    </div>

                    <div className="relative mt-16 rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                                <ShieldCheck size={21} />
                            </div>

                            <div>
                                <p className="text-sm font-semibold">
                                    Keep your account secure
                                </p>
                                <p className="mt-1 text-xs text-emerald-100/50">
                                    Choose a password you haven't used before.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="relative mt-8 text-xs text-emerald-100/30">
                        © {new Date().getFullYear()} LowMark. All rights reserved.
                    </p>
                </section>

                {/* Reset password form */}
                <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md">
                        <Link
                            href="/"
                            className="mb-10 inline-flex items-center gap-3 lg:hidden"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <TrendingDown size={22} />
                            </div>

                            <span className="text-xl font-bold tracking-tight text-slate-950">
                                LowMark
                            </span>
                        </Link>

                        {status === "success" ? (
                            <div>
                                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 size={28} />
                                </div>

                                <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                                    Password updated!
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    {message}
                                </p>

                                <Link
                                    href="/login"
                                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#087f5b] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#066b4d]"
                                >
                                    Go to login
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                        <LockKeyhole size={22} />
                                    </div>

                                    <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                                        Create a new password
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                        Enter your new password below.
                                        Make sure both password fields match.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-8 space-y-5"
                                >
                                    {/* New password */}
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            New password
                                        </label>

                                        <div className="relative">
                                            <LockKeyhole
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={password}
                                                onChange={(event) => {
                                                    setPassword(event.target.value);
                                                    setStatus("form");
                                                    setMessage("");
                                                }}
                                                placeholder="Enter new password"
                                                autoComplete="new-password"
                                                required
                                                minLength={8}
                                                disabled={loading}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((current) => !current)
                                                }
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>

                                        <p className="mt-2 text-xs text-slate-400">
                                            Use at least 8 characters.
                                        </p>
                                    </div>

                                    {/* Confirm password */}
                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Confirm new password
                                        </label>

                                        <div className="relative">
                                            <LockKeyhole
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="confirmPassword"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={confirmPassword}
                                                onChange={(event) => {
                                                    setConfirmPassword(event.target.value);
                                                    setStatus("form");
                                                    setMessage("");
                                                }}
                                                placeholder="Confirm new password"
                                                autoComplete="new-password"
                                                required
                                                minLength={8}
                                                disabled={loading}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:opacity-60"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword((current) => !current)
                                                }
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide confirm password"
                                                        : "Show confirm password"
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={18} />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {message && status === "error" && (
                                        <div
                                            role="alert"
                                            className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
                                        >
                                            {message}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087f5b] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#066b4d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <LoaderCircle
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                                Resetting password...
                                            </>
                                        ) : (
                                            <>
                                                Reset password
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        <div className="mt-8 border-t border-slate-100 pt-6">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                            >
                                <ArrowLeft size={16} />
                                Back to login
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ResetPasswordContent;
