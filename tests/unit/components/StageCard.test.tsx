import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StageCard } from "@/components/stages/StageCard";

const mockStage = {
  id: "clxyz1",
  stageNumber: 1,
  name: "Stage 1 – Ridgewood Loop",
  date: new Date("2026-06-01"),
  startLocation: "Onderdonk Ave, Ridgewood",
  endLocation: "Forest Ave, Ridgewood",
  distanceKm: 8.5,
  elevationDescription: null,
  stageType: "FLAT" as const,
  description: null,
  stravaEmbedUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("StageCard", () => {
  it("renders stage number", () => {
    render(<StageCard stage={mockStage} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders stage name", () => {
    render(<StageCard stage={mockStage} />);
    expect(screen.getByText("Stage 1 – Ridgewood Loop")).toBeInTheDocument();
  });

  it("renders start and end locations", () => {
    render(<StageCard stage={mockStage} />);
    expect(screen.getByText(/Onderdonk Ave/)).toBeInTheDocument();
    expect(screen.getByText(/Forest Ave/)).toBeInTheDocument();
  });

  it("renders stage type badge", () => {
    render(<StageCard stage={mockStage} />);
    expect(screen.getByText(/FLAT/i)).toBeInTheDocument();
  });

  it("links to correct detail URL", () => {
    render(<StageCard stage={mockStage} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/route/1");
  });

  it("renders distance", () => {
    render(<StageCard stage={mockStage} />);
    expect(screen.getByText(/8\.5/)).toBeInTheDocument();
  });
});
