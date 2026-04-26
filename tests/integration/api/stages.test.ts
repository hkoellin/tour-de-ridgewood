/**
 * Integration tests for Stage API routes.
 * These tests use a mock of the Prisma client.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Prisma client before any imports
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    stage: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { GET as getStages } from "@/app/api/stages/route";
import { GET as getStage } from "@/app/api/stages/[stageNumber]/route";
import { NextRequest } from "next/server";

const mockStage = {
  id: "clxyz1",
  stageNumber: 1,
  name: "Stage 1 – Ridgewood Loop",
  date: new Date("2026-06-01"),
  startLocation: "Onderdonk Ave",
  endLocation: "Onderdonk Ave",
  distanceKm: 8.5,
  elevationDescription: null,
  stageType: "FLAT" as const,
  description: "The opening loop",
  stravaEmbedUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GET /api/stages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all stages ordered by stageNumber", async () => {
    vi.mocked(prisma.stage.findMany).mockResolvedValue([mockStage]);

    const req = new NextRequest("http://localhost:3000/api/stages");
    const res = await getStages(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    expect(data[0].stageNumber).toBe(1);
    expect(vi.mocked(prisma.stage.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { stageNumber: "asc" } })
    );
  });
});

describe("GET /api/stages/[stageNumber]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a single stage by stageNumber", async () => {
    vi.mocked(prisma.stage.findUnique).mockResolvedValue(mockStage);

    const req = new NextRequest("http://localhost:3000/api/stages/1");
    const res = await getStage(req, { params: { stageNumber: "1" } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.stageNumber).toBe(1);
  });

  it("returns 404 for unknown stageNumber", async () => {
    vi.mocked(prisma.stage.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/stages/99");
    const res = await getStage(req, { params: { stageNumber: "99" } });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBeDefined();
  });

  it("returns 404 for non-numeric stageNumber", async () => {
    const req = new NextRequest("http://localhost:3000/api/stages/abc");
    const res = await getStage(req, { params: { stageNumber: "abc" } });

    expect(res.status).toBe(404);
  });
});
