"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        router.push("/login");
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-8">
            <div>
                <h2 className="text-lg font-semibold">
                    Dashboard
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="rounded-full p-2 hover:bg-gray-100"
                >
                    <Bell size={20} />
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
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