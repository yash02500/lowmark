"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/src/components/statCard";
import Sidebar from "@/src/components/sidebar";
import Navbar from "@/src/components/navbar";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import userProductService from "@/src/services/userProductService";
import { UserProduct, InsightsData, AttentionData } from "@/src/types/userProduct";

const DashboardPage = () => {
    const router = useRouter();
    const [products, setProducts] = useState<UserProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [attention, setAttention] =
    useState<AttentionData | null>(null);

 useEffect(() => {
    const fetchDashboardData = async () => {
        const accessToken =
            localStorage.getItem("accessToken");

        if (!accessToken) {
            router.replace("/login");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // Products should always be refreshed
            const productsResponse =
                await userProductService.getTrackedProducts();

            setProducts(productsResponse.data);

            // Check whether AI dashboard data is cached
            const cachedInsights =
                sessionStorage.getItem("dashboardInsights");

            const cachedAttention =
                sessionStorage.getItem("dashboardAttention");

            const cachedAt =
                sessionStorage.getItem("dashboardAI_cachedAt");

            const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

            const cacheIsValid =
                cachedAt &&
                Date.now() - Number(cachedAt) <
                    CACHE_DURATION;

            if (
                cacheIsValid &&
                cachedInsights &&
                cachedAttention
            ) {
                // Use cached AI data
                setInsights(
                    JSON.parse(cachedInsights)
                );

                setAttention(
                    JSON.parse(cachedAttention)
                );

                console.log(
                    "Using cached AI dashboard data"
                );

                return;
            }

            // Cache expired or doesn't exist.
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

            // Save AI responses in sessionStorage
            sessionStorage.setItem(
                "dashboardInsights",
                JSON.stringify(
                    insightsResponse.data
                )
            );

            sessionStorage.setItem(
                "dashboardAttention",
                JSON.stringify(
                    attentionResponse.data
                )
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

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50">
            <Sidebar />

            <div className="md:ml-60">
                <Navbar />

                <main className="p-4 pb-24 md:p-8 md:pb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                        Welcome to Lowmark
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Track prices and find the right time to buy.
                    </p>

                    {/* Stats */}
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatCard
                            title="Tracked Products"
                            value={products.length}
                            description="Currently tracking"
                        />

                        <StatCard
                            title="Price Drops"
                            value={
                                insights?.products?.filter(
                                    (product) =>
                                        product.priceChange !== null &&
                                        product.priceChange < 0
                                ).length ?? 0
                            }
                            description="Coming from price analytics"
                        />

                        <StatCard
                            title="Near Target"
                            value={
                                insights?.products?.filter(
                                    (product) =>
                                        product.targetStatus === "close"
                                ).length ?? 0
                            }
                            description="Coming from tracking analysis"
                        />
                    </div>

                    {/* Ai insight */}        
                    <section className="mt-8">
                        <h2 className="text-xl font-semibold">
                            AI Insight
                        </h2>

                        <div className="mt-4 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
                            {insights ? (
                                <div className="prose prose-slate max-w-none">
                                    <ReactMarkdown>
                                        {insights.summary}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    Loading insight...
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Attention section */}
                    <section className="mt-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Needs Attention
                            </h2>

                            {attention && (
                                <span className="text-sm text-gray-500">
                                    {attention.attentionItems.length} items
                                </span>
                            )}
                        </div>
                    {attention?.summary && (
                        <div className="mt-4 space-y-3">
                            {attention?.attentionItems.length ? (
                                attention.attentionItems.map((item, index) => (
                                    <div
                                        key={`${item.productId}-${item.type}-${index}`}
                                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                                    >
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {item.title}
                                                </h3>

                                                <p className="mt-1 text-sm text-gray-600">
                                                    {item.message}
                                                </p>
                                            </div>

                                            <span
                                                className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                                                    item.priority === "high"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >
                                                {item.priority}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-xl border bg-white p-5">
                                    <p className="text-gray-500">
                                        No products currently need attention.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    </section>

                    {/* Tracked Products */}
                    <section className="mt-8">
                        <h2 className="text-xl font-semibold">
                            Tracked Products
                        </h2>

                        {loading && (
                            <p className="mt-4 text-gray-500">
                                Loading products...
                            </p>
                        )}

                        {error && (
                            <p className="mt-4 text-red-500">
                                {error}
                            </p>
                        )}

                        {!loading &&
                            !error &&
                            products.length === 0 && (
                                <p className="mt-4 text-gray-500">
                                    You are not tracking any products yet.
                                </p>
                            )}

                        {!loading &&
                            !error &&
                            products.length > 0 && (
                                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {products.map((userProduct) => {
                                        const product =
                                            userProduct.product;

                                        return (
                                            <div
                                                key={userProduct.id}
                                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                                            >
                                                {/* Product image */}
                                                <div className="flex h-52 items-center justify-center bg-slate-50 p-4">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.title}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="text-sm text-gray-400">
                                                            No image
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product information */}
                                                <div className="p-5">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
                                                            {product.platform}
                                                        </span>

                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                product.trackingState === "in_stock"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-red-100 text-red-700"
                                                            }`}
                                                        >
                                                            {product.trackingState.replace("_", " ")}
                                                        </span>
                                                    </div>

                                                    <h3 className="line-clamp-2 min-h-12 font-semibold leading-6 text-slate-900">
                                                        {product.title}
                                                    </h3>

                                                    <div className="mt-4">
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {product.currency}{" "}
                                                            {Number(
                                                                product.currentPrice
                                                            ).toLocaleString("en-IN")}
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Target:{" "}
                                                            <span className="font-medium text-gray-700">
                                                                {product.currency}{" "}
                                                                {Number(
                                                                    userProduct.targetPrice
                                                                ).toLocaleString("en-IN")}
                                                            </span>
                                                        </p>
                                                    </div>

                                                    {/* Price difference */}
                                                    {product.currentPrice !== null &&
                                                        userProduct.targetPrice !== null && (
                                                            <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                                                <p className="text-xs text-gray-500">
                                                                    Distance from target
                                                                </p>

                                                                <p className="mt-1 font-semibold text-gray-800">
                                                                    {product.currency}{" "}
                                                                    {Math.abs(
                                                                        Number(product.currentPrice) -
                                                                        Number(userProduct.targetPrice)
                                                                    ).toLocaleString("en-IN")}
                                                                </p>
                                                            </div>
                                                        )}

                                                    <Link
                                                        href={`/product/${userProduct.id}`}
                                                        className="mt-4 block w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                                    >
                                                        View Details
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