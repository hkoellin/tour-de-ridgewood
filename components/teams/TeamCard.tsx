import Link from "next/link";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    color: string;
    logoUrl: string | null;
    runnerCount: number;
  };
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="group block border border-gray-200 rounded-lg hover:border-race-yellow hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Color strip */}
      <div className="h-2" style={{ backgroundColor: team.color }} />

      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          {/* Color swatch */}
          <div
            className="w-4 h-4 rounded-full flex-shrink-0 border border-gray-200"
            style={{ backgroundColor: team.color }}
            aria-label={`Team color: ${team.color}`}
          />
          <h2 className="font-bold text-race-black text-lg group-hover:text-race-black">
            {team.name}
          </h2>
        </div>

        <p className="text-sm text-gray-500">
          {team.runnerCount} {team.runnerCount === 1 ? "runner" : "runners"}
        </p>
      </div>
    </Link>
  );
}
