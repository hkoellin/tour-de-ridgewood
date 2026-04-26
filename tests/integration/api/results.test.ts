import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock auth
const mockAuth = vi.fn();
vi.mock("@/lib/auth/config", () => ({
  auth: mockAuth,
}));

// Mock Prisma
const mockPrisma = {
  stage: { findUnique: vi.fn() },
  result: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  runner: { findFirst: vi.fn() },
};
vi.mock("@/lib/db/prisma", () => ({ prisma: mockPrisma }));

const makeRequest = (body?: object) =>
  new NextRequest("http://localhost/api/results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /api/results", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/api/results/route");
    const res = await POST(makeRequest({ stageId: "abc", elapsedSeconds: 3600 }));
    expect(res.status).toBe(401);
  });

  it("returns 403 when session has no runnerId", async () => {
    mockAuth.mockResolvedValueOnce({ user: { role: "participant", runnerId: null } });
    const { POST } = await import("@/app/api/results/route");
    const res = await POST(makeRequest({ stageId: "abc", elapsedSeconds: 3600 }));
    expect(res.status).toBe(403);
  });

  it("creates result on first submission (201)", async () => {
    mockAuth.mockResolvedValueOnce({ user: { runnerId: "runner1", role: "participant" } });
    mockPrisma.stage.findUnique.mockResolvedValueOnce({ id: "stage1", stageNumber: 1 });
    mockPrisma.result.upsert.mockResolvedValueOnce({
      id: "result1",
      runnerId: "runner1",
      stageId: "stage1",
      elapsedSeconds: 3600,
      stravaActivityId: null,
      submittedAt: new Date(),
      updatedAt: new Date(),
    });

    const { POST } = await import("@/app/api/results/route");
    const res = await POST(makeRequest({ stageId: "stage1", elapsedSeconds: 3600 }));
    expect(res.status).toBe(201);
  });

  it("returns 400 for invalid body", async () => {
    mockAuth.mockResolvedValueOnce({ user: { runnerId: "runner1", role: "participant" } });
    const { POST } = await import("@/app/api/results/route");
    const res = await POST(makeRequest({ stageId: "abc", elapsedSeconds: -1 }));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/results/[stageNumber]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns ranked leaderboard sorted by elapsedSeconds ASC", async () => {
    mockPrisma.stage.findUnique.mockResolvedValueOnce({ id: "stage1", stageNumber: 1 });
    mockPrisma.result.findMany.mockResolvedValueOnce([
      { id: "r1", elapsedSeconds: 1800, runner: { id: "ru1", name: "Alice", team: { name: "Team A", color: "#FF0000" } }, submittedAt: new Date() },
      { id: "r2", elapsedSeconds: 2400, runner: { id: "ru2", name: "Bob", team: { name: "Team B", color: "#0000FF" } }, submittedAt: new Date() },
    ]);

    const { GET } = await import("@/app/api/results/[stageNumber]/route");
    const req = new NextRequest("http://localhost/api/results/1");
    const res = await GET(req, { params: { stageNumber: "1" } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data[0].rank).toBe(1);
    expect(data[0].runnerName).toBe("Alice");
    expect(data[1].rank).toBe(2);
  });

  it("returns empty array when no results for stage", async () => {
    mockPrisma.stage.findUnique.mockResolvedValueOnce({ id: "stage1", stageNumber: 1 });
    mockPrisma.result.findMany.mockResolvedValueOnce([]);

    const { GET } = await import("@/app/api/results/[stageNumber]/route");
    const req = new NextRequest("http://localhost/api/results/1");
    const res = await GET(req, { params: { stageNumber: "1" } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });

  it("returns 404 for unknown stage number", async () => {
    mockPrisma.stage.findUnique.mockResolvedValueOnce(null);

    const { GET } = await import("@/app/api/results/[stageNumber]/route");
    const req = new NextRequest("http://localhost/api/results/99");
    const res = await GET(req, { params: { stageNumber: "99" } });
    expect(res.status).toBe(404);
  });
});
