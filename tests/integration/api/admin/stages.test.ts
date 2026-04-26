import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.fn();
vi.mock("@/lib/auth/config", () => ({ auth: mockAuth }));

const mockPrisma = {
  stage: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
  },
  result: { count: vi.fn() },
};
vi.mock("@/lib/db/prisma", () => ({ prisma: mockPrisma }));

const adminSession = { user: { role: "admin", runnerId: null } };
const participantSession = { user: { role: "participant", runnerId: "r1" } };

describe("POST /api/admin/stages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when unauthenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { POST } = await import("@/app/api/admin/stages/route");
    const res = await POST(new NextRequest("http://localhost/api/admin/stages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageNumber: 1, name: "Stage 1", date: "2026-06-15", startLocation: "A", endLocation: "B", distanceKm: 10, stageType: "FLAT" }),
    }));
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin session", async () => {
    mockAuth.mockResolvedValueOnce(participantSession);
    const { POST } = await import("@/app/api/admin/stages/route");
    const res = await POST(new NextRequest("http://localhost/api/admin/stages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageNumber: 1, name: "Stage 1", date: "2026-06-15", startLocation: "A", endLocation: "B", distanceKm: 10, stageType: "FLAT" }),
    }));
    expect(res.status).toBe(403);
  });

  it("creates stage and returns 201 for admin", async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPrisma.stage.create.mockResolvedValueOnce({ id: "s1", stageNumber: 1, name: "Stage 1" });
    const { POST } = await import("@/app/api/admin/stages/route");
    const res = await POST(new NextRequest("http://localhost/api/admin/stages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageNumber: 1, name: "Stage 1", date: "2026-06-15", startLocation: "A", endLocation: "B", distanceKm: 10, stageType: "FLAT" }),
    }));
    expect(res.status).toBe(201);
  });
});

describe("PATCH /api/admin/stages/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates stage and returns 200", async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPrisma.stage.findUnique.mockResolvedValueOnce({ id: "s1" });
    mockPrisma.stage.update.mockResolvedValueOnce({ id: "s1", name: "Updated" });
    const { PATCH } = await import("@/app/api/admin/stages/[id]/route");
    const res = await PATCH(
      new NextRequest("http://localhost/api/admin/stages/s1", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated" }),
      }),
      { params: { id: "s1" } }
    );
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/admin/stages/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes stage and returns 204", async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPrisma.stage.findUnique.mockResolvedValueOnce({ id: "s1" });
    mockPrisma.result.count.mockResolvedValueOnce(0);
    mockPrisma.stage.delete.mockResolvedValueOnce({});
    const { DELETE } = await import("@/app/api/admin/stages/[id]/route");
    const res = await DELETE(
      new NextRequest("http://localhost/api/admin/stages/s1", { method: "DELETE" }),
      { params: { id: "s1" } }
    );
    expect(res.status).toBe(204);
  });

  it("returns 409 when results exist for the stage", async () => {
    mockAuth.mockResolvedValueOnce(adminSession);
    mockPrisma.stage.findUnique.mockResolvedValueOnce({ id: "s1" });
    mockPrisma.result.count.mockResolvedValueOnce(3);
    const { DELETE } = await import("@/app/api/admin/stages/[id]/route");
    const res = await DELETE(
      new NextRequest("http://localhost/api/admin/stages/s1", { method: "DELETE" }),
      { params: { id: "s1" } }
    );
    expect(res.status).toBe(409);
  });
});
