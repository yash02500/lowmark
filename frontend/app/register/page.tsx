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
    UserRound,
    TrendingDown,
    ShieldCheck,
    LoaderCircle,
    CheckCircle2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import authService from "@/src/services/authService";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Please enter a valid email"),
    password: z.string().min(7, "Password must be at least 7 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const router = useRouter();

    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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
                                Start your smarter shopping journey
                            </p>

                            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                                Make every purchase a smarter decision.
                            </h1>

                            <p className="mt-5 text-base leading-7 text-emerald-100/60">
                                Create your account, track your favorite
                                products, and keep an eye on prices.
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
                                    One place for your tracked products
                                </p>
                                <p className="mt-1 text-xs text-emerald-100/50">
                                    Follow prices and spot opportunities.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="relative mt-8 text-xs text-emerald-100/30">
                        © {new Date().getFullYear()} LowMark. All rights reserved.
                    </p>
                </section>

                {/* Registration form */}
                <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md">
                        {/* Mobile brand */}
                        <Link
                            href="/"
                            className="mb-9 inline-flex items-center gap-3 lg:hidden"
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
                                <UserRound size={22} />
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Join LowMark and start tracking prices.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(handleRegister)}
                            className="mt-8 space-y-5"
                        >
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Full name
                                </label>

                                <div className="relative">
                                    <UserRound
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="Your name"
                                        autoComplete="name"
                                        {...register("name")}
                                        className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${errors.name
                                                ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                                                : "border-slate-200 focus:border-emerald-400 focus:ring-emerald-500/10"
                                            }`}
                                    />
                                </div>

                                {errors.name && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

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
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <LockKeyhole
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a password"
                                        autoComplete="new-password"
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

                                <p className="mt-2 text-xs text-slate-400">
                                    Use at least 7 characters.
                                </p>
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

                            {/* Success */}
                            {successMessage && (
                                <div
                                    role="status"
                                    className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                                >
                                    <CheckCircle2
                                        size={18}
                                        className="mt-0.5 shrink-0"
                                    />
                                    <p>{successMessage}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !!successMessage}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087f5b] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#066b4d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <>
                                        <LoaderCircle
                                            size={18}
                                            className="animate-spin"
                                        />
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-semibold text-emerald-700 transition hover:text-emerald-800"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default RegisterPage;
