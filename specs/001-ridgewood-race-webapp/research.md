# Research: Tour de Ridgewood Web Application

**Phase**: 0 — Pre-design research  
**Date**: April 25, 2026  
**Plan**: [plan.md](plan.md)

---

## 1. Next.js App Router vs Pages Router

**Decision**: App Router (Next.js 14)  
**Rationale**: App Router provides React Server Components out of the box, enabling fast static rendering of public pages (route list, team pages, standings) with zero client-side JS for data fetching. Server Actions simplify form submissions (admin CRUD, result submission). Route groups (`(public)`, `(admin)`, `(participant)`) provide clean auth-scoped layouts without URL nesting.  
**Alternatives considered**: Pages Router — more mature, larger ecosystem of examples, but lacks RSC and Server Actions, adding unnecessary complexity for this project size.

---

## 2. Authentication Strategy (Strava OAuth2 + Admin Credentials)

**Decision**: NextAuth v5 with two providers — `StravaProvider` (custom OAuth2) and `CredentialsProvider` (admin)  
**Rationale**: NextAuth v5 (Auth.js) supports the App Router natively with `auth()` helper for server components and `middleware.ts` protection. Strava is not a built-in NextAuth provider but is straightforward to configure as a custom OAuth2 provider using `clientId`, `clientSecret`, `authorization` and `token` endpoints. The `access_token` and `refresh_token` must be persisted in the DB alongside the runner record so activities can be fetched on-demand.  
**Key Strava OAuth endpoints**:
- Authorization: `https://www.strava.com/oauth/authorize`
- Token exchange: `https://www.strava.com/oauth/token`
- Scopes required: `activity:read` (to list activities for result submission)

**Admin auth**: Single `CredentialsProvider` with bcrypt-hashed password stored in environment variables (no DB row required for admin). Role is determined by provider type in the session.  
**Alternatives considered**: Lucia Auth (more manual, no Strava example), Clerk (too heavyweight, external dependency for a small app).

---

## 3. Strava Activity Fetching for Result Submission

**Decision**: On-demand fetch via Strava Activities API when a participant opens the result submission page  
**Rationale**: Strava's rate limits (100 req/15 min, 1000/day) make background polling unsafe for even a small race. Fetching activities only when a participant actively initiates submission stays well within limits. Activities are filtered by `after` and `before` params matching the stage date (midnight-to-midnight in local time).  
**Strava API endpoint**: `GET https://www.strava.com/api/v3/athlete/activities?after={unix}&before={unix}`  
**Token refresh**: Strava access tokens expire in 6 hours. The NextAuth `jwt` callback must check `expires_at` and call the Strava token refresh endpoint (`POST /oauth/token?grant_type=refresh_token`) before making API calls. Refreshed tokens must be saved back to the session/DB.  
**Edge case — no matching activity**: Return empty array + UI message "No activity found for this stage date." (FR-015, edge case in spec).  
**Alternatives considered**: Webhooks (Strava push) — overkill for on-demand submission; requires a persistent server, not compatible with Vercel serverless.

---

## 4. Stage Route Maps (Strava Embed)

**Decision**: Strava Route/Segment iframe embed per stage, stored as a URL in the DB  
**Rationale**: The race organizer already uses Strava. Each stage can be pre-designed as a Strava Route (or a Segment) and its embed URL stored in the Stage record. No mapping library dependency required. Strava embeds are responsive and mobile-friendly.  
**Embed format**: `https://www.strava.com/routes/{routeId}/embed` or `https://www.strava.com/segments/{segmentId}/embed`  
**Admin workflow**: Admin creates/records Strava route → pastes embed URL into stage form → iframe rendered on stage detail page.  
**Alternatives considered**: Leaflet + GPX — more flexible, but requires file hosting and a parsing library; adds complexity without user benefit for a small race with known routes. Google Maps embed — works but requires API key and billing setup.

---

## 5. Database ORM and Schema Strategy

