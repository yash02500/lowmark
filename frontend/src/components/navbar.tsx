"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Navbar = () => {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        router.push("/login");
    };

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-8">            <div>
            <h2 className="text-lg font-semibold text-slate-900">
                Dashboard
            </h2>
        </div>

            <div className="flex items-center gap-4">
                <Link
                    href="/notifications"
                    className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                    <Bell size={20} />
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:block">
                        Logout
                    </span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;