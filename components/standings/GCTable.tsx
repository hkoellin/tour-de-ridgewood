import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

interface Standing {
  rank: number;
  runnerId: string;
  runnerName: string;
  teamName: string;
  teamColor: string;
  completedStages: number;
  totalSeconds: number;
}

interface GCTableProps {
  standings: Standing[];
  isLoading?: boolean;
  currentRunnerId?: string | null;
  totalStages?: number;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function GCTable({ standings, isLoading, currentRunnerId, totalStages = 8 }: GCTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height="h-12" width="w-full" />
        ))}
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <EmptyState
        title="No results have been submitted yet"
        description="The standings will update as runners submit their stage results."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-xs w-10">
              #
            </th>
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-xs">
              Runner
            </th>
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-xs hidden sm:table-cell">
              Team
            </th>
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-xs text-center hidden md:table-cell">
              Stages
            </th>
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-xs text-right">
              Total Time
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((entry) => {
            const isLeader = entry.rank === 1;
            const isCurrentUser = entry.runnerId === currentRunnerId;
            const isComplete = entry.completedStages === totalStages;
            return (
              <tr
                key={entry.runnerId}
                className={`border-b border-gray-100 last:border-0 ${
                  isLeader
                    ? "bg-race-yellow/10 font-semibold"
                    : isCurrentUser
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 font-bold text-gray-400 text-xs">{entry.rank}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/teams/runners/${entry.runnerId}`}
                    className="font-semibold text-race-black hover:underline"
                  >
                    {entry.runnerName}
                  </Link>
                  {isCurrentUser && (
                    <span className="ml-1.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                      You
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.teamColor }}
                      aria-hidden="true"
                    />
                    <span className="text-gray-600">{entry.teamName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-center">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      isComplete
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {entry.completedStages}/{totalStages}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-race-black">
                  {entry.completedStages > 0 ? formatTime(entry.totalSeconds) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
