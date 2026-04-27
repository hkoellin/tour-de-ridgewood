"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RouteError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 className="text-2xl font-bold text-race-white mb-3">
        Stage data unavailable
      </h1>
      <p className="text-gray-400 mb-8">
        We couldn&apos;t load the stage information. Please try again.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="bg-race-yellow text-race-black font-bold px-6 py-2 rounded hover:bg-yellow-400 transition-colors uppercase tracking-wide text-sm"
        >
          Try Again
        </button>
        <Link
          href="/route"
          className="border border-gray-600 text-gray-300 font-medium px-6 py-2 rounded hover:bg-white/5 transition-colors text-sm"
        >
          Back to Stages
        </Link>
      </div>
    </main>
  );
}
