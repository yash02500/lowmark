"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Bell,
    User,
    TrendingDown,
} from "lucide-react";

const navigationItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Products",
        href: "/products",
        icon: Package,
    },
    {
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
    },
    {
        label: "Profile",
        href: "/profile",
        icon: User,
    },
];

const Sidebar = () => {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-emerald-950/10 bg-[#071b17] px-5 py-7 text-white md:flex">
                {/* Brand */}
                <Link
                    href="/dashboard"
                    className="mb-12 flex items-center gap-3 px-2"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#052e24]">
                        <TrendingDown size={23} strokeWidth={2.5} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight">
                            LowMark
                        </h1>
                        <p className="text-xs text-emerald-200/60">
                            Smart price tracking
                        </p>
                    </div>
                </Link>

                {/* Navigation */}
                <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/40">
                    Workspace
                </div>

                <nav className="flex flex-col gap-2">
                    {navigationItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${active
                                        ? "bg-emerald-400 text-[#052e24] shadow-lg shadow-emerald-950/20"
                                        : "text-emerald-50/65 hover:bg-white/[0.06] hover:text-white"
                                    }`}
                            >
                                <Icon
                                    size={19}
                                    strokeWidth={active ? 2.5 : 2}
                                />

                                <span>{item.label}</span>

                                {active && (
                                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#052e24]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom note */}
                <div className="mt-auto rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.06] p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-100">
                            Stay ahead of prices
                        </span>
                    </div>

                    <p className="text-xs leading-relaxed text-emerald-100/50">
                        Track products and catch the right moment to buy.
                    </p>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[72px] items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 shadow-[0_-8px_30px_rgba(15,23,42,0.07)] backdrop-blur-xl md:hidden">
                {navigationItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-label={item.label}
                            aria-current={active ? "page" : undefined}
                            className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-2 transition ${active
                                    ? "text-emerald-700"
                                    : "text-slate-400 hover:text-slate-700"
                                }`}
                        >
                            <Icon
                                size={21}
                                strokeWidth={active ? 2.5 : 2}
                            />

                            <span className="text-[10px] font-semibold">
                                {item.label}
                            </span>

                            {active && (
                                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-emerald-500" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </>
    );
};

export default Sidebar;
