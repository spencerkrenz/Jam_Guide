"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application Error:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-slate-950 p-4 text-center text-slate-100">
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
                <h2 className="mb-2 text-xl font-bold text-red-400">
                    Something went wrong!
                </h2>
                <p className="mb-4 font-mono text-sm text-red-200/80">
                    {error.message || "An unexpected error occurred."}
                </p>
                {error.digest && (
                    <p className="mb-4 text-xs text-slate-500">
                        Error Digest: {error.digest}
                    </p>
                )}
                <button
                    onClick={() => reset()}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                >
                    Try again
                </button>
            </div>
            <p className="text-xs text-slate-500">
                Check the browser console for more details.
            </p>
        </div>
    );
}
