import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-race-black text-race-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-race-yellow font-black text-lg tracking-tight uppercase">
              Tour de Ridgewood
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/route" className="hover:text-race-yellow transition-colors">
              Route
            </Link>
            <Link href="/teams" className="hover:text-race-yellow transition-colors">
              Teams
            </Link>
            <Link href="/standings" className="hover:text-race-yellow transition-colors">
              Standings
            </Link>
          </nav>
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Tour de Ridgewood. Ridgewood, Queens.
          </p>
        </div>
      </div>
    </footer>
  );
}
