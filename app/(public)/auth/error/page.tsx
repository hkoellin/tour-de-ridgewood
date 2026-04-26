import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign-In Error — Tour de Ridgewood",
};

const errorMessages: Record<string, { title: string; description: string }> = {
  OAuthCallback: {
    title: "Strava authorization failed",
    description:
      "Something went wrong when returning from Strava. This can happen if you declined access or if the authorization expired. Please try again.",
  },
  OAuthAccountNotLinked: {
    title: "Account already exists",
    description:
      "An account with this email already exists using a different sign-in method.",
  },
  AccessDenied: {
    title: "Access denied",
    description:
      "You declined to grant access to your Strava account. Connecting Strava is required to submit stage results. You can still browse the route and team roster without signing in.",
  },
  Default: {
    title: "Sign-in error",
    description:
      "An unexpected error occurred during sign-in. Please try again or contact the race organizers if the problem persists.",
  },
};

interface AuthErrorPageProps {
  searchParams: { error?: string };
}

export default function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const code = searchParams.error ?? "Default";
  const { title, description } = errorMessages[code] ?? errorMessages["Default"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-race-black mb-3">{title}</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/api/auth/signin/strava"
            className="inline-flex items-center justify-center gap-2 bg-strava-orange hover:bg-orange-600 transition-colors text-white font-semibold px-6 py-3 rounded"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Try again with Strava
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
