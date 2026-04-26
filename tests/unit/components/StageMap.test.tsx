import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StageMap } from "@/components/stages/StageMap";

describe("StageMap", () => {
  it("renders an iframe when stravaEmbedUrl is provided", () => {
    render(
      <StageMap stravaEmbedUrl="https://www.strava.com/routes/123456/embed" stageName="Stage 1" />
    );
    const iframe = screen.getByTitle(/Stage 1/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://www.strava.com/routes/123456/embed");
  });

  it("renders fallback message when stravaEmbedUrl is null", () => {
    render(<StageMap stravaEmbedUrl={null} stageName="Stage 1" />);
    expect(screen.getByText(/map coming soon/i)).toBeInTheDocument();
    expect(screen.queryByRole("iframe")).not.toBeInTheDocument();
  });

  it("renders fallback message when stravaEmbedUrl is undefined", () => {
    render(<StageMap stravaEmbedUrl={undefined} stageName="Stage 1" />);
    expect(screen.getByText(/map coming soon/i)).toBeInTheDocument();
  });
});
