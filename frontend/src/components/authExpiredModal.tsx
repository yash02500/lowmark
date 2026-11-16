"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, ArrowRight } from "lucide-react";

const AuthExpiredModal = () => {
    const router = useRouter();

    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleAuthExpired = () => {
            setShow(true);
        };

        window.addEventListener("auth-expired", handleAuthExpired);

        return () => {
            window.removeEventListener("auth-expired", handleAuthExpired);
        };
    }, []);

    if (!show) {
        return null;
    }

    const handleLogin = () => {
        setShow(false);
        router.push("/login");
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#020b09]/75 p-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="session-expired-title"
                className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b211b] p-7 shadow-2xl shadow-black/40 sm:p-8"
            >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10">
                    <LockKeyhole className="h-7 w-7 text-amber-400" />
                </div>

                <h2
                    id="session-expired-title"
                    className="mt-6 text-2xl font-bold tracking-tight text-white"
                >
                    Session expired
                </h2>

                <p className="mt-3 text-sm leading-6 text-emerald-100/60">
                    Your session has expired. Please log in again to
                    continue using LowMark.
                </p>

                <button
                    type="button"
                    onClick={handleLogin}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 text-sm font-semibold text-[#06251d] transition hover:bg-emerald-300"
                >
                    Log in again
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default AuthExpiredModal;
