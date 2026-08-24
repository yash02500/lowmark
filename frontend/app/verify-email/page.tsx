import { Suspense } from "react";

import VerifyEmailContent from "./verifyEmailContent";

const VerifyEmailPage = () => {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Lowmark
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Verify your email address
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                            <p className="text-sm text-slate-500">
                                Loading verification...
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