import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockPrisma = {
  runner: { findMany: vi.fn() },
};
vi.mock("@/lib/db/prisma", () => ({ prisma: mockPrisma }));

describe("GET /api/standings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all runners ranked correctly", async () => {
    mockPrisma.runner.findMany.mockResolvedValueOnce([
      {
        id: "r1", name: "Alice",
        team: { name: "Team A", color: "#FF0000" },
        results: [{ elapsedSeconds: 1800 }, { elapsedSeconds: 2400 }],
      },
      {
        id: "r2", name: "Bob",
        team: { name: "Team B", color: "#0000FF" },
        results: [{ elapsedSeconds: 2000 }],
      },
    ]);

    const { GET } = await import("@/app/api/standings/route");
    const res = await GET(new NextRequest("http://localhost/api/standings"));
    expect(res.status).toBe(200);
    const data = await res.json();
    // Alice has 2 stages, Bob has 1 → Alice ranked first
    expect(data[0].runnerId).toBe("r1");
    expect(data[0].rank).toBe(1);
    expect(data[1].rank).toBe(2);
  });

  it("runners with more stages appear above those with fewer", async () => {
    mockPrisma.runner.findMany.mockResolvedValueOnce([
      {
        id: "r1", name: "Alice",
        team: { name: "Team A", color: "#FF0000" },
        results: [{ elapsedSeconds: 9999 }],
      },
      {
        id: "r2", name: "Bob",
        team: { name: "Team B", color: "#0000FF" },
        results: [{ elapsedSeconds: 100 }, { elapsedSeconds: 200 }],
      },
    ]);

    const { GET } = await import("@/app/api/standings/route");
    const res = await GET(new NextRequest("http://localhost/api/standings"));
    const data = await res.json();
    expect(data[0].runnerId).toBe("r2");
  });

  it("completedStages count is accurate", async () => {
    mockPrisma.runner.findMany.mockResolvedValueOnce([
      {
        id: "r1", name: "Alice",
        team: { name: "Team A", color: "#FF0000" },
        results: [{ elapsedSeconds: 1800 }, { elapsedSeconds: 2400 }, { elapsedSeconds: 3000 }],
      },
    ]);

    const { GET } = await import("@/app/api/standings/route");
    const res = await GET(new NextRequest("http://localhost/api/standings"));
    const data = await res.json();
    expect(data[0].completedStages).toBe(3);
  });
});
