import { describe, it, expect } from "vitest";
import { StageSchema } from "@/lib/validation/schemas";

describe("StageSchema", () => {
  const validStage = {
    stageNumber: 1,
    name: "Stage 1 – Ridgewood Loop",
    date: new Date("2026-06-01"),
    startLocation: "Onderdonk Ave, Ridgewood",
    endLocation: "Onderdonk Ave, Ridgewood",
    distanceKm: 8.5,
    stageType: "FLAT" as const,
  };

  it("accepts a valid stage", () => {
    const result = StageSchema.safeParse(validStage);
    expect(result.success).toBe(true);
  });

  it("rejects stageNumber 0", () => {
    const result = StageSchema.safeParse({ ...validStage, stageNumber: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects stageNumber 9", () => {
    const result = StageSchema.safeParse({ ...validStage, stageNumber: 9 });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const { name: _name, ...rest } = validStage;
    const result = StageSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing startLocation", () => {
    const { startLocation: _sl, ...rest } = validStage;
    const result = StageSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing stageType", () => {
    const { stageType: _st, ...rest } = validStage;
    const result = StageSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid stravaEmbedUrl pattern", () => {
    const result = StageSchema.safeParse({
      ...validStage,
      stravaEmbedUrl: "https://strava.com/routes/123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid stravaEmbedUrl for routes", () => {
    const result = StageSchema.safeParse({
      ...validStage,
      stravaEmbedUrl: "https://www.strava.com/routes/123456789/embed",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid stravaEmbedUrl for segments", () => {
    const result = StageSchema.safeParse({
      ...validStage,
      stravaEmbedUrl: "https://www.strava.com/segments/987654/embed",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative distanceKm", () => {
    const result = StageSchema.safeParse({ ...validStage, distanceKm: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects distanceKm of 0", () => {
    const result = StageSchema.safeParse({ ...validStage, distanceKm: 0 });
    expect(result.success).toBe(false);
  });
});
