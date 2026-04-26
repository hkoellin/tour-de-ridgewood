import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.fn();
vi.mock("@/lib/auth/config", () => ({ auth: mockAuth }));

const mockPrisma = {
  team: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), findUnique: vi.fn() },
  runner: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), findUnique: vi.fn(), count: vi.fn() },
  stravaToken: { deleteMany: vi.fn() },
};
vi.mock("@/lib/db/prisma", () => ({ prisma: mockPrisma }));

const adminSession = { user: { role: "admin", runnerId: null } };

describe("POST /api/admin/teams", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/api/admin/teams/route");
    const res = await POST(new NextRequest("http://localhost/api/admin/teams", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Team A", color: "#FF0000" }),
    }));
    expect(res.status).toBe(401);
  });

  it("creates team for admin and returns 201", async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPrisma.team.create.mockResolvedValueOnce({ id: "t1", name: "Team A", color: "#FF0000" });
    const { POST } = await import("@/app/api/admin/teams/route");
    const res = await POST(new NextRequest("http://localhost/api/admin/teams", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Team A", color: "#FF0000" }),
    }));
    expect(res.status).toBe(201);
  });
});

describe("DELETE /api/admin/teams/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 409 when runners are assigned to the team", async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPrisma.team.findUnique.mockResolvedValueOnce({ id: "t1" });
    mockPrisma.runner.count.mockResolvedValueOnce(3);
    const { DELETE } = await import("@/app/api/admin/teams/[id]/route");
    const res = await DELETE(
      new NextRequest("http://localhost/api/admin/teams/t1", { method: "DELETE" }),
      { params: { id: "t1" } }
    );
    expect(res.status).toBe(409);
  });

  it("deletes team with no runners and returns 204", async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPrisma.team.findUnique.mockResolvedValueOnce({ id: "t1" });
    mockPrisma.runner.count.mockResolvedValueOnce(0);
    mockPrisma.team.delete.mockResolvedValueOnce({});
    const { DELETE } = await import("@/app/api/admin/teams/[id]/route");
    const res = await DELETE(
      new NextRequest("http://localhost/api/admin/teams/t1", { method: "DELETE" }),
      { params: { id: "t1" } }
    );
    expect(res.status).toBe(204);
  });
});

describe("POST /api/admin/runners", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates runner with valid teamId and returns 201", async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPrisma.runner.create.mockResolvedValueOnce({ id: "r1", name: "Alice", teamId: "t1" });
    const { POST } = await import("@/app/api/admin/runners/route");
    const res = await POST(new NextRequest("http://localhost/api/admin/runners", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice", teamId: "t1" }),
    }));
    expect(res.status).toBe(201);
  });
});
