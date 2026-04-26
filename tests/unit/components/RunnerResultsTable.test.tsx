import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RunnerResultsTable } from "@/components/results/RunnerResultsTable";

const mockResults = [
  {
    id: "result1",
    runnerId: "runner1",
    stageId: "stage1",
    elapsedSeconds: 2400,
    stravaActivityId: "abc",
    submittedAt: new Date("2026-06-01T12:00:00Z"),
    updatedAt: new Date("2026-06-01T12:00:00Z"),
    stage: { stageNumber: 1, name: "Stage 1 – Ridgewood Loop" },
  },
];

describe("RunnerResultsTable", () => {
  it("renders result rows when results are provided", () => {
    render(<RunnerResultsTable results={mockResults} />);
    expect(screen.getByText("Stage 1 – Ridgewood Loop")).toBeInTheDocument();
  });

  it("formats elapsed time correctly (40:00 for 2400 seconds)", () => {
    render(<RunnerResultsTable results={mockResults} />);
    expect(screen.getByText("40:00")).toBeInTheDocument();
  });

  it("shows empty state when results array is empty", () => {
    render(<RunnerResultsTable results={[]} />);
    expect(screen.getByText(/no results yet/i)).toBeInTheDocument();
  });

  it("renders stage number", () => {
    render(<RunnerResultsTable results={mockResults} />);
    expect(screen.getByText("Stage 1")).toBeInTheDocument();
  });
});
