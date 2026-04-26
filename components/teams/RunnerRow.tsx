import Link from "next/link";

interface RunnerRowProps {
  runner: {
    id: string;
    name: string;
    stravaLinked: boolean;
  };
  teamColor: string;
  highlighted?: boolean;
}

export function RunnerRow({ runner, teamColor, highlighted = false }: RunnerRowProps) {
  return (
    <Link
      href={`/teams/runners/${runner.id}`}
      className={[
        "flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors",
        highlighted ? "bg-yellow-50 font-bold" : "",
      ].join(" ")}
    >
      {/* Team color dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: teamColor }}
        aria-hidden="true"
      />

      <span className={["flex-1 text-sm", highlighted ? "font-bold text-race-black" : "text-gray-800"].join(" ")}>
        {runner.name}
        {highlighted && <span className="ml-2 text-xs bg-race-yellow text-race-black px-1.5 py-0.5 rounded font-bold">You</span>}
      </span>

      {runner.stravaLinked && (
        <span className="flex items-center gap-1 text-xs font-semibold text-strava-orange">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" aria-hidden="true">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          Strava
        </span>
      )}
    </Link>
  );
}
