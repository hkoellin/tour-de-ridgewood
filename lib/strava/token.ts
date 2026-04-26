import { StravaApiError } from "@/lib/errors";

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

/**
 * Exchanges a Strava refresh token for a new access token.
 * Throws StravaApiError on non-200 responses.
 */
export async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new StravaApiError(
      `Strava token refresh failed: ${response.status}`,
      response.status,
      body
    );
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  };
}
