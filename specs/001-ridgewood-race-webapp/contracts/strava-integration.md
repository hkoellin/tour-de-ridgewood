# Strava Integration Contract

**Version**: 1.0 | **Date**: April 25, 2026  
**Plan**: [../plan.md](../plan.md) | **Research**: [../research.md](../research.md)

---

## Overview

The Tour de Ridgewood app integrates with the Strava API v3 for two purposes:
1. **OAuth2 authentication** — runners connect their Strava account to be recognized as participants
2. **Activity fetching** — when submitting a stage result, the app fetches the runner's Strava activities from the stage date

---

## Prerequisites

- A Strava API application must be registered at https://www.strava.com/settings/api
- Required fields in the Strava app settings:
  - **Authorization Callback Domain**: your Vercel deployment domain (e.g., `tour-de-ridgewood.vercel.app`)
- Credentials needed: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`

---

## OAuth2 Authorization Flow

### Scope

`activity:read` — required to list the athlete's activities for result submission.

### Endpoints

| Step | Method | URL |
|------|--------|-----|
| Authorization redirect | GET | `https://www.strava.com/oauth/authorize?client_id={id}&redirect_uri={uri}&response_type=code&approval_prompt=auto&scope=activity:read` |
| Token exchange | POST | `https://www.strava.com/oauth/token` |
| Token refresh | POST | `https://www.strava.com/oauth/token` (with `grant_type=refresh_token`) |

### Token Exchange Request (POST)

```
grant_type=authorization_code
client_id={STRAVA_CLIENT_ID}
client_secret={STRAVA_CLIENT_SECRET}
code={authorization_code_from_callback}
```

### Token Exchange Response

```json
{
  "token_type": "Bearer",
  "expires_at": 1749400000,
  "expires_in": 21600,
  "refresh_token": "...",
  "access_token": "...",
  "athlete": {
    "id": 12345678,
    "firstname": "Jane",
    "lastname": "Doe",
    "profile_medium": "https://..."
  }
}
```

### Token Refresh Request (POST)

```
grant_type=refresh_token
client_id={STRAVA_CLIENT_ID}
client_secret={STRAVA_CLIENT_SECRET}
refresh_token={current_refresh_token}
```

### Refresh Response (same shape as exchange, minus `athlete`)

---

## NextAuth Configuration

```ts
// lib/auth/config.ts (abbreviated)
import StravaProvider from "next-auth/providers/strava" // custom OAuth2 provider

providers: [
  {
    id: "strava",
    name: "Strava",
    type: "oauth",
    authorization: {
      url: "https://www.strava.com/oauth/authorize",
      params: { scope: "activity:read", approval_prompt: "auto" }
    },
    token: "https://www.strava.com/oauth/token",
    userinfo: "https://www.strava.com/api/v3/athlete",
    profile(profile) {
      return {
        id: String(profile.id),
        name: `${profile.firstname} ${profile.lastname}`,
        image: profile.profile_medium,
      }
    },
    clientId: process.env.STRAVA_CLIENT_ID,
    clientSecret: process.env.STRAVA_CLIENT_SECRET,
  },
  CredentialsProvider({ ... }) // admin
]
```

### Session Enrichment

On Strava login, the `jwt` callback:
1. Stores `access_token`, `refresh_token`, `expires_at` from the token response
2. Looks up `Runner` by `stravaAthleteId` — if found, sets `session.user.runnerId`
3. Upserts `StravaToken` record in DB

On every request, if `expires_at < now()`, the `jwt` callback refreshes the token and updates `StravaToken`.

---

## Activity Fetching

### Endpoint

```
GET https://www.strava.com/api/v3/athlete/activities
Authorization: Bearer {access_token}
```

### Query Parameters

| Param | Value | Notes |
|-------|-------|-------|
| `after` | Unix timestamp | Midnight of stage date (America/New_York) |
| `before` | Unix timestamp | End of stage date (America/New_York) + 1 hour buffer for late finishers crossing midnight |
| `per_page` | `30` | Max activities to return; sufficient for one day |

### Filtering Logic

```ts
// lib/strava/activities.ts
export async function getActivitiesForStageDate(
  accessToken: string,
  stageDate: Date
): Promise<StravaActivity[]> {
  const tz = "America/New_York"
  const after = toUnix(startOfDay(stageDate, tz))
  const before = toUnix(endOfDay(stageDate, tz)) + 3600 // 1hr buffer
  // GET /athlete/activities?after=...&before=...&per_page=30
  // Filter results: activity.type === "Run"
}
```

### Relevant Activity Fields

```json
{
  "id": 987654321,
  "name": "Morning Run",
  "type": "Run",
  "sport_type": "Run",
  "start_date": "2026-06-07T08:15:00Z",
  "elapsed_time": 3245,
  "distance": 8312.4,
  "map": { "summary_polyline": "..." }
}
```

### Error Handling

| HTTP Status from Strava | App behavior |
|-------------------------|-------------|
| 200 | Parse and return activities |
| 401 | Trigger token refresh; if refresh also fails, return `502` to client |
| 429 (rate limit) | Return `502` to client with `{ "error": "Strava rate limit reached. Please try again later." }` |
| 5xx | Return `502` to client with generic Strava unavailable message (FR-015) |
| Network timeout | Return `502`; do NOT lose any already-submitted data |

---

## Rate Limit Strategy

- Strava rate limits: **100 requests / 15 minutes**, **1000 requests / day**
- Activity fetches are **on-demand only** (no background polling)
- Token refreshes count against the limit; the jwt callback only refreshes when `expires_at < now() + 300s`
- With ≤30 runners and ≤8 stages, worst-case usage: 30 activity fetches + 30 token refreshes = 60 requests in a submission window — well within limits

---

## Security Considerations

- `access_token` and `refresh_token` are stored encrypted in `StravaToken` (Prisma field-level encryption or env-based AES if required — decision deferred to implementation)
- Tokens are never exposed in API responses or Next.js page props
- The `POST /api/results` route verifies that the session `runnerId` matches the runner being submitted for (anti-spoofing)
- Strava `scope` is minimized to `activity:read` only — no write access
