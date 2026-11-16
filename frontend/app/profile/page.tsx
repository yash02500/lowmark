"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
    UserRound,
    Mail,
    CalendarDays,
    ShieldCheck,
    ShieldAlert,
    Save,
    LoaderCircle,
    CheckCircle2,
    Sparkles,
} from "lucide-react";

import Sidebar from "@/src/components/sidebar";
import Navbar from "@/src/components/navbar";
import authService from "@/src/services/authService";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt?: string;
}

const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await authService.getMe();
                const user = response.data;

                setProfile(user);
                setName(user.name);
                setEmail(user.email);
            } catch (error: any) {
                if (error.response?.status === 401) {
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Failed to load profile"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        try {
            setSaving(true);

            const response = await authService.updateMe({
                name: name.trim(),
                email: email.trim(),
            });

            setProfile(response.data);
            setName(response.data.name);
            setEmail(response.data.email);

            setSuccess("Profile updated successfully.");
        } catch (error: any) {
            if (error.response?.status === 401) {
                return;
            }

            setError(
                error.response?.data?.message ||
                "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            setResendLoading(true);
            setError("");
            setSuccess("");

            const response = await authService.resendVerification();

            setSuccess(
                response.message ||
                "Verification email sent successfully."
            );
        } catch (error: any) {
            if (error.response?.status === 401) {
                return;
            }

            setError(
                error.response?.data?.message ||
                "Failed to resend verification email"
            );
        } finally {
            setResendLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8faf9]">
                <Sidebar />

                <div className="md:ml-64">
                    <Navbar />

                    <main className="p-4 md:p-8">
                        <div className="mx-auto max-w-5xl animate-pulse space-y-6">
                            <div className="h-8 w-40 rounded-lg bg-slate-200" />

                            <div className="grid gap-6 md:grid-cols-[280px_1fr]">
                                <div className="h-72 rounded-3xl bg-slate-200" />
                                <div className="h-96 rounded-3xl bg-slate-200" />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const initials =
        profile?.name?.trim().charAt(0).toUpperCase() || "U";

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf9]">
            <Sidebar />

            <div className="md:ml-64">
                <Navbar />

                <main className="px-4 py-6 pb-28 md:px-8 md:py-9 md:pb-10">
                    <div className="mx-auto max-w-5xl">
                        {/* Heading */}
                        <div className="mb-8">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                <UserRound size={14} />
                                Account settings
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                                My Profile
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Manage your personal information and account
                                settings.
                            </p>
                        </div>

                        {/* Feedback */}
                        {error && (
                            <div
                                role="alert"
                                className="mb-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
                            >
                                <ShieldAlert
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                />
                                <p>{error}</p>
                            </div>
                        )}

                        {success && (
                            <div
                                role="status"
                                className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700"
                            >
                                <CheckCircle2
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                />
                                <p>{success}</p>
                            </div>
                        )}

                        <div className="grid items-start gap-6 md:grid-cols-[280px_1fr]">
                            {/* Profile summary */}
                            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
                                <div className="h-24 bg-linear-to-r from-[#064e3b] to-[#10b981]" />

                                <div className="px-6 pb-6">
                                    <div className="-mt-11 flex h-22 w-22 items-center justify-center rounded-2xl border-4 border-white bg-emerald-50 text-3xl font-bold text-emerald-700 shadow-sm">
                                        {initials}
                                    </div>

                                    <h2 className="mt-4 wrap-break-word text-xl font-bold text-slate-950">
                                        {profile?.name || "User"}
                                    </h2>

                                    <p className="mt-1 break-all text-sm text-slate-500">
                                        {profile?.email}
                                    </p>

                                    <div className="mt-5 border-t border-slate-100 pt-5">
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Account status
                                        </p>

                                        {profile?.emailVerified ? (
                                            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3">
                                                <ShieldCheck
                                                    size={19}
                                                    className="text-emerald-600"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-emerald-800">
                                                        Verified
                                                    </p>
                                                    <p className="text-xs text-emerald-600">
                                                        Email verified
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl bg-amber-50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <ShieldAlert
                                                        size={19}
                                                        className="text-amber-600"
                                                    />
                                                    <p className="text-sm font-semibold text-amber-800">
                                                        Not verified
                                                    </p>
                                                </div>

                                                <p className="mt-2 text-xs leading-5 text-amber-700">
                                                    Verify your email to
                                                    secure your account.
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleResendVerification
                                                    }
                                                    disabled={resendLoading}
                                                    className="mt-3 text-xs font-bold text-amber-800 underline underline-offset-4 hover:text-amber-950 disabled:opacity-50"
                                                >
                                                    {resendLoading
                                                        ? "Sending..."
                                                        : "Resend verification email"}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                                            <CalendarDays size={17} />
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Member since
                                            </p>
                                            <p className="mt-0.5 text-sm font-semibold text-slate-700">
                                                {profile?.createdAt
                                                    ? new Date(
                                                        profile.createdAt
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "—"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Edit profile */}
                            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-8">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                        <UserRound size={21} />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-950">
                                            Personal information
                                        </h2>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Update your account details
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-7 space-y-6"
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
                                                value={name}
                                                onChange={(event) =>
                                                    setName(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Enter your name"
                                                autoComplete="name"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                                required
                                            />
                                        </div>
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
                                                value={email}
                                                onChange={(event) =>
                                                    setEmail(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Enter your email"
                                                autoComplete="email"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                                required
                                            />
                                        </div>

                                        {!profile?.emailVerified && (
                                            <p className="mt-2 text-xs text-amber-600">
                                                Your email address is not
                                                verified.
                                            </p>
                                        )}
                                    </div>

                                    {/* Save */}
                                    <div className="flex justify-end border-t border-slate-100 pt-6">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087f5b] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                        >
                                            {saving ? (
                                                <>
                                                    <LoaderCircle
                                                        size={17}
                                                        className="animate-spin"
                                                    />
                                                    Saving changes...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={17} />
                                                    Save changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;