import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RunnerRow } from "@/components/teams/RunnerRow";

const mockRunner = {
  id: "runner1",
  name: "Jane Doe",
  teamId: "team1",
  stravaLinked: true,
  stravaAthleteId: "12345",
  stravaHandle: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("RunnerRow", () => {
  it("renders runner name", () => {
    render(<RunnerRow runner={mockRunner} teamColor="#FFD700" />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("shows Strava linked badge when stravaLinked is true", () => {
    render(<RunnerRow runner={mockRunner} teamColor="#FFD700" />);
    expect(screen.getByText(/strava/i)).toBeInTheDocument();
  });

  it("does not show Strava badge when stravaLinked is false", () => {
    render(<RunnerRow runner={{ ...mockRunner, stravaLinked: false }} teamColor="#FFD700" />);
    expect(screen.queryByText(/strava/i)).not.toBeInTheDocument();
  });

  it("links to runner profile page", () => {
    render(<RunnerRow runner={mockRunner} teamColor="#FFD700" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/teams/runners/runner1");
  });
});
