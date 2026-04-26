import { StravaApiError } from "@/lib/errors";

const STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/athlete/activities";

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  elapsed_time: number;
  start_date: string;
}

/**
 * Fetches Strava activities for a given stage date (NY timezone / EDT).
 * Filters to Run type only.
 * Computes after/before as the 24-hour window for the given date in Eastern Time.
 */
export async function getActivitiesForStageDate(
  accessToken: string,
  stageDate: Date
): Promise<StravaActivity[]> {
  // Eastern Time is UTC-4 in summer (EDT). Start of day ET = date + 4h UTC.
  const dateStr = stageDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-").map(Number);

  // Start of day in EDT = 04:00 UTC
  const afterDate = Date.UTC(year, month - 1, day, 4, 0, 0);
  const after = Math.floor(afterDate / 1000);
  const before = after + 86400; // +24 hours

  const url = new URL(STRAVA_ACTIVITIES_URL);
  url.searchParams.set("after", String(after));
  url.searchParams.set("before", String(before));
  url.searchParams.set("per_page", "50");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new StravaApiError(
      `Strava activities fetch failed: ${response.status}`,
      response.status,
      body
    );
  }

  const activities: StravaActivity[] = await response.json();
  return activities.filter((a) => a.type === "Run");
}
