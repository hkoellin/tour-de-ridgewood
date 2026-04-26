import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    team: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    runner: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { GET as getTeams } from "@/app/api/teams/route";
import { GET as getTeam } from "@/app/api/teams/[teamId]/route";
import { GET as getRunner } from "@/app/api/runners/[runnerId]/route";
import { NextRequest } from "next/server";

const mockTeam = {
  id: "team1",
  name: "Team Ridgewood",
  color: "#FFD700",
  logoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { runners: 3 },
};

const mockRunner = {
  id: "runner1",
  name: "Jane Doe",
  teamId: "team1",
  stravaAthleteId: "12345",
  stravaHandle: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTeamWithRunners = {
  ...mockTeam,
  runners: [
    { ...mockRunner, stravaAthleteId: "12345" },
    { id: "runner2", name: "John Smith", teamId: "team1", stravaAthleteId: null, stravaHandle: null, createdAt: new Date(), updatedAt: new Date() },
  ],
};

const mockRunnerWithResults = {
  ...mockRunner,
  team: { id: "team1", name: "Team Ridgewood", color: "#FFD700" },
  results: [
    {
      id: "result1",
      runnerId: "runner1",
      stageId: "stage1",
      elapsedSeconds: 2400,
      stravaActivityId: "abc",
      submittedAt: new Date(),
      updatedAt: new Date(),
      stage: { stageNumber: 1, name: "Stage 1 – Ridgewood Loop" },
    },
  ],
};

describe("GET /api/teams", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns teams with runnerCount", async () => {
    vi.mocked(prisma.team.findMany).mockResolvedValue([mockTeam] as any);

    const req = new NextRequest("http://localhost:3000/api/teams");
    const res = await getTeams(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty("runnerCount");
    expect(data[0].runnerCount).toBe(3);
  });
});

describe("GET /api/teams/[teamId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns team with runners and stravaLinked field", async () => {
    vi.mocked(prisma.team.findUnique).mockResolvedValue(mockTeamWithRunners as any);

    const req = new NextRequest("http://localhost:3000/api/teams/team1");
    const res = await getTeam(req, { params: { teamId: "team1" } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.runners).toHaveLength(2);
    expect(data.runners[0].stravaLinked).toBe(true);
    expect(data.runners[1].stravaLinked).toBe(false);
  });

  it("returns 404 for unknown teamId", async () => {
    vi.mocked(prisma.team.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/teams/unknown");
    const res = await getTeam(req, { params: { teamId: "unknown" } });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/runners/[runnerId]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns runner with team and results", async () => {
    vi.mocked(prisma.runner.findUnique).mockResolvedValue(mockRunnerWithResults as any);

    const req = new NextRequest("http://localhost:3000/api/runners/runner1");
    const res = await getRunner(req, { params: { runnerId: "runner1" } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe("Jane Doe");
    expect(data.team.name).toBe("Team Ridgewood");
    expect(data.results).toHaveLength(1);
  });

  it("returns 404 for unknown runnerId", async () => {
    vi.mocked(prisma.runner.findUnique).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/runners/unknown");
    const res = await getRunner(req, { params: { runnerId: "unknown" } });

    expect(res.status).toBe(404);
  });
});
