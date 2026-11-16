"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
    ArrowDownRight,
    ArrowRight,
    Bell,
    ChartLine,
    CircleAlert,
    Package,
    Sparkles,
    Target,
} from "lucide-react";

import StatCard from "@/src/components/statCard";
import Sidebar from "@/src/components/sidebar";
import Navbar from "@/src/components/navbar";
import userProductService from "@/src/services/userProductService";
import {
    UserProduct,
    InsightsData,
    AttentionData,
} from "@/src/types/userProduct";

const DashboardPage = () => {
    const router = useRouter();

    const [products, setProducts] = useState<UserProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [attention, setAttention] = useState<AttentionData | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                router.replace("/login");
                return;
            }

            try {
                setLoading(true);
                setError("");

                // Always refresh tracked products.
                const productsResponse =
                    await userProductService.getTrackedProducts();

                setProducts(productsResponse.data);

                // Check cached AI dashboard data.
                const cachedInsights =
                    sessionStorage.getItem("dashboardInsights");

                const cachedAttention =
                    sessionStorage.getItem("dashboardAttention");

                const cachedAt =
                    sessionStorage.getItem("dashboardAI_cachedAt");

                const CACHE_DURATION = 30 * 60 * 1000;

                const cacheIsValid =
                    cachedAt &&
                    Date.now() - Number(cachedAt) < CACHE_DURATION;

                if (
                    cacheIsValid &&
                    cachedInsights &&
                    cachedAttention
                ) {
                    setInsights(JSON.parse(cachedInsights));
                    setAttention(JSON.parse(cachedAttention));
                    return;
                }

                // Fetch fresh AI data.
                const [
                    insightsResponse,
                    attentionResponse,
                ] = await Promise.all([
                    userProductService.getInsights(),
                    userProductService.getAttention(),
                ]);

                setInsights(insightsResponse.data);
                setAttention(attentionResponse.data);

                // Cache AI responses.
                sessionStorage.setItem(
                    "dashboardInsights",
                    JSON.stringify(insightsResponse.data)
                );

                sessionStorage.setItem(
                    "dashboardAttention",
                    JSON.stringify(attentionResponse.data)
                );

                sessionStorage.setItem(
                    "dashboardAI_cachedAt",
                    Date.now().toString()
                );
            } catch (error: any) {
                if (error.response?.status === 401) {
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Failed to load dashboard data"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router]);

    // Dashboard statistics.
    const insightProducts = insights?.products ?? [];

    const priceDropCount = insightProducts.filter(
        (product) =>
            product.priceChange !== null &&
            product.priceChange < 0
    ).length;

    const nearTargetCount = insightProducts.filter(
        (product) => product.targetStatus === "close"
    ).length;

    const targetReachedCount = insightProducts.filter(
        (product) => product.targetStatus === "reached"
    ).length;

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8faf9]">
            <Sidebar />

            <div className="md:ml-60">
                <Navbar />

                <main className="p-4 pb-24 md:p-8 md:pb-8">
                    {/* Page heading */}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-semibold text-emerald-600">
                                YOUR OVERVIEW
                            </p>

                            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                                Welcome to LowMark
                            </h1>

                            <p className="mt-2 text-sm text-slate-500 md:text-base">
                                Track prices and find the right time to buy.
                            </p>
                        </div>

                        <Link
                            href="/products"
                            className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            <Package size={17} />
                            Track Products
                        </Link>
                    </div>

                    {/* Dashboard statistics */}
                    <section className="mt-8">
                        <div className="mb-4 flex items-center gap-2">
                            <ChartLine size={19} className="text-emerald-600" />
                            <h2 className="font-bold text-slate-900">
                                Your Statistics
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                title="Tracked Products"
                                value={products.length}
                                description="Currently tracking"
                            />

                            <StatCard
                                title="Price Drops"
                                value={priceDropCount}
                                description="Lower than previous recorded price"
                            />

                            <StatCard
                                title="Near Target"
                                value={nearTargetCount}
                                description="Within 10% above your target"
                            />

                            <StatCard
                                title="Target Reached"
                                value={targetReachedCount}
                                description="At or below your target price"
                            />
                        </div>
                    </section>

                    {/* AI Insights */}
                    <section className="mt-9">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <Sparkles size={19} />
                            </div>

                            <div>
                                <h2 className="font-bold text-slate-900">
                                    AI Price Insights
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Intelligent insights about your tracked products
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:p-6">
                            {insights ? (
                                <div className="prose prose-sm prose-slate max-w-none prose-headings:text-slate-900 prose-strong:text-emerald-700">
                                    <ReactMarkdown>
                                        {insights.summary}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Sparkles
                                        size={18}
                                        className="animate-pulse text-emerald-500"
                                    />
                                    Loading your AI insights...
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Needs Attention */}
                    <section className="mt-9">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                    <CircleAlert size={19} />
                                </div>

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Needs Attention
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Products that need your attention
                                    </p>
                                </div>
                            </div>

                            {attention && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {attention.attentionItems.length} items
                                </span>
                            )}
                        </div>

                        {attention?.summary ? (
                            <div className="space-y-3">
                                {attention.attentionItems.length > 0 ? (
                                    attention.attentionItems.map(
                                        (item, index) => (
                                            <div
                                                key={`${item.productId}-${item.type}-${index}`}
                                                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                                            <Bell size={17} />
                                                        </div>

                                                        <div>
                                                            <h3 className="font-semibold text-slate-900">
                                                                {item.title}
                                                            </h3>

                                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                {item.message}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${item.priority === "high"
                                                            ? "bg-red-50 text-red-600"
                                                            : "bg-amber-50 text-amber-700"
                                                            }`}
                                                    >
                                                        {item.priority} priority
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-center">
                                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                            <Target size={21} />
                                        </div>

                                        <p className="mt-3 font-semibold text-slate-800">
                                            All caught up!
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            No products currently need attention.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
                                Loading attention items...
                            </div>
                        )}
                    </section>

                    {/* Tracked Products */}
                    <section className="mt-9">
                        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Package
                                        size={20}
                                        className="text-emerald-600"
                                    />
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Tracked Products
                                    </h2>
                                </div>

                                <p className="mt-1 text-sm text-slate-500">
                                    Keep an eye on the products you follow.
                                </p>
                            </div>

                            <span className="text-sm font-medium text-slate-500">
                                {products.length} products
                            </span>
                        </div>

                        {loading && (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                                    >
                                        <div className="h-40 rounded-xl bg-slate-100" />
                                        <div className="mt-4 h-4 w-3/4 rounded bg-slate-100" />
                                        <div className="mt-3 h-6 w-1/2 rounded bg-slate-100" />
                                        <div className="mt-5 h-9 rounded-lg bg-slate-100" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {!loading && !error && products.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-12 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                    <Package size={26} />
                                </div>

                                <h3 className="mt-4 text-lg font-bold text-slate-900">
                                    No tracked products yet
                                </h3>

                                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                    Start tracking your favourite products
                                    and LowMark will help you keep an eye
                                    on their prices.
                                </p>

                                <Link
                                    href="/products"
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                >
                                    Explore Products
                                    <ArrowRight size={17} />
                                </Link>
                            </div>
                        )}

                        {!loading && !error && products.length > 0 && (
                            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {products.map((userProduct) => {
                                    const product = userProduct.product;

                                    const currentPrice =
                                        Number(product.currentPrice);

                                    const targetPrice =
                                        Number(userProduct.targetPrice);

                                    const hasPrices =
                                        product.currentPrice !== null &&
                                        userProduct.targetPrice !== null;

                                    const distance = hasPrices
                                        ? Math.abs(currentPrice - targetPrice)
                                        : null;

                                    return (
                                        <div
                                            key={userProduct.id}
                                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5"
                                        >
                                            {/* Product image */}
                                            <div className="relative flex h-52 items-center justify-center bg-[#f8faf9] p-5">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.title}
                                                        className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                                        <Package size={35} />
                                                        <span className="text-xs">
                                                            No image available
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product information */}
                                            <div className="p-5">
                                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                                                        {product.platform}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${product.trackingState === "in_stock"
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-red-50 text-red-700"
                                                            }`}
                                                    >
                                                        {product.trackingState.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </span>
                                                </div>

                                                <h3 className="line-clamp-2 min-h-12 font-semibold leading-6 text-slate-900">
                                                    {product.title}
                                                </h3>

                                                <div className="mt-4">
                                                    <p className="text-xs font-medium text-slate-500">
                                                        Current Price
                                                    </p>

                                                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                                                        {product.currency}{" "}
                                                        {Number(
                                                            product.currentPrice
                                                        ).toLocaleString("en-IN")}
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#f8faf9] p-3">
                                                    <div>
                                                        <p className="text-xs text-slate-500">
                                                            Target Price
                                                        </p>

                                                        <p className="mt-1 font-bold text-emerald-700">
                                                            {product.currency}{" "}
                                                            {Number(
                                                                userProduct.targetPrice
                                                            ).toLocaleString("en-IN")}
                                                        </p>
                                                    </div>

                                                    {hasPrices && (
                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-500">
                                                                Difference
                                                            </p>

                                                            <p className="mt-1 flex items-center justify-end gap-1 text-sm font-semibold text-slate-700">
                                                                <ArrowDownRight
                                                                    size={15}
                                                                    className="text-emerald-600"
                                                                />
                                                                {product.currency}{" "}
                                                                {distance?.toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <Link
                                                    href={`/product/${userProduct.id}`}
                                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                                                >
                                                    View Details
                                                    <ArrowRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
