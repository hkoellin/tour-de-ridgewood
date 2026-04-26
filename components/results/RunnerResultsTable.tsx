import { EmptyState } from "@/components/ui/EmptyState";

interface Result {
  id: string;
  elapsedSeconds: number;
  submittedAt: Date | string;
  updatedAt: Date | string;
  stage: { stageNumber: number; name: string };
}

interface RunnerResultsTableProps {
  results: Result[];
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function RunnerResultsTable({ results }: RunnerResultsTableProps) {
  if (results.length === 0) {
    return (
      <EmptyState
        title="No results yet"
        description="This runner hasn't submitted any stage results yet."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-xs">
              Stage
            </th>
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-xs text-right">
              Time
            </th>
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-xs text-right">
              Submitted
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3">
                <span className="font-semibold text-race-black">Stage {result.stage.stageNumber}</span>
                <span className="text-gray-500 ml-2 text-xs hidden sm:inline">
                  {result.stage.name}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-race-black">
                {formatTime(result.elapsedSeconds)}
              </td>
              <td className="px-4 py-3 text-right text-gray-500">
                {new Date(result.submittedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
