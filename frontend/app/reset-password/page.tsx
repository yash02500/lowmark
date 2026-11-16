import { Suspense } from "react";
import ResetPasswordContent from "./resetPasswordContent";

const ResetPasswordPage = () => {
    return (
        <Suspense
            fallback={
                <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061713] px-4">
                    <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

                    <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 text-center shadow-2xl">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 3v18" />
                                <path d="M5 10l7-7 7 7" />
                            </svg>
                        </div>

                        <h1 className="mt-5 text-xl font-bold text-slate-950">
                            LowMark
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Preparing your password reset...
                        </p>

                        <div className="mx-auto mt-6 h-1.5 w-32 overflow-hidden rounded-full bg-emerald-100">
                            <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-500" />
                        </div>
                    </div>
                </main>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
};

export default ResetPasswordPage;
