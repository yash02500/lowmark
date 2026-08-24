import Link from "next/link";

const HomePage = () => {
    return (
        <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
            {/* Navbar */}
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight text-slate-900"
                    >
                        Lowmark
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/login"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-4"
                        >
                            Sign In
                        </Link>

                        <Link
                            href="/register"
                            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 sm:px-4"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-5 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                            Smarter price tracking
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                            Know the right time
                            <span className="block text-indigo-600">
                                to buy.
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                            Lowmark tracks product prices,
                            watches price changes, and helps
                            you understand when a product is
                            worth buying.
                        </p>

                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href="/register"
                                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Start Tracking
                            </Link>

                            <Link
                                href="/login"
                                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* What Lowmark does */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                        What Lowmark does
                    </p>

                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        Everything you need to track
                        prices intelligently.
                    </h2>

                    <p className="mt-4 leading-7 text-slate-600">
                        Add products you are interested in,
                        choose a target price, and let Lowmark
                        keep an eye on them.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                            📉
                        </div>

                        <h3 className="mt-5 text-lg font-semibold">
                            Price Tracking
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Track product prices and see how
                            they change over time.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                            🎯
                        </div>

                        <h3 className="mt-5 text-lg font-semibold">
                            Target Prices
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Set the price you want to pay and
                            get notified when the product
                            reaches it.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                            🧠
                        </div>

                        <h3 className="mt-5 text-lg font-semibold">
                            Price Insights
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Understand historical prices,
                            trends, and products that deserve
                            your attention.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                            🔔
                        </div>

                        <h3 className="mt-5 text-lg font-semibold">
                            Notifications
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Receive alerts for price drops,
                            target prices, stock changes, and
                            other important events.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl">
                            📊
                        </div>

                        <h3 className="mt-5 text-lg font-semibold">
                            Price History
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            View historical price data with
                            an easy-to-understand price chart.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                            🛒
                        </div>

                        <h3 className="mt-5 text-lg font-semibold">
                            Better Buying Decisions
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Stop constantly checking prices
                            and make more informed purchase
                            decisions.
                        </p>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="border-y border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                    <div className="text-center">
                        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                            How it works
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            Three simple steps
                        </h2>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                                1
                            </div>

                            <h3 className="mt-4 text-lg font-semibold">
                                Add a product
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Paste the product URL you want
                                to keep tracking.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                                2
                            </div>

                            <h3 className="mt-4 text-lg font-semibold">
                                Set your target
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Choose the price at which you
                                would like to buy.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                                3
                            </div>

                            <h3 className="mt-4 text-lg font-semibold">
                                Get notified
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Lowmark watches the product and
                                alerts you about important
                                price changes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="rounded-3xl bg-indigo-600 px-6 py-12 text-center text-white sm:px-10">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Ready to start tracking?
                    </h2>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                        Create your free Lowmark account and
                        start watching the products you care
                        about.
                    </p>

                    <Link
                        href="/register"
                        className="mt-7 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                    >
                        Create Free Account
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <p>
                        © {new Date().getFullYear()} Lowmark.
                        All rights reserved.
                    </p>

                    <div className="flex gap-4">
                        <Link
                            href="/login"
                            className="hover:text-slate-900"
                        >
                            Sign In
                        </Link>

                        <Link
                            href="/register"
                            className="hover:text-slate-900"
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