"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    ExternalLink,
    TrendingDown,
    TrendingUp,
    Minus,
    Package,
    Target,
    Sparkles,
    Trash2,
    LoaderCircle,
    CheckCircle2,
    AlertCircle,
    IndianRupee,
    Pencil
} from "lucide-react";

import Sidebar from "@/src/components/sidebar";
import Navbar from "@/src/components/navbar";
import userProductService from "@/src/services/userProductService";
import { UserProduct, PriceHistory } from "@/src/types/userProduct";
import { clearDashboardAICache } from "@/src/utils/dashboardCache";

const ProductDetailPage = () => {
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const [userProduct, setUserProduct] = useState<UserProduct | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);

    const [insight, setInsight] = useState<{
        productId: number;
        title: string;
        currentPrice: number;
        summary: string;
    } | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showEditTarget, setShowEditTarget] = useState(false);
    const [newTargetPrice, setNewTargetPrice] = useState("");
    const [updatingTarget, setUpdatingTarget] = useState(false);
    const [targetError, setTargetError] = useState("");
    const [targetSuccess, setTargetSuccess] = useState("");

    const [showUntrackConfirm, setShowUntrackConfirm] = useState(false);
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

                // Fetch tracked product
                const productResponse =
                    await userProductService.getTrackedProductById(id);

                const trackedProduct = productResponse.data;

                setUserProduct(trackedProduct);

                // Fetch history and AI insight together
                const productId = trackedProduct.product.id;

                const [historyResponse, insightResponse] = await Promise.all([
                    userProductService.getPriceHistory(productId),
                    userProductService.getProductInsightById(id),
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

    const handleUpdateTargetPrice = async () => {
        const parsedTargetPrice = Number(newTargetPrice);

        if (
            !newTargetPrice.trim() ||
            !Number.isFinite(parsedTargetPrice) ||
            parsedTargetPrice <= 0
        ) {
            setTargetError("Please enter a valid target price.");
            return;
        }

        try {
            setUpdatingTarget(true);
            setTargetError("");
            setTargetSuccess("");

            const response =
                await userProductService.updateTargetPrice(
                    id,
                    parsedTargetPrice
                );

            setUserProduct(response.data);

            // Refresh cached dashboard insights.
            clearDashboardAICache();

            setShowEditTarget(false);
            setTargetSuccess("Target price updated successfully.");
        } catch (error: any) {
            if (error.response?.status === 401) {
                return;
            }

            setTargetError(
                error.response?.data?.message ||
                "Failed to update target price."
            );
        } finally {
            setUpdatingTarget(false);
        }
    };

    const handleUntrack = async () => {
        try {
            setUntracking(true);

            await userProductService.untrackProduct(id);
            clearDashboardAICache();

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

    const goBack = () => router.push("/dashboard");

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8faf9]">
                <Sidebar />
                <div className="md:ml-64">
                    <Navbar />
                    <main className="p-4 md:p-8">
                        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
                            <div className="h-5 w-36 rounded bg-slate-200" />
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="h-80 rounded-3xl bg-slate-200" />
                                <div className="h-80 rounded-3xl bg-slate-200" />
                            </div>
                            <div className="h-32 rounded-3xl bg-slate-200" />
                            <div className="h-72 rounded-3xl bg-slate-200" />
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error || !userProduct) {
        return (
            <div className="min-h-screen bg-[#f8faf9]">
                <Sidebar />
                <div className="md:ml-64">
                    <Navbar />

                    <main className="p-4 pb-28 md:p-8">
                        <div className="mx-auto max-w-3xl">
                            <button
                                type="button"
                                onClick={goBack}
                                className="mb-7 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
                            >
                                <ArrowLeft size={17} />
                                Back to dashboard
                            </button>

                            <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
                                <AlertCircle
                                    size={36}
                                    className="mx-auto text-red-500"
                                />
                                <h2 className="mt-4 text-lg font-bold text-slate-900">
                                    Unable to load product
                                </h2>
                                <p className="mt-2 text-sm text-slate-500">
                                    {error || "Product not found"}
                                </p>
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="mt-6 rounded-xl bg-[#087f5b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                                >
                                    Back to dashboard
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const product = userProduct.product;

    const prices = priceHistory
        .map((item) => Number(item.price))
        .filter((price) => Number.isFinite(price));

    const currentPrice = Number(product.currentPrice);
    const targetPrice = Number(userProduct.targetPrice);

    const lowestPrice =
        prices.length > 0 ? Math.min(...prices) : currentPrice;

    const highestPrice =
        prices.length > 0 ? Math.max(...prices) : currentPrice;

    const averagePrice =
        prices.length > 0
            ? prices.reduce((sum, price) => sum + price, 0) / prices.length
            : currentPrice;

    const distanceFromTarget = Math.abs(currentPrice - targetPrice);
    const targetReached = currentPrice <= targetPrice;

    const formatPrice = (value: number) =>
        value.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        });

    return (
        <div className="min-h-screen bg-[#f8faf9]">
            <Sidebar />

            <div className="md:ml-64">
                <Navbar />

                <main className="px-4 py-6 pb-28 md:px-8 md:py-9 md:pb-10">
                    <div className="mx-auto max-w-6xl">
                        {/* Back navigation */}
                        <button
                            type="button"
                            onClick={goBack}
                            className="mb-7 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
                        >
                            <ArrowLeft size={17} />
                            Back to dashboard
                        </button>

                        {/* Product information */}
                        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
                            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                                {/* Product image */}
                                <div className="flex min-h-70 items-center justify-center bg-[#f5f8f6] p-8 md:min-h-100">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="max-h-85 w-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-slate-300">
                                            <Package size={60} strokeWidth={1.2} />
                                            <span className="text-sm">
                                                No product image available
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Product details */}
                                <div className="flex flex-col p-6 md:p-9">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-600">
                                            {product.platform}
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${product.trackingState === "in_stock"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-red-50 text-red-600"
                                                }`}
                                        >
                                            {product.trackingState.replace("_", " ")}
                                        </span>
                                    </div>

                                    <h1 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-slate-950 md:text-3xl">
                                        {product.title}
                                    </h1>

                                    <div className="mt-8">
                                        <p className="text-sm font-medium text-slate-400">
                                            Current price
                                        </p>

                                        <p className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                                            {product.currency}{" "}
                                            {formatPrice(currentPrice)}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-emerald-50 p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 text-emerald-700">
                                                <Target size={16} />
                                                <span className="text-xs font-semibold">
                                                    Your target
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewTargetPrice(
                                                        userProduct.targetPrice?.toString() || ""
                                                    );
                                                    setTargetError("");
                                                    setTargetSuccess("");
                                                    setShowEditTarget(true);
                                                }}
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                            >
                                                <Pencil size={13} />
                                                Edit
                                            </button>
                                        </div>

                                        <p className="mt-2 text-lg font-bold text-emerald-900">
                                            {product.currency} {formatPrice(targetPrice)}
                                        </p>
                                    </div>

                                    {targetSuccess && (
                                        <p className="mt-3 text-sm font-medium text-emerald-700">
                                            {targetSuccess}
                                        </p>
                                    )}

                                    <div
                                        className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${targetReached
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-amber-50 text-amber-700"
                                            }`}
                                    >
                                        {targetReached ? (
                                            <CheckCircle2
                                                size={18}
                                                className="mt-0.5 shrink-0"
                                            />
                                        ) : (
                                            <Target
                                                size={18}
                                                className="mt-0.5 shrink-0"
                                            />
                                        )}

                                        <p>
                                            {targetReached
                                                ? "Great! The current price has reached your target."
                                                : "The current price is still above your target price."}
                                        </p>
                                    </div>

                                    <div className="mt-auto flex flex-wrap gap-3 pt-7">
                                        {product.url && (
                                            <a
                                                href={product.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#087f5b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                            >
                                                View store
                                                <ExternalLink size={16} />
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowUntrackConfirm(true)
                                            }
                                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                            Untrack
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Price statistics */}
                        <section className="mt-6 grid gap-4 sm:grid-cols-3">
                            <StatCard
                                title="Lowest price"
                                value={`${product.currency} ${formatPrice(lowestPrice)}`}
                                icon={<TrendingDown size={19} />}
                                color="emerald"
                            />

                            <StatCard
                                title="Highest price"
                                value={`${product.currency} ${formatPrice(highestPrice)}`}
                                icon={<TrendingUp size={19} />}
                                color="rose"
                            />

                            <StatCard
                                title="Average price"
                                value={`${product.currency} ${formatPrice(averagePrice)}`}
                                icon={<Minus size={19} />}
                                color="blue"
                            />
                        </section>

                        {/* Price history */}
                        <section className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-8">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-950">
                                        Price history
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Historical price movements for this product
                                    </p>
                                </div>

                                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                    {priceHistory.length} records
                                </span>
                            </div>

                            {priceHistory.length === 0 ? (
                                <div className="py-16 text-center">
                                    <TrendingDown
                                        size={35}
                                        className="mx-auto text-slate-300"
                                    />
                                    <p className="mt-3 text-sm font-medium text-slate-600">
                                        No price history available yet
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Price information will appear here when available.
                                    </p>
                                </div>
                            ) : (
                                <PriceChart
                                    priceHistory={priceHistory}
                                    currency={product.currency}
                                />
                            )}
                        </section>

                        {/* AI Insight */}
                        <section className="mt-6 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
                            <div className="flex items-center gap-3 border-b border-emerald-50 bg-emerald-50/60 px-5 py-5 md:px-8">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                    <Sparkles size={20} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-950">
                                        AI price insight
                                    </h2>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Smart analysis for your product
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 md:p-8">
                                <p className="text-sm leading-7 text-slate-600">
                                    {insight?.summary ||
                                        "No insight is available for this product yet."}
                                </p>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* Edit target price modal */}
            {showEditTarget && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-target-title"
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-7"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <Target size={22} />
                        </div>

                        <h2
                            id="edit-target-title"
                            className="mt-5 text-xl font-bold text-slate-950"
                        >
                            Edit target price
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Set the price at which you would like to buy this product.
                        </p>

                        <label
                            htmlFor="targetPrice"
                            className="mt-5 block text-sm font-semibold text-slate-700"
                        >
                            Target price ({product.currency})
                        </label>

                        <input
                            id="targetPrice"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={newTargetPrice}
                            onChange={(e) => setNewTargetPrice(e.target.value)}
                            placeholder="Enter target price"
                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />

                        {targetError && (
                            <p className="mt-2 text-sm text-red-600">
                                {targetError}
                            </p>
                        )}

                        <div className="mt-7 flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowEditTarget(false);
                                    setTargetError("");
                                }}
                                disabled={updatingTarget}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUpdateTargetPrice}
                                disabled={updatingTarget}
                                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {updatingTarget ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Saving...
                                    </span>
                                ) : (
                                    "Save target"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Untrack confirmation modal */}
            {showUntrackConfirm && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="untrack-title"
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-7"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                            <Trash2 size={22} />
                        </div>

                        <h2
                            id="untrack-title"
                            className="mt-5 text-xl font-bold text-slate-950"
                        >
                            Stop tracking this product?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            You will no longer receive price notifications
                            for this product. Are you sure you want to continue?
                        </p>

                        <div className="mt-7 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowUntrackConfirm(false)}
                                disabled={untracking}
                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleUntrack}
                                disabled={untracking}
                                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {untracking ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <LoaderCircle
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Untracking...
                                    </span>
                                ) : (
                                    "Yes, untrack"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: "emerald" | "rose" | "blue";
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-600",
        rose: "bg-rose-50 text-rose-600",
        blue: "bg-blue-50 text-blue-600",
    };

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
                >
                    {icon}
                </div>
            </div>

            <p className="mt-4 wrap-break-word text-2xl font-bold tracking-tight text-slate-950">
                {value}
            </p>
        </div>
    );
};

