import type { Metadata } from "next";
import Link from "next/link";
import CountdownTimer from "@/components/ui/CountdownTimer";

export const metadata: Metadata = {
  title: "Tour de Ridgewood",
  description:
    "An 8-stage running race through the streets of Ridgewood, Queens. Track performance, follow teams, and climb the general classification.",
  openGraph: {
    title: "Tour de Ridgewood",
    description:
      "An 8-stage running race through the streets of Ridgewood, Queens.",
    type: "website",
  },
};

// Configure via NEXT_PUBLIC_RACE_START_DATE env var (ISO 8601).
// Falls back to a placeholder date so the countdown is always visible.
const RACE_START_DATE =
  process.env.NEXT_PUBLIC_RACE_START_DATE ?? "2025-09-06T09:00:00-04:00";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-race-black text-race-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* decorative gradient bands */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-race-black via-gray-900 to-race-black"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 h-1 bg-race-yellow"
      />

      <div className="relative max-w-3xl w-full text-center">
        {/* location badge */}
        <div className="inline-block bg-race-yellow px-3 py-1 text-race-black text-xs font-bold uppercase tracking-[0.2em] mb-6">
          Ridgewood, Queens
        </div>

        {/* race title */}
        <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tight leading-none mb-6">
          Tour de
          <br />
          <span className="text-race-yellow">Ridgewood</span>
        </h1>

        {/* tagline */}
        <p className="text-lg text-gray-300 mb-10 max-w-lg mx-auto">
          Eight stages through the streets of Ridgewood. Track your
          performance, follow your team, and climb the general classification.
        </p>

        {/* countdown */}
        <div className="mb-10">
          <CountdownTimer targetDate={RACE_START_DATE} label="Stage 1 starts in" />
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/route"
            className="bg-race-yellow text-race-black font-bold px-8 py-3 rounded hover:bg-yellow-400 transition-colors uppercase tracking-wide"
          >
            View Route
          </Link>
          <Link
            href="/teams"
            className="border-2 border-race-white text-race-white font-bold px-8 py-3 rounded hover:bg-white/10 transition-colors uppercase tracking-wide"
          >
            View Teams
          </Link>
        </div>
      </div>
    </div>
  );
}
