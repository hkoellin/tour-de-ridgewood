"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const ADMIN_NAV = [
  { href: "/admin/stages", label: "Stages" },
  { href: "/admin/teams", label: "Teams" },
  { href: "/admin/runners", label: "Runners" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-race-black text-white flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="text-race-yellow font-black text-sm uppercase tracking-tight">
            Tour de Ridgewood
          </Link>
          <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_NAV.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-2 rounded text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-race-yellow text-race-black"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
