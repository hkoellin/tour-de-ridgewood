import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the token refresh logic in isolation by mocking fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("refreshStravaToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRAVA_CLIENT_ID = "test-client-id";
    process.env.STRAVA_CLIENT_SECRET = "test-client-secret";
  });

  it("returns new tokens when Strava responds with 200", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        expires_at: 9999999999,
      }),
    });

    const { refreshStravaToken } = await import("@/lib/strava/token");
    const result = await refreshStravaToken("old-refresh-token");

    expect(result.access_token).toBe("new-access-token");
    expect(result.refresh_token).toBe("new-refresh-token");
    expect(result.expires_at).toBe(9999999999);
  });

  it("throws StravaApiError when Strava returns non-200", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    });

    const { refreshStravaToken } = await import("@/lib/strava/token");
    await expect(refreshStravaToken("bad-refresh-token")).rejects.toThrow();
  });

  it("throws when fetch itself throws (network error)", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { refreshStravaToken } = await import("@/lib/strava/token");
    await expect(refreshStravaToken("refresh-token")).rejects.toThrow();
  });
});