interface PriceChartProps {
    priceHistory: PriceHistory[];
    currency: string;
}

const PriceChart = ({ priceHistory, currency }: PriceChartProps) => {
    // API returns newest first. Reverse for chronological display.
    const data = [...priceHistory].reverse();

    const prices = data
        .map((item) => Number(item.price))
        .filter((price) => Number.isFinite(price));

    if (prices.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-slate-400">
                No valid price records available.
            </p>
        );
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const width = 800;
    const height = 300;
    const padding = 48;

    const priceRange = maxPrice - minPrice || 1;

    const points = data.map((item, index) => {
        const price = Number(item.price);

        const x =
            data.length === 1
                ? width / 2
                : padding +
                (index * (width - padding * 2)) / (data.length - 1);

        const y =
            height -
            padding -
            ((price - minPrice) / priceRange) *
            (height - padding * 2);

        return {
            x,
            y,
            price,
            date: new Date(item.recordedAt).toLocaleDateString("en-IN", {
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

    const areaPath = `${path} L ${points[points.length - 1].x} ${height - padding
        } L ${points[0].x} ${height - padding} Z`;

    return (
        <div className="mt-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <span>
                    Lowest: {currency}{" "}
                    {minPrice.toLocaleString("en-IN")}
                </span>
                <span>
                    Highest: {currency}{" "}
                    {maxPrice.toLocaleString("en-IN")}
                </span>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-130">
                    <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="h-auto w-full overflow-visible"
                        role="img"
                        aria-label="Product price history chart"
                    >
                        <defs>
                            <linearGradient
                                id="priceAreaGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor="#10b981"
                                    stopOpacity="0.2"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#10b981"
                                    stopOpacity="0"
                                />
                            </linearGradient>
                        </defs>

                        {[0, 1, 2, 3].map((line) => {
                            const y =
                                padding +
                                (line * (height - padding * 2)) / 3;

                            return (
                                <line
                                    key={line}
                                    x1={padding}
                                    y1={y}
                                    x2={width - padding}
                                    y2={y}
                                    stroke="#e2e8f0"
                                    strokeDasharray="4 6"
                                />
                            );
                        })}

                        <path d={areaPath} fill="url(#priceAreaGradient)" />

                        <path
                            d={path}
                            fill="none"
                            stroke="#059669"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {points.map((point, index) => (
                            <g key={`${point.date}-${index}`}>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="5"
                                    fill="#ffffff"
                                    stroke="#059669"
                                    strokeWidth="3"
                                />

                                <text
                                    x={point.x}
                                    y={height - 13}
                                    textAnchor="middle"
                                    fill="#94a3b8"
                                    fontSize="12"
                                >
                                    {point.date}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
