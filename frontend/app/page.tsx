
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowDown,
    ArrowRight,
    Bell,
    ChartLine,
    Check,
    ChevronRight,
    CirclePlay,
    Clock3,
    Package,
    ShieldCheck,
    Sparkles,
    Tag,
    TrendingDown,
    Zap,
} from "lucide-react";
import BrandLogo from "@/src/components/brandLogo";
import authService from "@/src/services/authService";

const features = [
    {
        icon: Package,
        title: "Track Any Product",
        description:
            "Add products from supported online stores and keep their prices in one place.",
    },
    {
        icon: Bell,
        title: "Instant Price Alerts",
        description:
            "Get notified when a product drops in price or reaches your target.",
    },
    {
        icon: ChartLine,
        title: "Price History & Trends",
        description:
            "Explore historical price changes and understand how prices move.",
    },
    {
        icon: Sparkles,
        title: "Smart Insights",
        description:
            "Use price trends and insights to make more informed buying decisions.",
    },
];

const steps = [
    {
        number: "01",
        title: "Add a Product",
        description: "Paste a product link or add a product you want to track.",
    },
    {
        number: "02",
        title: "Track & Monitor",
        description: "LowMark keeps an eye on price changes for you.",
    },
    {
        number: "03",
        title: "Get Notified",
        description: "Receive an alert when the price drops or reaches your target.",
    },
];

