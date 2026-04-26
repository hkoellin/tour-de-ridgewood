import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamCard } from "@/components/teams/TeamCard";

const mockTeam = {
  id: "team1",
  name: "Team Ridgewood",
  color: "#FFD700",
  logoUrl: null,
  runnerCount: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("TeamCard", () => {
  it("renders team name", () => {
    render(<TeamCard team={mockTeam} />);
    expect(screen.getByText("Team Ridgewood")).toBeInTheDocument();
  });

  it("renders runner count", () => {
    render(<TeamCard team={mockTeam} />);
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it("links to team detail page", () => {
    render(<TeamCard team={mockTeam} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/teams/team1");
  });

  it("renders color swatch", () => {
    render(<TeamCard team={mockTeam} />);
    // Color swatch should be in the DOM (style check)
    const colorSwatch = document.querySelector("[style*='background-color']");
    expect(colorSwatch).toBeInTheDocument();
  });
});
