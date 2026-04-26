"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { Nav } from "./Nav";

export function Header() {
  const { data: session } = useSession();
  const runner = session?.user;

  return (
    <header className="bg-race-black text-race-white sticky top-0 z-50 border-b-4 border-race-yellow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-race-yellow font-black text-xl tracking-tight uppercase">
              Tour de Ridgewood
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Nav />
          </div>

          {/* Auth area */}
          <div className="flex items-center gap-3">
            {runner?.runnerId ? (
              <div className="flex items-center gap-2">
                {runner.image ? (
                  <Image
                    src={runner.image}
                    alt={runner.name ?? "Athlete"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-strava-orange flex items-center justify-center text-white text-xs font-bold">
                    {(runner.name ?? "?").charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-race-white hidden sm:block">
                  {runner.name}
                </span>
              </div>
            ) : (
              <button
                onClick={() => signIn("strava")}
                className="flex items-center gap-2 bg-strava-orange hover:bg-orange-600 transition-colors text-white text-sm font-semibold px-4 py-2 rounded"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                </svg>
                Connect with Strava
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
