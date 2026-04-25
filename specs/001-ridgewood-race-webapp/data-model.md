# Data Model: Tour de Ridgewood Web Application

**Phase**: 1 — Design  
**Date**: April 25, 2026  
**Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

---

## Entity Overview

```
Stage ──< Result >── Runner >── Team
                          └─── StravaToken (1:1)
```

---

## Entities

### Stage

Represents one race stage. Created and managed by the admin.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` (cuid) | PK | Auto-generated |
| `stageNumber` | `Int` | Unique, 1–8 | Public-facing identifier |
| `name` | `String` | Required | e.g., "Stage 1 – Ridgewood Loop" |
| `date` | `DateTime` | Required | Date the stage takes place |
| `startLocation` | `String` | Required | e.g., "Onderdonk Ave, Ridgewood" |
| `endLocation` | `String` | Required | Same or different from start |
| `distanceKm` | `Float` | Required, > 0 | Stage distance in kilometers |
| `elevationDescription` | `String` \| `null` | Optional | Text description of elevation |
| `stageType` | `StageType` (enum) | Required | `FLAT`, `HILLY`, `MIXED` |
| `description` | `String` \| `null` | Optional | Prose description for detail page |
| `stravaEmbedUrl` | `String` \| `null` | Optional | Strava route/segment iframe URL |
| `createdAt` | `DateTime` | Auto | |
| `updatedAt` | `DateTime` | Auto | |

**Validation rules**:
- `stageNumber`: 1–8 inclusive
- `distanceKm`: must be > 0
- `date`: must be a valid date; cannot be changed once results exist (guarded in service layer)
- `stravaEmbedUrl`: must match `https://www.strava.com/(routes|segments)/\d+/embed` pattern if provided

**State transitions**: No explicit state machine; stages are always visible once created.

**Indexes**: `stageNumber` (unique)

---

### Team

A group of runners. Created and managed by the admin.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` (cuid) | PK | |
| `name` | `String` | Unique, Required | e.g., "Team Ridgewood" |
| `color` | `String` | Required | Hex color code, e.g., `#FFD700` |
| `logoUrl` | `String` \| `null` | Optional | URL to uploaded or externally hosted logo |
| `createdAt` | `DateTime` | Auto | |
| `updatedAt` | `DateTime` | Auto | |

**Relations**: `runners` — one-to-many with `Runner`

**Validation rules**:
- `color`: must be a valid 6-digit hex code (`#RRGGBB`)
- `name`: max 60 characters

---

### Runner

A race participant. Created by the admin and optionally linked to a Strava account.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` (cuid) | PK | |
| `name` | `String` | Required | Display name (real name) |
| `teamId` | `String` | FK → Team, Required | Every runner belongs to exactly one team |
| `stravaAthleteId` | `String` \| `null` | Unique | Strava's integer athlete ID (stored as string) |
| `stravaHandle` | `String` \| `null` | Optional | Strava username hint (for admin use, not enforced) |
| `createdAt` | `DateTime` | Auto | |
| `updatedAt` | `DateTime` | Auto | |

**Relations**:
- `team` — many-to-one with `Team`
- `results` — one-to-many with `Result`
- `stravaToken` — one-to-one with `StravaToken` (nullable)

**Indexes**: `stravaAthleteId` (unique, partial — only when not null), `teamId`

---

### StravaToken

Stores the OAuth tokens for a connected runner. Separate table to avoid loading tokens on every runner query.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` (cuid) | PK | |
| `runnerId` | `String` | FK → Runner, Unique | One token record per runner |
| `accessToken` | `String` | Required | Expires in 6 hours |
| `refreshToken` | `String` | Required | Long-lived |
| `expiresAt` | `DateTime` | Required | When `accessToken` expires |
| `updatedAt` | `DateTime` | Auto | |

**Notes**: Tokens are upserted on every successful Strava OAuth callback. The `lib/strava/` module always checks `expiresAt` before making API calls and refreshes if needed.

---

### Result

A runner's recorded result for a single stage.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` (cuid) | PK | |
| `runnerId` | `String` | FK → Runner | |
| `stageId` | `String` | FK → Stage | |
| `elapsedSeconds` | `Int` | Required, > 0 | Elapsed time in seconds |
| `stravaActivityId` | `String` | Required | Strava activity ID used as source |
| `submittedAt` | `DateTime` | Auto | When the result was first submitted |
| `updatedAt` | `DateTime` | Auto | When the result was last modified |

**Constraints**:
- Compound unique: `(runnerId, stageId)` — enforces FR-009 (one result per runner per stage)
- `elapsedSeconds` must be > 0

**Indexes**: `stageId` (for fast leaderboard queries), compound unique `(runnerId, stageId)`

**State transitions**:
```
[none] → SUBMITTED (initial submission)
SUBMITTED → UPDATED (participant changes activity selection, FR-010)
```
*(No explicit status field; `updatedAt !== submittedAt` indicates an update.)*

---

## Prisma Schema (abbreviated)

```prisma
enum StageType {
  FLAT
  HILLY
  MIXED
}

model Stage {
  id                   String    @id @default(cuid())
  stageNumber          Int       @unique
  name                 String
  date                 DateTime
  startLocation        String
  endLocation          String
  distanceKm           Float
  elevationDescription String?
  stageType            StageType
  description          String?
  stravaEmbedUrl       String?
  results              Result[]
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}

model Team {
  id        String   @id @default(cuid())
  name      String   @unique
  color     String
  logoUrl   String?
  runners   Runner[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Runner {
  id               String        @id @default(cuid())
  name             String
  teamId           String
  stravaAthleteId  String?       @unique
  stravaHandle     String?
  team             Team          @relation(fields: [teamId], references: [id])
  results          Result[]
  stravaToken      StravaToken?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  @@index([teamId])
}

model StravaToken {
  id           String   @id @default(cuid())
  runnerId     String   @unique
  accessToken  String
  refreshToken String
  expiresAt    DateTime
  runner       Runner   @relation(fields: [runnerId], references: [id], onDelete: Cascade)
  updatedAt    DateTime @updatedAt
}

model Result {
  id               String   @id @default(cuid())
  runnerId         String
  stageId          String
  elapsedSeconds   Int
  stravaActivityId String
  runner           Runner   @relation(fields: [runnerId], references: [id])
  stage            Stage    @relation(fields: [stageId], references: [id])
  submittedAt      DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([runnerId, stageId])
  @@index([stageId])
}
```

---

## Derived Data: Overall Standing

`OverallStanding` is **not a DB table** — it is computed at query time:

```sql
SELECT
  r.id,
  r.name,
  t.name AS teamName,
  t.color AS teamColor,
  COUNT(res.id) AS completedStages,
  SUM(res.elapsedSeconds) AS totalSeconds
FROM Runner r
JOIN Team t ON r.teamId = t.id
LEFT JOIN Result res ON res.runnerId = r.id
GROUP BY r.id, r.name, t.name, t.color
ORDER BY completedStages DESC, totalSeconds ASC, r.name ASC
```

- Primary sort: `completedStages DESC` (more stages = higher in standings)
- Secondary sort: `totalSeconds ASC` (less time = better)
- Tertiary sort: `r.name ASC` (alphabetical tie-break)
