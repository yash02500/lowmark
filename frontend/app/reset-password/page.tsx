import { Suspense } from "react";

import ResetPasswordContent from "./resetPasswordContent";

const ResetPasswordPage = () => {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                    <p className="text-sm text-slate-500">
                        Loading...
                    </p>
                </main>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
};

export default ResetPasswordPage;