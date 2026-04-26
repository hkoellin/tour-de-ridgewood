import { describe, it, expect } from "vitest";
import { StageSchema, TeamSchema, RunnerSchema } from "@/lib/validation/schemas";

describe("StageSchema", () => {
  const validStage = {
    stageNumber: 1,
    name: "Stage 1 – Ridgewood Loop",
    date: "2026-06-15",
    startLocation: "Ridgewood Ave",
    endLocation: "Town Hall",
    distanceKm: 12.5,
    stageType: "FLAT" as const,
  };

  it("accepts valid stage", () => {
    expect(StageSchema.safeParse(validStage).success).toBe(true);
  });

  it("rejects stageNumber below 1", () => {
    expect(StageSchema.safeParse({ ...validStage, stageNumber: 0 }).success).toBe(false);
  });

  it("rejects stageNumber above 8", () => {
    expect(StageSchema.safeParse({ ...validStage, stageNumber: 9 }).success).toBe(false);
  });

  it("rejects invalid stageType", () => {
    expect(StageSchema.safeParse({ ...validStage, stageType: "SPRINT" }).success).toBe(false);
  });
});

describe("TeamSchema", () => {
  it("accepts valid team", () => {
    expect(TeamSchema.safeParse({ name: "Team A", color: "#FF0000" }).success).toBe(true);
  });

  it("rejects invalid hex color (missing hash)", () => {
    expect(TeamSchema.safeParse({ name: "Team A", color: "FF0000" }).success).toBe(false);
  });

  it("rejects invalid hex color (wrong length)", () => {
    expect(TeamSchema.safeParse({ name: "Team A", color: "#FFF" }).success).toBe(false);
  });

  it("accepts valid hex colors in various casings", () => {
    expect(TeamSchema.safeParse({ name: "Team A", color: "#ffd700" }).success).toBe(true);
    expect(TeamSchema.safeParse({ name: "Team A", color: "#FFD700" }).success).toBe(true);
  });
});

describe("RunnerSchema", () => {
  it("accepts valid runner", () => {
    expect(RunnerSchema.safeParse({ name: "Alice", teamId: "clxyz123456789abcdef01234" }).success).toBe(true);
  });

  it("requires teamId", () => {
    const result = RunnerSchema.safeParse({ name: "Alice" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(RunnerSchema.safeParse({ name: "", teamId: "clxyz123456789abcdef01234" }).success).toBe(false);
  });
});