**Decision**: Prisma ORM with PostgreSQL on Supabase  
**Rationale**: Prisma provides type-safe DB access that integrates directly with TypeScript, auto-generates the client from `schema.prisma`, and supports migrations. Supabase offers a free-tier PostgreSQL instance with connection pooling (via `pgBouncer`) suitable for Vercel serverless functions which open many short-lived DB connections.  
**Connection pooling**: Use Supabase's pooler connection string (`?pgbouncer=true`) in `DATABASE_URL`. Use the direct connection string for `DIRECT_URL` (Prisma migrations).  
**Indexes needed**:
- `Result` → compound unique on `(runnerId, stageId)` — enforces FR-009
- `Result` → index on `stageId` — fast leaderboard queries
- `Runner` → index on `stravaAthleteId` — fast OAuth lookup
- `Stage` → index on `stageNumber` — ordered listing

**Alternatives considered**: Drizzle ORM — type-safe, lighter-weight, but less ecosystem maturity and harder migration tooling. Raw `pg` — no type safety, not appropriate for this codebase.

---

## 6. Standings / GC Calculation

**Decision**: Server-side aggregation via Prisma query + pure TypeScript function in `lib/standings/`  
**Rationale**: With ≤30 runners and ≤8 stages, a `GROUP BY runnerId, SUM(elapsedSeconds)` query is fast without materialized views. The calculation is extracted to `lib/standings/calculate.ts` as a pure function (no DB dependency) so it is fully unit-testable per Constitution II.  
**Tie-breaking**: In the event of identical cumulative times, runners are sorted alphabetically by last name as the secondary key. This is documented in the spec edge cases.  
**DNF handling**: Runners with fewer than 8 submitted results are listed with their partial cumulative time and a `completedStages` count. They appear below runners with more completed stages (primary sort: `completedStages DESC`, secondary: `totalSeconds ASC`).

---

## 7. Styling Approach (letour.fr Visual Similarity)

**Decision**: Tailwind CSS + custom design tokens inspired by letour.fr palette  
**Rationale**: letour.fr uses a bold color palette (yellow `#FFD700`, black, white), large editorial typography, and card-based stage layouts. Tailwind's utility classes make it fast to implement one-off layouts while the design token layer (`tailwind.config.ts` theme extension) enforces consistency per Constitution III.  
**Key visual elements to replicate**:
- Hero section with a full-bleed image and race title overlay
- Stage cards with stage number badge, date, and start/end locations
- Navigation bar with yellow accent, dark background
- Leaderboard tables with alternating row shading and team color indicators

**Alternatives considered**: CSS Modules — more isolation but slower to iterate on a visually complex layout. Styled Components — runtime overhead not justified.

---

## 8. Testing Strategy

**Decision**: Vitest (unit + integration) + Playwright (e2e)  
**Rationale**:
- Vitest is the fastest unit test runner for TypeScript projects and integrates with Vite's transform pipeline, which Next.js also uses for non-server code.
- `@testing-library/react` for component tests (RSC testing via `renderToString`).
- Playwright for e2e: covers the full Strava OAuth redirect → callback → session creation flow, and the result submission happy path.
- A test database (separate Supabase project or local Postgres via Docker) is used for integration tests.

**Coverage target**: ≥80% line coverage on `lib/` (standings, validation, strava client) — the highest-risk business logic. UI components have lower coverage requirements but must have snapshot/render tests for all states (loading, empty, error).

---

## Resolved Unknowns Summary

| Unknown | Resolution |
|---------|-----------|
| Mapping service for stage routes | Strava Route/Segment iframe embed |
| Strava token management in Next.js | NextAuth v5 jwt callback with refresh logic |
| Admin authentication provider | NextAuth CredentialsProvider, bcrypt, env-var secret |
| GC tie-breaking rule | Alphabetical by last name (secondary sort) |
| Connection pooling for Vercel | Supabase pgBouncer pooler URL |
| Activity filtering window | Midnight-to-midnight on stage date in local time (NY timezone) |
