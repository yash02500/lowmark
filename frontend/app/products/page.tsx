"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
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
            setError("Please enter a product URL");
            return;
        }

        if (
            targetPrice.trim() &&
            Number(targetPrice) <= 0
        ) {
            setError("Target price must be greater than 0");
            return;
        }

        try {
            setLoading(true);

            // Step 1: Create product
            const productResponse =
                await productService.createProduct(
                    url.trim()
                );

            const productId = productResponse.data.id;

            // Step 2: Track product for current user
            await userProductService.trackProduct(
                productId,
                targetPrice.trim()
                    ? Number(targetPrice)
                    : undefined
            );

            setSuccess(
                "Product tracked successfully!"
            );

            setUrl("");
            setTargetPrice("");

            // Invalidate dashboard-derived AI data
            clearDashboardAICache();

            // Go back to dashboard
            setTimeout(() => {
                router.push("/dashboard");
            }, 800);
        } catch (error: any) {
            if (error.response?.status === 401) {
                return;
            }

            setError(
                error.response?.data?.message ||
                "Failed to track product"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <div className="md:ml-60">
                <Navbar />

                <main className="p-4 pb-24 md:p-8 md:pb-8">
                    <div className="mx-auto max-w-2xl">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Track a Product
                        </h1>

                        <p className="mt-2 text-gray-600">
                            Add a product URL and set the price
                            you want to pay.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8"
                        >
                            {/* Product URL */}
                            <div>
                                <label
                                    htmlFor="url"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Product URL
                                </label>

                                <input
                                    id="url"
                                    type="url"
                                    value={url}
                                    onChange={(event) =>
                                        setUrl(
                                            event.target.value
                                        )
                                    }
                                    placeholder="https://www.shopatlowmark.in/..."
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                                    disabled={loading}
                                />
                            </div>

                            {/* Target price */}
                            <div className="mt-5">
                                <label
                                    htmlFor="targetPrice"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Target Price
                                </label>

                                <input
                                    id="targetPrice"
                                    type="number"
                                    min="1"
                                    value={targetPrice}
                                    onChange={(event) =>
                                        setTargetPrice(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter target price"
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                                    disabled={loading}
                                />

                                <p className="mt-2 text-xs text-gray-500">
                                    We'll notify you when the
                                    product reaches your target
                                    price.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {/* Success */}
                            {success && (
                                <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                                    {success}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Tracking Product..."
                                    : "Track Product"}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProductsPage;