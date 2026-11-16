"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Link2,
    LoaderCircle,
    Package,
    Target,
    TrendingDown,
    Info,
} from "lucide-react";

import Sidebar from "@/src/components/sidebar";
import Navbar from "@/src/components/navbar";
import productService from "@/src/services/productService";
import userProductService from "@/src/services/userProductService";
import { clearDashboardAICache } from "@/src/utils/dashboardCache";

const ProductsPage = () => {
    const router = useRouter();

    const [url, setUrl] = useState("");
    const [targetPrice, setTargetPrice] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (
        event: SubmitEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!url.trim()) {
            setError("Please enter a product URL.");
            return;
        }

        try {
            const parsedUrl = new URL(url.trim());

            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                setError("Please enter a valid HTTP or HTTPS product URL.");
                return;
            }
        } catch {
            setError("Please enter a valid product URL.");
            return;
        }

        if (targetPrice.trim()) {
            const price = Number(targetPrice);

            if (!Number.isFinite(price) || price <= 0) {
                setError("Target price must be greater than 0.");
                return;
            }
        }

        try {
            setLoading(true);

            // Step 1: Create product
            const productResponse =
                await productService.createProduct(url.trim());

            const productId = productResponse.data.id;

            // Step 2: Track product for current user
            await userProductService.trackProduct(
                productId,
                targetPrice.trim()
                    ? Number(targetPrice)
                    : undefined
            );

            setSuccess("Product tracked successfully!");

            setUrl("");
            setTargetPrice("");

            // Invalidate dashboard-derived AI data
            clearDashboardAICache();

            // Return to dashboard after success
            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        } catch (error: any) {
            if (error.response?.status === 401) {
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to track this product. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8faf9]">
            <Sidebar />

            <div className="md:ml-64">
                <Navbar />

                <main className="px-4 py-6 pb-28 md:px-8 md:py-9 md:pb-10">
                    <div className="mx-auto max-w-5xl">
                        {/* Back navigation */}
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
                        >
                            <ArrowLeft size={17} />
                            Back to dashboard
                        </button>

                        {/* Heading */}
                        <div className="mb-8">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                <TrendingDown size={14} />
                                Smart price tracking
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                                Track a product
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 md:text-base">
                                Add a product from your favorite online
                                store and let LowMark watch its price for you.
                            </p>

                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                <Info className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span>
                                    Only products from supported online stores can be tracked.
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                            {/* Form */}
                            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-8">
                                <div className="mb-7 flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                        <Package size={21} />
                                    </div>

                                    <div>
                                        <h2 className="font-bold text-slate-900">
                                            Product details
                                        </h2>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            Enter the details below
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    {/* Product URL */}
                                    <div>
                                        <label
                                            htmlFor="url"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Product URL
                                        </label>

                                        <div className="relative">
                                            <Link2
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                id="url"
                                                type="url"
                                                value={url}
                                                onChange={(event) =>
                                                    setUrl(event.target.value)
                                                }
                                                placeholder="https://example.com/product"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                                disabled={loading}
                                                required
                                            />
                                        </div>

                                        <p className="mt-2 text-xs leading-5 text-slate-400">
                                            Paste the complete product link
                                            from the online store.
                                        </p>
                                    </div>

                                    {/* Target Price */}
                                    <div className="mt-6">
                                        <label
                                            htmlFor="targetPrice"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Target price{" "}
                                            <span className="font-normal text-slate-400">
                                                (Optional)
                                            </span>
                                        </label>

                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                                ₹
                                            </span>

                                            <input
                                                id="targetPrice"
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={targetPrice}
                                                onChange={(event) =>
                                                    setTargetPrice(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Enter your desired price"
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                                                disabled={loading}
                                            />
                                        </div>

                                        <p className="mt-2 text-xs leading-5 text-slate-400">
                                            We'll notify you when the product
                                            reaches your target price.
                                        </p>
                                    </div>

                                    {/* Error */}
                                    {error && (
                                        <div
                                            role="alert"
                                            className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
                                        >
                                            <span className="mt-0.5">!</span>
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    {/* Success */}
                                    {success && (
                                        <div
                                            role="status"
                                            className="mt-6 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700"
                                        >
                                            <CheckCircle2
                                                size={18}
                                                className="mt-0.5 shrink-0"
                                            />
                                            <p>{success}</p>
                                        </div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={loading || !!success}
                                        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#087f5b] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#066b4d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <>
                                                <LoaderCircle
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                                Tracking product...
                                            </>
                                        ) : success ? (
                                            <>
                                                <CheckCircle2 size={18} />
                                                Product tracked
                                            </>
                                        ) : (
                                            <>
                                                <Package size={18} />
                                                Track product
                                            </>
                                        )}
                                    </button>
                                </form>
                            </section>

                            {/* Information panel */}
                            <aside className="space-y-5">
                                <div className="overflow-hidden rounded-3xl bg-[#071b17] p-6 text-white">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                                        <Target size={23} />
                                    </div>

                                    <h3 className="text-lg font-bold">
                                        Buy at the right price
                                    </h3>

                                    <p className="mt-2 text-sm leading-6 text-emerald-100/60">
                                        Set a target price and keep an eye on
                                        price changes without checking the
                                        store every day.
                                    </p>

                                    <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-xs font-medium text-emerald-300">
                                        <TrendingDown size={15} />
                                        Smarter shopping starts here
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200/80 bg-white p-5">
                                    <h3 className="font-bold text-slate-900">
                                        How it works
                                    </h3>

                                    <div className="mt-5 space-y-5">
                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                                                1
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    Paste a product link
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                                    Add the URL from a supported
                                                    online store.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                                                2
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    Set your target price
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                                    Choose the price you want
                                                    to pay.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                                                3
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    Track price changes
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                                    Get notified when your
                                                    target price is reached.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProductsPage;
