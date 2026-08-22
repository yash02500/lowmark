"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthExpiredModal = () => {
    const router = useRouter();

    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleAuthExpired = () => {
            setShow(true);
        };

        window.addEventListener(
            "auth-expired",
            handleAuthExpired
        );

        return () => {
            window.removeEventListener(
                "auth-expired",
                handleAuthExpired
            );
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
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="text-xl font-semibold text-gray-900">
                    Session Expired
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    Your session has expired. Please log in
                    again to continue.
                </p>

                <button
                    type="button"
                    onClick={handleLogin}
                    className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default AuthExpiredModal;