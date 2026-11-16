"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    TrendingDown,
    ShieldCheck,
    LoaderCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import authService from "@/src/services/authService";

const loginSchema = z.object({
    email: z.email("Please enter a valid email"),
    password: z.string().min(7, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const router = useRouter();

    const [serverError, setServerError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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

            const { accessToken, refreshToken } = response.data;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);

            sessionStorage.removeItem("dashboardInsights");
            sessionStorage.removeItem("dashboardAttention");
            sessionStorage.removeItem("dashboardAI_cachedAt");

            router.push("/dashboard");
        } catch (error: any) {
            setServerError(
                error.response?.data?.message ||
                "Login failed. Please check your details and try again."
            );
        }
    };

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061713] px-4 py-10">
            {/* Background decoration */}
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
                                Smarter shopping starts here
                            </p>

                            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                                Your next great deal is closer than you think.
                            </h1>

                            <p className="mt-5 text-base leading-7 text-emerald-100/60">
                                Track product prices, follow price drops,
                                and know when it's the right time to buy.
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
                                    Your shopping, under control
                                </p>
                                <p className="mt-1 text-xs text-emerald-100/50">
                                    Keep your tracked products in one place.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="relative mt-8 text-xs text-emerald-100/30">
                        © {new Date().getFullYear()} LowMark. All rights reserved.
                    </p>
                </section>

                {/* Login form */}
                <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md">
                        {/* Mobile brand */}
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

                        <div>
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <LockKeyhole size={22} />
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                                Welcome back
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Sign in to continue tracking your products.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(handleLogin)}
                            className="mt-8 space-y-5"
                        >
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <Mail
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        {...register("email")}
                                        className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${errors.email
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                                                : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/10"
                                            }`}
                                    />
                                </div>

                                {errors.email && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-800"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        {...register("password")}
                                        className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${errors.password
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                                                : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/10"
                                            }`}
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

                                {errors.password && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Server error */}
                            {serverError && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {serverError}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087f5b] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#066b4d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="font-semibold text-emerald-700 transition hover:text-emerald-800"
                            >
                                Create an account
                            </Link>
                        </p>

                        <p className="mt-8 text-center text-xs leading-5 text-slate-400 lg:hidden">
                            Track prices. Buy at the right time.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default LoginPage;
