"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/products": "My Products",
    "/notifications": "Notifications",
    "/profile": "My Profile",
};

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        router.push("/login");
    };

    const getPageTitle = () => {
        if (pageTitles[pathname]) {
            return pageTitles[pathname];
        }

        if (pathname.startsWith("/product/")) {
            return "Product Details";
        }

        return "LowMark";
    };

    return (
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl md:px-8">
            {/* Page title */}
            <div className="min-w-0">
                <h2 className="truncate text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                    {getPageTitle()}
                </h2>
                <p className="hidden text-xs text-slate-400 sm:block">
                    Monitor prices. Make smarter purchases.
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                <Link
                    href="/notifications"
                    aria-label="View notifications"
                    className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 ${pathname === "/notifications"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "bg-white"
                        }`}
                >
                    <Bell size={19} />
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-10 items-center gap-2 rounded-xl bg-[#071b17] px-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900 active:scale-[0.98]"
                >
                    <LogOut size={17} />
                    <span className="hidden sm:block">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
