# API Routes Contract

**Version**: 1.0 | **Date**: April 25, 2026  
**Plan**: [../plan.md](../plan.md) | **Data Model**: [../data-model.md](../data-model.md)

All routes are Next.js App Router API handlers under `/app/api/`. Authentication state is checked via NextAuth `auth()`. Public routes return data without auth. Admin routes require `role === "admin"`. Participant routes require a valid Strava session.

---

## Public Routes (no authentication)

### GET /api/stages
Returns all stages ordered by `stageNumber`.

**Response 200**:
```json
[
  {
    "id": "clxyz...",
    "stageNumber": 1,
    "name": "Stage 1 – Onderdonk Loop",
    "date": "2026-06-07T00:00:00.000Z",
    "startLocation": "Onderdonk Ave, Ridgewood, NY",
    "endLocation": "Onderdonk Ave, Ridgewood, NY",
    "distanceKm": 8.2,
    "stageType": "FLAT",
    "description": "...",
    "stravaEmbedUrl": "https://www.strava.com/routes/12345/embed"
  }
]
```

---

### GET /api/stages/[stageNumber]
Returns a single stage by its number (1–8).

**Response 200**: Single stage object (same shape as above).  
**Response 404**: `{ "error": "Stage not found" }` if stageNumber is out of range or not found.

---

### GET /api/teams
Returns all teams with runner count.

**Response 200**:
```json
[
  {
    "id": "clxyz...",
    "name": "Team Ridgewood",
    "color": "#FFD700",
    "logoUrl": null,
    "runnerCount": 5
  }
]
```

---

### GET /api/teams/[teamId]
Returns a team with its full runner roster.

**Response 200**:
```json
{
  "id": "clxyz...",
  "name": "Team Ridgewood",
  "color": "#FFD700",
  "logoUrl": null,
  "runners": [
    { "id": "clxyz...", "name": "Jane Doe", "stravaLinked": true }
  ]
}
```
**Response 404**: `{ "error": "Team not found" }`

---

### GET /api/runners/[runnerId]
Returns a runner profile with team and all submitted results.

**Response 200**:
```json
{
  "id": "clxyz...",
  "name": "Jane Doe",
  "team": { "id": "...", "name": "Team Ridgewood", "color": "#FFD700" },
  "stravaLinked": true,
  "results": [
    {
      "stageNumber": 1,
      "stageName": "Stage 1 – Onderdonk Loop",
      "elapsedSeconds": 3245,
      "submittedAt": "2026-06-07T14:22:00.000Z"
    }
  ]
}
```
**Response 404**: `{ "error": "Runner not found" }`

---

### GET /api/results/[stageNumber]
Returns the leaderboard for a stage, ranked by `elapsedSeconds` ascending.

**Response 200**:
```json
[
  {
    "rank": 1,
    "runnerId": "clxyz...",
    "runnerName": "Jane Doe",
    "teamName": "Team Ridgewood",
    "teamColor": "#FFD700",
    "elapsedSeconds": 3245,
    "submittedAt": "2026-06-07T14:22:00.000Z"
  }
]
```

---

### GET /api/standings
Returns the overall general classification.

**Response 200**:
```json
[
  {
    "rank": 1,
    "runnerId": "clxyz...",
    "runnerName": "Jane Doe",
    "teamName": "Team Ridgewood",
    "teamColor": "#FFD700",
    "completedStages": 3,
    "totalSeconds": 9872
  }
]
```

---

## Participant Routes (Strava session required)

### GET /api/participant/activities/[stageNumber]
Fetches Strava activities for the authenticated runner on the stage date.  
Calls Strava `GET /athlete/activities` with `after`/`before` params for the stage date.  
Refreshes access token if expired before calling.

**Response 200**:
```json
[
  {
    "stravaActivityId": "987654321",
    "name": "Morning Run",
    "type": "Run",
    "startDate": "2026-06-07T08:15:00Z",
    "elapsedSeconds": 3245,
    "distanceKm": 8.3
  }
]
```
**Response 200 (no activities)**: `[]`  
**Response 401**: `{ "error": "Not authenticated" }` if no session  
**Response 502**: `{ "error": "Strava API unavailable" }` if Strava call fails (FR-015)

---

### POST /api/results
Submit or update a result. Idempotent — if a result already exists for `(runnerId, stageId)`, it is updated (FR-010).

**Request body**:
```json
{
  "stageId": "clxyz...",
  "stravaActivityId": "987654321",
  "elapsedSeconds": 3245
}
```

**Validation** (Zod):
- `stageId`: required, CUID string
- `stravaActivityId`: required, non-empty string
- `elapsedSeconds`: required, positive integer

**Response 201** (created) or **200** (updated): Result object  
**Response 400**: `{ "error": "Validation failed", "issues": [...] }`  
**Response 401**: Not authenticated  
**Response 403**: Authenticated runner's `runnerId` does not match session (anti-spoofing)  
**Response 409**: Should not occur (upsert), included for safety

---

## Admin Routes (admin credentials session required)

All admin routes check `session.user.role === "admin"` and return **403** if the check fails.

### POST /api/admin/stages
### PATCH /api/admin/stages/[id]
### DELETE /api/admin/stages/[id]

**POST body** / **PATCH body** (partial):
```json
{
  "stageNumber": 1,
  "name": "Stage 1 – Onderdonk Loop",
  "date": "2026-06-07",
  "startLocation": "Onderdonk Ave, Ridgewood, NY",
  "endLocation": "Onderdonk Ave, Ridgewood, NY",
  "distanceKm": 8.2,
  "elevationDescription": "Flat with one gentle rise",
  "stageType": "FLAT",
  "description": "...",
  "stravaEmbedUrl": "https://www.strava.com/routes/12345/embed"
}
```
**DELETE**: Returns `204 No Content`. Blocked if results exist for the stage (returns **409** with `{ "error": "Cannot delete stage with existing results" }`).

---

### POST /api/admin/teams
### PATCH /api/admin/teams/[id]
### DELETE /api/admin/teams/[id]

**Body**: `{ "name": "...", "color": "#RRGGBB", "logoUrl": "..." }`  
**DELETE**: Blocked if runners are assigned to team (returns **409**).

---

### POST /api/admin/runners
### PATCH /api/admin/runners/[id]
### DELETE /api/admin/runners/[id]

**Body**: `{ "name": "...", "teamId": "...", "stravaHandle": "..." }`  
**DELETE**: Cascades to `StravaToken`. Results are retained (runner name preserved in display).

---

## Error Response Shape (all routes)

```json
{
  "error": "Human-readable message",
  "issues": [...]  // optional, Zod ValidationError array
}
```

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (delete) |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Forbidden (wrong role) |
| 404 | Not found |
| 409 | Conflict (delete blocked) |
| 502 | Upstream (Strava) failure |
