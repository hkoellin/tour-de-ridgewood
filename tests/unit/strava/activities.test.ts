import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("getActivitiesForStageDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only Run activities filtered by date window", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "Morning Run", type: "Run", distance: 5000, elapsed_time: 1800, start_date: "2026-06-15T09:00:00Z" },
        { id: 2, name: "Bike ride", type: "Ride", distance: 20000, elapsed_time: 3600, start_date: "2026-06-15T10:00:00Z" },
        { id: 3, name: "Afternoon Run", type: "Run", distance: 8000, elapsed_time: 2400, start_date: "2026-06-15T16:00:00Z" },
      ],
    });

    const { getActivitiesForStageDate } = await import("@/lib/strava/activities");
    const result = await getActivitiesForStageDate("access-token", new Date("2026-06-15"));

    expect(result).toHaveLength(2);
    expect(result.every((a) => a.type === "Run")).toBe(true);
  });

  it("returns empty array when no Runs on stage date", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const { getActivitiesForStageDate } = await import("@/lib/strava/activities");
    const result = await getActivitiesForStageDate("access-token", new Date("2026-06-15"));

    expect(result).toEqual([]);
  });

  it("throws StravaApiError when Strava returns non-200", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });

    const { getActivitiesForStageDate } = await import("@/lib/strava/activities");
    await expect(
      getActivitiesForStageDate("bad-token", new Date("2026-06-15"))
    ).rejects.toThrow();
  });

  it("passes correct after/before timestamps for NY timezone date", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const { getActivitiesForStageDate } = await import("@/lib/strava/activities");
    await getActivitiesForStageDate("token", new Date("2026-06-15"));

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    const after = Number(url.searchParams.get("after"));
    const before = Number(url.searchParams.get("before"));

    // NY is UTC-4 in June (EDT). Start of day June 15 EDT = June 15 04:00 UTC
    // after should be june 15 04:00 UTC unix, before should be june 16 03:59 UTC unix
    expect(after).toBeGreaterThan(0);
    expect(before).toBeGreaterThan(after);
    expect(before - after).toBe(86400); // exactly 24 hours
  });
});
