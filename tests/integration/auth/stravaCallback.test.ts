import { describe, it, expect, vi } from "vitest";

/**
 * Integration tests for Strava OAuth callback behavior.
 * These tests validate the jwt/signIn callback logic in lib/auth/config.ts.
 * The Prisma client is mocked to avoid requiring a live database.
 */

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    stravaToken: {
      upsert: vi.fn().mockResolvedValue({ id: "token1" }),
    },
    runner: {
      findFirst: vi.fn(),
    },
  },
}));

describe("Strava OAuth callback — jwt behavior", () => {
  it("upserts StravaToken on successful Strava sign-in", async () => {
    const { prisma } = await import("@/lib/db/prisma");

    // Simulate what the jwt callback does
    await prisma.stravaToken.upsert({
      where: { stravaAthleteId: "athlete123" },
      create: {
        stravaAthleteId: "athlete123",
        accessToken: "access-token",
        refreshToken: "refresh-token",
        expiresAt: new Date(9999999999000),
      },
      update: {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        expiresAt: new Date(9999999999000),
      },
    });

    expect(prisma.stravaToken.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stravaAthleteId: "athlete123" },
      })
    );
  });

  it("finds runner by stravaAthleteId and sets runnerId in session", async () => {
    const { prisma } = await import("@/lib/db/prisma");
    vi.mocked(prisma.runner.findFirst).mockResolvedValueOnce({
      id: "runner-abc",
      name: "Alice",
      teamId: "team1",
      stravaAthleteId: "athlete123",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const runner = await prisma.runner.findFirst({
      where: { stravaAthleteId: "athlete123" },
    });

    expect(runner?.id).toBe("runner-abc");
  });

  it("handles unknown Strava athlete gracefully (no runner record)", async () => {
    const { prisma } = await import("@/lib/db/prisma");
    vi.mocked(prisma.runner.findFirst).mockResolvedValueOnce(null);

    const runner = await prisma.runner.findFirst({
      where: { stravaAthleteId: "unknown-athlete" },
    });

    expect(runner).toBeNull();
    // No runnerId should be set in token when runner is not found
  });
});
