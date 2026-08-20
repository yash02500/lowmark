"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/src/components/sidebar";
import Navbar from "@/src/components/navbar";
import userProductService from "@/src/services/userProductService";
import {UserProduct, PriceHistory,} from "@/src/types/userProduct";

const ProductDetailPage = () => {
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const [userProduct, setUserProduct] =
        useState<UserProduct | null>(null);

    const [priceHistory, setPriceHistory] =
        useState<PriceHistory[]>([]);

    const [insight, setInsight] = useState<{
        productId: number;
        title: string;
        currentPrice: number;
        summary: string;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showUntrackConfirm, setShowUntrackConfirm] =
    useState(false);

    const [untracking, setUntracking] = useState(false);

    useEffect(() => {
        if (!id || Number.isNaN(id)) {
            setError("Invalid product");
            setLoading(false);
            return;
        }

        const fetchProductData = async () => {
            try {
                setLoading(true);
                setError("");

                // First get the tracked product
                const productResponse =
                    await userProductService.getTrackedProductById(id);

                const trackedProduct = productResponse.data;

                setUserProduct(trackedProduct);

                // Now we know the actual product ID
                const productId =
                    trackedProduct.product.id;

                // Fetch history + insight together
                const [
                    historyResponse,
                    insightResponse,
                ] = await Promise.all([
                    userProductService.getPriceHistory(
                        productId
                    ),
                    userProductService.getProductInsightById(
                        id
                    ),
                ]);

                setPriceHistory(historyResponse.data);
                setInsight(insightResponse.data);
            } catch (error: any) {
                if (error.response?.status === 401) {
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Failed to load product"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />

                <div className="md:ml-60">
                    <Navbar />

                    <main className="p-4 md:p-8">
                        <p className="text-gray-500">
                            Loading product...
                        </p>
                    </main>
                </div>
            </div>
        );
    }

    if (error || !userProduct) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />

                <div className="md:ml-60">
                    <Navbar />

                    <main className="p-4 md:p-8">
                        <button
                            onClick={() =>
                                router.push("/dashboard")
                            }
                            className="mb-6 text-sm font-medium text-gray-600 hover:text-black"
                        >
                            ← Back to Dashboard
                        </button>

                        <p className="text-red-500">
                            {error || "Product not found"}
                        </p>
                    </main>
                </div>
            </div>
        );
    }

    const product = userProduct.product;

    const prices = priceHistory.map((item) =>
        Number(item.price)
    );

    const lowestPrice =
        prices.length > 0
            ? Math.min(...prices)
            : Number(product.currentPrice);

    const highestPrice =
        prices.length > 0
            ? Math.max(...prices)
            : Number(product.currentPrice);

    const averagePrice =
        prices.length > 0
            ? prices.reduce(
                  (sum, price) => sum + price,
                  0
              ) / prices.length
            : Number(product.currentPrice);

            // Untrack product
            const handleUntrack = async () => {
                try {
                    setUntracking(true);

                    await userProductService.untrackProduct(id);

                    router.push("/dashboard");
                } catch (error: any) {
                    if (error.response?.status === 401) {
                        return;
                    }

                    setError(
                        error.response?.data?.message ||
                        "Failed to untrack product"
                    );

                    setShowUntrackConfirm(false);
                } finally {
                    setUntracking(false);
                }
            };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <div className="md:ml-60">
                <Navbar />

                <main className="p-4 pb-24 md:p-8 md:pb-8">
                    {/* Back */}
                    <button
                        onClick={() =>
                            router.push("/dashboard")
                        }
                        className="mb-6 text-sm font-medium text-gray-600 hover:text-black"
                    >
                        ← Back to Dashboard
                    </button>

                    {/* Product Header */}
                    <section className="rounded-2xl border bg-white p-5 shadow-sm md:p-8">
                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Image */}
                            <div className="flex h-72 items-center justify-center rounded-xl bg-gray-50 p-6">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <p className="text-gray-400">
                                        No image
                                    </p>
                                )}
                            </div>

                            {/* Product information */}
                            <div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600">
                                        {product.platform}
                                    </span>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            product.trackingState ===
                                            "in_stock"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {product.trackingState.replace(
                                            "_",
                                            " "
                                        )}
                                    </span>
                                </div>

                                <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
                                    {product.title}
                                </h1>

                                <div className="mt-6">
                                    <p className="text-sm text-gray-500">
                                        Current Price
                                    </p>

                                    <p className="mt-1 text-3xl font-bold">
                                        {product.currency}{" "}
                                        {Number(
                                            product.currentPrice
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <p className="text-sm text-gray-500">
                                        Target Price
                                    </p>

                                    <p className="mt-1 text-xl font-semibold">
                                        {product.currency}{" "}
                                        {Number(
                                            userProduct.targetPrice
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>
                                </div>

                                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                                    <p className="text-sm text-gray-500">
                                        Distance from target
                                    </p>

                                    <p className="mt-1 font-semibold">
                                        {product.currency}{" "}
                                        {Math.abs(
                                            Number(
                                                product.currentPrice
                                            ) -
                                            Number(
                                                userProduct.targetPrice
                                            )
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowUntrackConfirm(true)}
                                    className="mt-4 w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50">
                                    Untrack Product
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Price Statistics */}
                    <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Lowest Price
                            </p>

                            <p className="mt-2 text-xl font-bold">
                                {product.currency}{" "}
                                {lowestPrice.toLocaleString(
                                    "en-IN",
                                    {
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Highest Price
                            </p>

                            <p className="mt-2 text-xl font-bold">
                                {product.currency}{" "}
                                {highestPrice.toLocaleString(
                                    "en-IN",
                                    {
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </p>
                        </div>

                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Average Price
                            </p>

                            <p className="mt-2 text-xl font-bold">
                                {product.currency}{" "}
                                {averagePrice.toLocaleString(
                                    "en-IN",
                                    {
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </p>
                        </div>
                    </section>

                    {/* Price History */}
                    <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm md:p-8">
                        <h2 className="text-xl font-semibold">
                            Price History
                        </h2>

                        {priceHistory.length === 0 ? (
                            <p className="mt-6 text-gray-500">
                                No price history available.
                            </p>
                        ) : (
                            <PriceChart
                                priceHistory={priceHistory}
                                currency={product.currency}
                            />
                        )}
                    </section>

                    {/* AI Insight */}
                    <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm md:p-8">
                        <h2 className="text-xl font-semibold">
                            AI Insight
                        </h2>

                        <p className="mt-4 leading-7 text-gray-600">
                            {insight?.summary ||
                                "No insight available."}
                        </p>
                    </section>
                </main>
            </div>
            {showUntrackConfirm && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Untrack Product?
                        </h2>

                        <p className="mt-2 text-sm text-gray-600">
                            Are you sure you want to stop tracking this
                            product? You will no longer receive price
                            notifications for it.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowUntrackConfirm(false)
                                }
                                disabled={untracking}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUntrack}
                                disabled={untracking}
                                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {untracking
                                    ? "Untracking..."
                                    : "Yes, Untrack"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface PriceChartProps {
    priceHistory: PriceHistory[];
    currency: string;
}

const PriceChart = ({
    priceHistory,
    currency,
}: PriceChartProps) => {
    // API returns newest first.
    // Reverse it so the chart moves chronologically.
    const data = [...priceHistory].reverse();

    const prices = data.map((item) =>
        Number(item.price)
    );

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const width = 800;
    const height = 280;
    const padding = 40;

    const priceRange =
        maxPrice - minPrice || 1;

    const points = data.map((item, index) => {
        const x =
            data.length === 1
                ? width / 2
                : padding +
                  (index *
                      (width - padding * 2)) /
                      (data.length - 1);

        const y =
            height -
            padding -
            ((Number(item.price) - minPrice) /
                priceRange) *
                (height - padding * 2);

        return {
            x,
            y,
            price: Number(item.price),
            date: new Date(
                item.recordedAt
            ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
            }),
        };
    });

    const path = points
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
        )
        .join(" ");

    return (
        <div className="mt-6 overflow-x-auto">
            <div className="min-w-[600px]">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="h-auto w-full"
                >
                    <line
                        x1={padding}
                        y1={padding}
                        x2={padding}
                        y2={height - padding}
                        stroke="currentColor"
                        className="text-gray-200"
                    />

                    <line
                        x1={padding}
                        y1={height - padding}
                        x2={width - padding}
                        y2={height - padding}
                        stroke="currentColor"
                        className="text-gray-200"
                    />

                    <path
                        d={path}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-black"
                    />

                    {points.map((point, index) => (
                        <g key={index}>
                            <circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                className="fill-black"
                            />

                            <text
                                x={point.x}
                                y={height - 12}
                                textAnchor="middle"
                                className="fill-gray-500 text-[12px]"
                            >
                                {point.date}
                            </text>
                        </g>
                    ))}
                </svg>

                <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <span>
                        {currency}{" "}
                        {minPrice.toLocaleString("en-IN")}
                    </span>

                    <span>
                        {currency}{" "}
                        {maxPrice.toLocaleString("en-IN")}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;