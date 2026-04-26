"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/route", label: "Route" },
  { href: "/teams", label: "Teams" },
  { href: "/standings", label: "Standings" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={[
              "px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors rounded",
              isActive
                ? "bg-race-yellow text-race-black"
                : "text-gray-300 hover:text-race-yellow hover:bg-white/10",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
