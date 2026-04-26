"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-race-black text-race-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-race-yellow text-6xl font-black mb-4" aria-hidden="true">
          ✕
        </div>
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-400 mb-8">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-race-yellow text-race-black font-bold px-6 py-2 rounded hover:bg-yellow-400 transition-colors uppercase tracking-wide text-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-gray-600 text-gray-300 font-medium px-6 py-2 rounded hover:bg-white/5 transition-colors text-sm"
          >
            Go Home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-gray-600">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
