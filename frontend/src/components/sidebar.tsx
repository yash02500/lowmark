"use client";

import Link from "next/link";
import { LayoutDashboard, Package, Bell, User } from "lucide-react";

const Sidebar = () => {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 hidden h-screen w-60 flex-col border-r border-slate-200 bg-white p-5 md:flex">
                <h1 className="mb-8 text-2xl font-bold tracking-tight text-slate-900">
                    Lowmark
                </h1>

                <nav className="flex flex-col gap-2">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>

                    <Link
                        href="/products"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <Package size={20} />
                        Products
                    </Link>

                    <Link
                        href="/notifications"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <Bell size={20} />
                        Notifications
                    </Link>

                    <Link
                        href="/profile"
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                        <User size={20} />
                        Profile
                    </Link>
                </nav>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white shadow-[0_-4px_20px_rgba(15,23,42,0.06)] md:hidden">
                <Link href="/dashboard"
                    className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                    <LayoutDashboard size={22} />
                </Link>

                <Link href="/products"
                    className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                    <Package size={22} />
                </Link>

                <Link href="/notifications"
                    className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                    <Bell size={22} />
                </Link>

                <Link href="/profile"
                    className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                    <User size={22} />
                </Link>
            </nav>
        </>
    );
};

export default Sidebar;