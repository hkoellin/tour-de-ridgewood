import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.fn();
vi.mock("@/lib/auth/config", () => ({ auth: mockAuth }));

const mockPrisma = {
  stage: { findUnique: vi.fn() },
  stravaToken: { findUnique: vi.fn() },
};
vi.mock("@/lib/db/prisma", () => ({ prisma: mockPrisma }));

const mockGetActivities = vi.fn();
vi.mock("@/lib/strava/activities", () => ({
  getActivitiesForStageDate: mockGetActivities,
}));

describe("GET /api/participant/activities/[stageNumber]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns activities from Strava for authenticated runner", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { runnerId: "runner1", accessToken: "tok", expiresAt: 9999999999 },
    });
    mockPrisma.stage.findUnique.mockResolvedValueOnce({
      id: "stage1",
      stageNumber: 1,
      date: new Date("2026-06-15"),
    });
    mockPrisma.stravaToken.findUnique.mockResolvedValueOnce({
      accessToken: "valid-token",
      expiresAt: new Date(9999999999000),
    });
    mockGetActivities.mockResolvedValueOnce([
      { id: 1, name: "Morning Run", type: "Run", distance: 5000, elapsed_time: 1800 },
    ]);

    const { GET } = await import(
      "@/app/api/participant/activities/[stageNumber]/route"
    );
    const req = new NextRequest(
      "http://localhost/api/participant/activities/1"
    );
    const res = await GET(req, { params: { stageNumber: "1" } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { GET } = await import(
      "@/app/api/participant/activities/[stageNumber]/route"
    );
    const req = new NextRequest(
      "http://localhost/api/participant/activities/1"
    );
    const res = await GET(req, { params: { stageNumber: "1" } });
    expect(res.status).toBe(401);
  });

  it("returns 502 when Strava is unavailable", async () => {
    mockAuth.mockResolvedValueOnce({
      user: { runnerId: "runner1", accessToken: "tok", expiresAt: 9999999999 },
    });
    mockPrisma.stage.findUnique.mockResolvedValueOnce({
      id: "stage1",
      stageNumber: 1,
      date: new Date("2026-06-15"),
    });
    mockPrisma.stravaToken.findUnique.mockResolvedValueOnce({
      accessToken: "valid-token",
      expiresAt: new Date(9999999999000),
    });
    const { StravaApiError } = await import("@/lib/errors");
    mockGetActivities.mockRejectedValueOnce(new StravaApiError("Service unavailable", 503));

    const { GET } = await import(
      "@/app/api/participant/activities/[stageNumber]/route"
    );
    const req = new NextRequest(
      "http://localhost/api/participant/activities/1"
    );
    const res = await GET(req, { params: { stageNumber: "1" } });
    expect(res.status).toBe(502);
  });
});
