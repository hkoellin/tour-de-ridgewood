import { describe, it, expect } from "vitest";
import { calculateStandings } from "@/lib/standings/calculate";

const makeRunner = (
  id: string,
  name: string,
  teamName: string,
  results: { elapsedSeconds: number }[]
) => ({
  id,
  name,
  team: { name: teamName, color: "#FF0000" },
  results,
});

describe("calculateStandings", () => {
  it("returns empty array for empty input", () => {
    expect(calculateStandings([])).toEqual([]);
  });

  it("ranks runner with more completed stages above runner with fewer", () => {
    const runners = [
      makeRunner("r1", "Alice", "Team A", [{ elapsedSeconds: 1800 }]),
      makeRunner("r2", "Bob", "Team B", [
        { elapsedSeconds: 1800 },
        { elapsedSeconds: 2400 },
      ]),
    ];
    const standings = calculateStandings(runners);
    expect(standings[0].runnerId).toBe("r2");
    expect(standings[1].runnerId).toBe("r1");
  });

  it("sorts by totalSeconds ASC when completedStages count is equal", () => {
    const runners = [
      makeRunner("r1", "Alice", "Team A", [{ elapsedSeconds: 3600 }]),
      makeRunner("r2", "Bob", "Team B", [{ elapsedSeconds: 1800 }]),
    ];
    const standings = calculateStandings(runners);
    expect(standings[0].runnerId).toBe("r2");
    expect(standings[1].runnerId).toBe("r1");
  });

  it("tie-breaks by runner name ASC when completedStages and totalSeconds are equal", () => {
    const runners = [
      makeRunner("r1", "Zara", "Team A", [{ elapsedSeconds: 1800 }]),
      makeRunner("r2", "Alice", "Team B", [{ elapsedSeconds: 1800 }]),
    ];
    const standings = calculateStandings(runners);
    expect(standings[0].runnerId).toBe("r2"); // Alice < Zara
  });

  it("runner with 0 results appears at the end", () => {
    const runners = [
      makeRunner("r1", "Alice", "Team A", []),
      makeRunner("r2", "Bob", "Team B", [{ elapsedSeconds: 1800 }]),
    ];
    const standings = calculateStandings(runners);
    expect(standings[0].runnerId).toBe("r2");
    expect(standings[1].runnerId).toBe("r1");
  });

  it("correctly computes totalSeconds and completedStages for each runner", () => {
    const runners = [
      makeRunner("r1", "Alice", "Team A", [
        { elapsedSeconds: 1800 },
        { elapsedSeconds: 2400 },
      ]),
    ];
    const standings = calculateStandings(runners);
    expect(standings[0].completedStages).toBe(2);
    expect(standings[0].totalSeconds).toBe(4200);
  });
});
