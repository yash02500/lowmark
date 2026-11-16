import { Suspense } from "react";
import VerifyEmailContent from "./verifyEmailContent";

const VerifyEmailPage = () => {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-[#061714] px-4 py-8">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-xl font-black text-[#06251d]">
                                L
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                LowMark
                            </h1>

                            <p className="mt-2 text-sm text-emerald-100/60">
                                Verify your email address
                            </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/6 p-8 text-center shadow-xl shadow-black/10 backdrop-blur">
                            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/20 border-t-emerald-400" />

                            <p className="text-sm font-medium text-white">
                                Loading verification...
                            </p>

                            <p className="mt-2 text-xs text-emerald-100/50">
                                Please wait while we verify your request.
                            </p>
                        </div>
                    </div>
                </main>
            }
        >
            <VerifyEmailContent />
        </Suspense>
    );
};

export default VerifyEmailPage;
