"use client";

import { useEffect, useState } from "react";

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
    const [profile, setProfile] =
        useState<UserProfile | null>(null);

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

                const response =
                    await authService.getMe();

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

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (!name.trim()) {
                setError("Name is required");
                return;
            }

            if (!email.trim()) {
                setError("Email is required");
                return;
            }

            const response =
                await authService.updateMe({
                    name: name.trim(),
                    email: email.trim(),
                });

            setProfile(response.data);

            setName(response.data.name);
            setEmail(response.data.email);

            setSuccess(
                "Profile updated successfully."
            );
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

            const response =
                await authService.resendVerification();

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
            <div className="min-h-screen bg-slate-50">
                <Sidebar />

                <div className="md:ml-60">
                    <Navbar />

                    <main className="p-4 pb-24 md:p-8 md:pb-8">
                        <p className="text-slate-500">
                            Loading profile...
                        </p>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">
            <Sidebar />

            <div className="md:ml-60">
                <Navbar />

                <main className="p-4 pb-24 md:p-8 md:pb-8">
                    <div className="mx-auto max-w-3xl">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                            Profile
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Manage your Lowmark account
                            information.
                        </p>

                        {error && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        <div className="mt-8 grid gap-6 md:grid-cols-[220px_1fr]">
                            {/* Profile summary */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
                                    {profile?.name
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                </div>

                                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                                    {profile?.name}
                                </h2>

                                <p className="mt-1 break-all text-sm text-slate-500">
                                    {profile?.email}
                                </p>

                                <div className="mt-5">
                                    {profile?.emailVerified ? (
                                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                            ✓ Email verified
                                        </span>
                                    ) : (
                                        <div className="mt-3">
                                            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                                                ⚠ Email not verified
                                            </span>

                                            <button
                                                type="button"
                                                onClick={handleResendVerification}
                                                disabled={resendLoading}
                                                className="mt-3 block text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {resendLoading
                                                    ? "Sending..."
                                                    : "Resend verification email"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Edit profile */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Account information
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Update your name or email
                                    address.
                                </p>

                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-6 space-y-5"
                                >
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-slate-700"
                                        >
                                            Name
                                        </label>

                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(event) =>
                                                setName(
                                                    event.target
                                                        .value
                                                )
                                            }
                                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-600"
                                        />
                                    </div>

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
                                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-600"
                                        />

                                        {!profile?.emailVerified && (
                                            <p className="mt-2 text-xs text-amber-600">
                                                Your email is not
                                                verified.
                                            </p>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-100 pt-5">
                                        <p className="text-xs text-slate-500">
                                            Member since
                                        </p>

                                        <p className="mt-1 text-sm font-medium text-slate-700">
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

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;