function DashboardPreview() {
    return (
        <div className="relative mx-auto w-full max-w-172.5">
            {/* Decorative glow */}
            <div className="absolute -inset-8 rounded-full bg-emerald-500/10 blur-[90px]" />

            {/* Desktop dashboard */}
            <div className="relative rounded-2xl border border-slate-600/80 bg-[#071b1b] p-2 shadow-2xl shadow-black/50 sm:rounded-[26px] sm:p-3">

                <div className="grid min-h-85 grid-cols-[56px_minmax(0,1fr)] overflow-hidden rounded-xl bg-[#061515] sm:min-h-97.5 sm:grid-cols-[145px_minmax(0,1fr)]">
                    {/* Sidebar */}

                    {/* Sidebar */}
                    <aside className="border-r border-white/5 bg-[#061313] p-2 sm:p-4">
                        <div className="mb-8 flex items-center justify-center gap-2 text-sm font-bold text-white sm:justify-start">
                            <Tag
                                size={17}
                                className="shrink-0 fill-emerald-400 text-emerald-400"
                            />
                            <span className="hidden sm:inline">LowMark</span>
                        </div>

                        <div className="space-y-2 text-[10px] sm:text-xs">
                            <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/20 px-2 py-2.5 text-emerald-300 sm:justify-start">
                                <ChartLine size={14} className="shrink-0" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </div>

                            <div className="flex items-center justify-center gap-2 px-2 py-2 text-slate-400 sm:justify-start">
                                <Package size={14} className="shrink-0" />
                                <span className="hidden sm:inline">Products</span>
                            </div>

                            <div className="flex items-center justify-center gap-2 px-2 py-2 text-slate-400 sm:justify-start">
                                <Bell size={14} className="shrink-0" />
                                <span className="hidden sm:inline">Notifications</span>
                                <span className="ml-auto hidden rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] text-black sm:inline">
                                    3
                                </span>
                            </div>

                            <div className="flex items-center justify-center gap-2 px-2 py-2 text-slate-400 sm:justify-start">
                                <ShieldCheck size={14} className="shrink-0" />
                                <span className="hidden sm:inline">Profile</span>
                            </div>
                        </div>
                    </aside>


                    {/* Dashboard content */}
                    <div className="min-w-0 p-3 sm:p-5">
                        <div className="mb-5">
                            <p className="text-[10px] text-emerald-400 sm:text-xs">
                                YOUR OVERVIEW
                            </p>
                            <h3 className="mt-1 text-base font-bold text-white sm:text-xl">
                                Dashboard
                            </h3>
                            <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                                Keep track of your favourite products.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="rounded-xl border border-white/5 bg-[#102626] p-2.5 sm:p-3">
                                <Package size={17} className="text-emerald-400" />
                                <p className="mt-3 text-lg font-bold text-white sm:text-2xl">
                                    12
                                </p>
                                <p className="text-[9px] text-slate-400 sm:text-xs">
                                    Products
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/5 bg-[#102626] p-2.5 sm:p-3">
                                <TrendingDown size={17} className="text-emerald-400" />
                                <p className="mt-3 text-lg font-bold text-white sm:text-2xl">
                                    04
                                </p>
                                <p className="text-[9px] text-slate-400 sm:text-xs">
                                    Price Drops
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/5 bg-[#102626] p-2.5 sm:p-3">
                                <Zap size={17} className="text-emerald-400" />
                                <p className="mt-3 whitespace-nowrap text-sm font-bold text-white sm:text-2xl">
                                    ₹3,842
                                </p>
                                <p className="text-[9px] text-slate-400 sm:text-xs">
                                    Savings
                                </p>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="mt-3 rounded-xl border border-white/5 bg-[#102626] p-3 sm:mt-4 sm:p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-white sm:text-sm">
                                    Price Trend
                                </p>
                                <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-400">
                                    Last 30 days
                                </span>
                            </div>

                            <div className="relative mt-4 h-27.5 sm:h-33.75">
                                <div className="absolute inset-0 flex flex-col justify-between">
                                    {[0, 1, 2, 3].map((item) => (
                                        <div
                                            key={item}
                                            className="border-t border-dashed border-white/[0.07]"
                                        />
                                    ))}
                                </div>

                                <svg
                                    viewBox="0 0 500 125"
                                    className="relative h-full w-full overflow-visible"
                                    preserveAspectRatio="none"
                                >
                                    <defs>
                                        <linearGradient
                                            id="priceGradient"
                                            x1="0"
                                            x2="0"
                                            y1="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#10b981"
                                                stopOpacity="0.3"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#10b981"
                                                stopOpacity="0"
                                            />
                                        </linearGradient>
                                    </defs>

                                    <path
                                        d="M0 55 C30 55 35 25 75 35 S110 75 150 50 S190 22 225 48 S260 82 300 70 S350 30 375 55 S420 95 450 75 S480 62 500 68 L500 125 L0 125 Z"
                                        fill="url(#priceGradient)"
                                    />

                                    <path
                                        d="M0 55 C30 55 35 25 75 35 S110 75 150 50 S190 22 225 48 S260 82 300 70 S350 30 375 55 S420 95 450 75 S480 62 500 68"
                                        fill="none"
                                        stroke="#10d98b"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />

                                    {[0, 75, 150, 225, 300, 375, 450].map(
                                        (x, index) => {
                                            const y = [
                                                55, 35, 50, 48, 70, 55, 75,
                                            ][index];

                                            return (
                                                <circle
                                                    key={x}
                                                    cx={x}
                                                    cy={y}
                                                    r="4"
                                                    fill="#10d98b"
                                                    stroke="#102626"
                                                    strokeWidth="2"
                                                />
                                            );
                                        }
                                    )}
                                </svg>
                            </div>

                            <div className="mt-2 flex justify-between text-[9px] text-slate-500">
                                <span>01 Oct</span>
                                <span>08 Oct</span>
                                <span>15 Oct</span>
                                <span>22 Oct</span>
                                <span>30 Oct</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating notification */}

            {/* Floating notification */}
            <div className="relative mx-auto mt-4 w-full max-w-60 rounded-2xl border border-emerald-400/30 bg-[#102626] p-3 shadow-2xl shadow-black/50 sm:absolute sm:-bottom-7 sm:-right-8 sm:mt-0 sm:w-51.25 sm:max-w-none sm:p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <Bell size={19} />
                </div>

                <p className="mt-3 text-xs font-bold text-white sm:text-sm">
                    Price Drop Alert!
                </p>

                <p className="mt-1 text-[10px] leading-5 text-slate-400 sm:text-xs">
                    Sony WH-1000XM5 price has dropped.
                </p>

                <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-white sm:text-base">
                        ₹24,999
                    </span>

                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold text-emerald-400">
                        <ArrowDown size={11} />
                        18%
                    </span>
                </div>
            </div>


            <div className="absolute -left-5 top-10 hidden rounded-xl border border-white/10 bg-[#102626] p-3 shadow-xl sm:block">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                        <TrendingDown size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400">Price going down</p>
                        <p className="text-xs font-bold text-white">Great time to buy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const HomePage = () => {
    const router = useRouter();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem("accessToken");
            const refreshToken = localStorage.getItem("refreshToken");

            // No saved session: show the public homepage.
            if (!accessToken && !refreshToken) {
                setCheckingAuth(false);
                return;
            }

            try {
                await authService.getMe();
                router.replace("/dashboard");
            } catch {
                setCheckingAuth(false);
            }
        };

        checkAuth();
    }, [router]);

    if (checkingAuth) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#041514]">
                <div className="flex flex-col items-center gap-3">
                    <BrandLogo
                        iconSize="h-12 w-12"
                        textSize="text-xl"
                    />
                    <p className="text-sm font-medium text-slate-400">
                        Loading LowMark...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen overflow-hidden bg-white text-slate-900">
            {/* Hero and Navbar */}
            <section className="relative overflow-hidden bg-[#041514] text-white">
                {/* Background decoration */}
                <div className="pointer-events-none absolute -right-40 top-40 h-125 w-125 rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-72 -left-32 h-125 w-175 rounded-full bg-emerald-700/20 blur-[100px]" />

                {/* Navbar */}
                <header className="relative z-10 border-b border-white/[0.07]">
                    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:h-19 sm:gap-4 sm:px-8 lg:px-10">                        <Link href="/" className="inline-flex items-center">
                        <BrandLogo
                            iconSize="h-10 w-10 sm:h-11 sm:w-11"
                            textSize="text-xl sm:text-2xl"
                        />
                    </Link>

                        <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
                            <a href="#home" className="text-emerald-400">
                                Home
                            </a>
                            <a href="#features" className="transition hover:text-emerald-400">
                                Features
                            </a>
                            <a href="#how-it-works" className="transition hover:text-emerald-400">
                                How It Works
                            </a>
                            <a href="#about" className="transition hover:text-emerald-400">
                                About
                            </a>
                        </div>


                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <Link
                                href="/login"
                                className="whitespace-nowrap rounded-xl border border-emerald-400/40 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-400/10 sm:px-6 sm:text-sm"
                            >
                                Log In
                            </Link>

                            <Link
                                href="/register"
                                className="whitespace-nowrap rounded-xl bg-emerald-400 px-3 py-2.5 text-xs font-bold text-[#041514] transition hover:bg-emerald-300 sm:px-6 sm:text-sm"
                            >
                                Get Started
                            </Link>
                        </div>

                    </nav>
                </header>

                {/* Hero content */}
                <div
                    id="home"
                    className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-10 lg:px-10 lg:py-28"
                >
                    <div className="max-w-xl">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
                            <Tag size={15} />
                            Smart Price Tracker
                        </div>

                        <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-[58px]">
                            Track Product Prices.
                            <span className="mt-1 block">
                                Buy at the{" "}
                                <span className="text-emerald-400">
                                    Right Time.
                                </span>
                            </span>
                        </h1>

                        <p className="mt-7 max-w-lg text-base leading-8 text-slate-300 sm:text-lg">
                            Monitor prices from your favourite stores, get
                            instant alerts on price drops, and never overpay
                            again.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/register"
                                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-7 py-4 text-sm font-bold text-[#041514] shadow-lg shadow-emerald-500/10 transition hover:-translate-y-0.5 hover:bg-emerald-300"
                            >
                                Get Started for Free
                                <ArrowRight
                                    size={18}
                                    className="transition group-hover:translate-x-1"
                                />
                            </Link>

                            <a
                                href="#how-it-works"
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-500/70 px-7 py-4 text-sm font-semibold text-white transition hover:border-emerald-400 hover:bg-white/5"
                            >
                                <CirclePlay size={19} />
                                See How It Works
                            </a>
                        </div>

                        <div className="mt-9 flex flex-wrap gap-x-6 gap-y-4 text-xs font-medium text-slate-300 sm:text-sm">
                            <div className="flex items-center gap-2">
                                <Zap size={17} className="text-emerald-400" />
                                Real-time Tracking
                            </div>
                            <div className="flex items-center gap-2">
                                <Bell size={17} className="text-emerald-400" />
                                Price Drop Alerts
                            </div>
                            <div className="flex items-center gap-2">
                                <ChartLine size={17} className="text-emerald-400" />
                                Price History
                            </div>
                        </div>
                    </div>

                    <div className="relative px-2 pb-12 pt-4 sm:px-8 lg:px-0">
                        <DashboardPreview />
                    </div>
                </div>

                {/* Bottom decorative gradient */}
                <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-linear-to-t from-emerald-900/30 to-transparent" />
            </section>

            {/* Features */}
            <section
                id="features"
                className="bg-[#f8faf9] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                            Powerful Features
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            Everything You Need to{" "}
                            <span className="text-emerald-600">
                                Shop Smarter
                            </span>
                        </h2>

                        <p className="mt-4 text-base leading-7 text-slate-500">
                            Powerful tools to track prices, get alerts, and
                            make better buying decisions.
                        </p>
                    </div>

                    <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={feature.title}
                                    className="group rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-500 group-hover:text-white">
                                        <Icon size={24} />
                                    </div>

                                    <h3 className="mt-6 text-lg font-bold text-slate-900">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-slate-500">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section
                id="how-it-works"
                className="border-y border-emerald-100 bg-[#eaf8f2] px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.7fr] lg:items-center">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
                                Simple Process
                            </p>

                            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                How{" "}
                                <span className="text-emerald-600">
                                    LowMark
                                </span>{" "}
                                Works
                            </h2>

                            <p className="mt-4 max-w-sm leading-7 text-slate-600">
                                Start tracking the products you love in just
                                a few simple steps.
                            </p>

                            <Link
                                href="/register"
                                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
                            >
                                Start Tracking Now
                                <ArrowRight size={17} />
                            </Link>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            {steps.map((step, index) => (
                                <div key={step.number} className="relative">
                                    <div className="h-full rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                                            {index + 1}
                                        </div>

                                        <p className="mt-6 text-lg font-bold text-slate-900">
                                            {step.title}
                                        </p>

                                        <p className="mt-2 text-sm leading-7 text-slate-500">
                                            {step.description}
                                        </p>
                                    </div>

                                    {index !== steps.length - 1 && (
                                        <ChevronRight
                                            size={20}
                                            className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-emerald-700 md:block"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* About / benefits */}
            <section
                id="about"
                className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24"
            >
                <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                            Why LowMark?
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                            Spend smarter.
                            <span className="block text-emerald-600">
                                Save more.
                            </span>
                        </h2>

                        <p className="mt-5 max-w-lg leading-8 text-slate-500">
                            Finding the right price should not take hours of
                            checking different websites. LowMark helps you
                            follow product prices, understand trends, and
                            know when a deal is worth your attention.
                        </p>

                        <div className="mt-7 space-y-4">
                            {[
                                "Keep your tracked products organized",
                                "Set target prices that work for you",
                                "Stay informed about important price changes",
                            ].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 text-sm font-medium text-slate-700"
                                >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                        <Check size={14} />
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl bg-[#061b18] p-8 text-white sm:p-10">
                        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />

                        <div className="relative">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-400">
                                <Clock3 size={25} />
                            </div>

                            <h3 className="mt-8 text-2xl font-bold">
                                Your next smart purchase starts here.
                            </h3>

                            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                                Stop guessing when to buy. Start tracking
                                prices and make your next purchase with
                                confidence.
                            </p>

                            <Link
                                href="/register"
                                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-[#041514] transition hover:bg-emerald-300"
                            >
                                Create Your Free Account
                                <ArrowRight size={17} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-[#041514] px-5 py-20 text-center text-white sm:px-8 lg:px-10">
                <div className="mx-auto max-w-2xl">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-400">
                        <Sparkles size={27} />
                    </div>

                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Ready to shop smarter?
                    </h2>

                    <p className="mt-4 leading-7 text-slate-400">
                        Create your free LowMark account and start tracking
                        the products you care about.
                    </p>

                    <Link
                        href="/register"
                        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-8 py-4 text-sm font-bold text-[#041514] transition hover:bg-emerald-300"
                    >
                        Get Started for Free
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-[#041514] px-5 py-8 text-slate-400 sm:px-8 lg:px-10">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/" className="inline-flex items-center">
                        <BrandLogo
                            iconSize="h-9 w-9"
                            textSize="text-lg"
                        />
                    </Link>

                    <p className="text-xs">
                        © {new Date().getFullYear()} LowMark. All rights
                        reserved.
                    </p>

                    <div className="flex gap-5 text-sm">
                        <Link
                            href="/login"
                            className="transition hover:text-emerald-400"
                        >
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="transition hover:text-emerald-400"
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </footer>
        </main>
    );
};

export default HomePage;
