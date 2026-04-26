export interface RunnerWithResults {
  id: string;
  name: string;
  team: { name: string; color: string };
  results: { elapsedSeconds: number }[];
}

export interface Standing {
  rank: number;
  runnerId: string;
  runnerName: string;
  teamName: string;
  teamColor: string;
  completedStages: number;
  totalSeconds: number;
}

/**
 * Pure function: computes standings from runners with results.
 * Sort order: completedStages DESC → totalSeconds ASC → name ASC
 */
export function calculateStandings(runners: RunnerWithResults[]): Standing[] {
  const mapped = runners.map((runner) => ({
    runnerId: runner.id,
    runnerName: runner.name,
    teamName: runner.team.name,
    teamColor: runner.team.color,
    completedStages: runner.results.length,
    totalSeconds: runner.results.reduce((sum, r) => sum + r.elapsedSeconds, 0),
  }));

  mapped.sort((a, b) => {
    if (b.completedStages !== a.completedStages) return b.completedStages - a.completedStages;
    if (a.totalSeconds !== b.totalSeconds) return a.totalSeconds - b.totalSeconds;
    return a.runnerName.localeCompare(b.runnerName);
  });

  return mapped.map((entry, index) => ({ ...entry, rank: index + 1 }));
}
