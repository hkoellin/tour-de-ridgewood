# Tasks: Tour de Ridgewood Web Application

**Input**: Design documents from `/specs/001-ridgewood-race-webapp/`  
**Prerequisites**: [plan.md](plan.md) · [spec.md](spec.md) · [research.md](research.md) · [data-model.md](data-model.md) · [contracts/api-routes.md](contracts/api-routes.md) · [contracts/strava-integration.md](contracts/strava-integration.md)  
**Stack**: Next.js 14 (App Router) · TypeScript · PostgreSQL (Supabase) · Prisma · NextAuth v5 · Tailwind · Vercel  
**Tests**: TDD is REQUIRED per the constitution — test tasks are included and MUST be written before implementation.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Parallelizable (independent files, no incomplete task dependencies)
- **[Story]**: User story this task belongs to (US1–US6)

---

## Phase 1: Setup

**Purpose**: Initialize the Next.js project, install all dependencies, and configure tooling.

- [ ] T001 Initialize Next.js 14 project with TypeScript and App Router: `npx create-next-app@latest . --typescript --tailwind --app --src-dir no --import-alias "@/*"`
- [ ] T002 Install core dependencies: `pnpm add prisma @prisma/client next-auth@beta zod @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-dropdown-menu swr bcryptjs`
- [ ] T003 Install dev dependencies: `pnpm add -D @types/bcryptjs vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom jsdom playwright @playwright/test`
- [ ] T004 [P] Configure ESLint and Prettier in `eslint.config.mjs` and `.prettierrc`
- [ ] T005 [P] Configure Vitest in `vitest.config.ts` with jsdom environment and coverage threshold ≥80%
- [ ] T006 [P] Configure Playwright in `playwright.config.ts` targeting `http://localhost:3000`
- [ ] T007 [P] Create `.env.example` with all required variables: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`
- [ ] T008 [P] Extend Tailwind design tokens in `tailwind.config.ts`: race yellow `#FFD700`, race black `#1A1A1A`, race white `#FFFFFF`, team-color utilities, editorial font sizes
- [ ] T009 [P] Create global styles in `app/globals.css`: CSS reset, base typography, Tailwind directives

**Checkpoint**: Project installs and `pnpm dev` starts without errors.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on. No story work begins until this phase is complete.

⚠️ **CRITICAL**: This phase blocks all user story phases.

- [ ] T010 Write Prisma schema in `prisma/schema.prisma`: models Stage, Team, Runner, StravaToken, Result with all fields, relations, indexes, and unique constraints per data-model.md
- [ ] T011 Run `pnpm prisma migrate dev --name init` and commit generated migration in `prisma/migrations/`
- [ ] T012 Run `pnpm prisma generate` and create Prisma client singleton in `lib/db/prisma.ts` (global instance pattern for Next.js dev hot-reload)
- [ ] T013 [P] Create NextAuth configuration in `lib/auth/config.ts`: Strava custom OAuth2 provider and CredentialsProvider for admin; include `jwt` and `session` callbacks; extend session type in `lib/auth/types.ts` to include `runnerId` and `role`
- [ ] T014 [P] Create NextAuth API handler in `app/api/auth/[...nextauth]/route.ts`
- [ ] T015 Create `middleware.ts` at project root: protect `/admin/*` routes (require `role === "admin"`), protect `/submit/*` routes (require Strava session), redirect unauthenticated users to `/login`
- [ ] T016 [P] Create root layout in `app/layout.tsx`: SessionProvider wrapper, global font import, metadata
- [ ] T017 [P] Create `components/layout/Header.tsx`: nav with Tour de Ridgewood logo, Route and Teams links, Strava connect/avatar button, mobile hamburger menu
- [ ] T018 [P] Create `components/layout/Footer.tsx`: minimal race branding footer
- [ ] T019 [P] Create `components/layout/Nav.tsx`: desktop nav bar with yellow accent and dark background per letour.fr visual style
- [ ] T020 [P] Create Zod schemas in `lib/validation/schemas.ts`: StageSchema, TeamSchema, RunnerSchema, ResultSchema, AdminLoginSchema
- [ ] T021 [P] Create shared UI primitives in `components/ui/`: Button, Card, Badge, Skeleton (loading), EmptyState, ErrorMessage — all built on `@radix-ui` primitives and Tailwind
- [ ] T022 [P] Create error handling utilities in `lib/errors.ts`: typed API error responses, Zod error formatter matching `{ error, issues }` contract shape

**Checkpoint**: Foundation complete — `pnpm build` succeeds, auth routes respond, DB connection verified via `pnpm prisma studio`.

---

## Phase 3: User Story 1 — Browse the Route (Priority: P1) 🎯 MVP

**Goal**: Any visitor can see all 8 stages listed with names, dates, start/end points, and navigate to a stage detail page showing a map, distance, and description.

**Independent Test**: Navigate to `/route`. All 8 stages are listed. Clicking any stage opens a detail page with stage map, start/end location, and key route information. No login required.

### Tests for User Story 1

> **Write these FIRST. Confirm they FAIL before implementing.**

- [ ] T023 [P] [US1] Write unit tests for stage validation schema in `tests/unit/validation/stage.test.ts`: valid stage passes, invalid stageNumber (0, 9) fails, missing required fields fail, invalid stravaEmbedUrl pattern fails
- [ ] T024 [P] [US1] Write integration tests for `GET /api/stages` and `GET /api/stages/[stageNumber]` in `tests/integration/api/stages.test.ts`: returns all stages ordered by number, returns single stage by number, returns 404 for unknown number
- [ ] T025 [P] [US1] Write component tests for `StageCard` in `tests/unit/components/StageCard.test.tsx`: renders stage number, name, date, start/end, type badge; links to correct detail URL
- [ ] T026 [P] [US1] Write component tests for `StageMap` in `tests/unit/components/StageMap.test.tsx`: renders iframe with correct src when stravaEmbedUrl present, renders fallback when null

### Implementation for User Story 1

- [ ] T027 [P] [US1] Create `GET /api/stages/route.ts`: query all stages ordered by `stageNumber`, return array per api-routes.md contract
- [ ] T028 [P] [US1] Create `GET /api/stages/[stageNumber]/route.ts`: query stage by number, return 404 with `{ error }` if not found
- [ ] T029 [P] [US1] Create `components/stages/StageCard.tsx`: stage number badge, name, date, start→end locations, stage type chip, link to detail page; implement loading skeleton and empty states
- [ ] T030 [P] [US1] Create `components/stages/StageMap.tsx`: Strava iframe embed with `stravaEmbedUrl`; fallback "Map coming soon" placeholder when URL is null
- [ ] T031 [US1] Create stage list page `app/(public)/route/page.tsx`: fetch all stages via `GET /api/stages` (RSC), render list of StageCards, include page title and race context copy
- [ ] T032 [US1] Create stage detail page `app/(public)/route/[stageNumber]/page.tsx`: fetch stage by number (RSC), render StageMap, distance, elevation description, stage description, back navigation; 404 if not found
- [ ] T033 [US1] Add "Route" link to `components/layout/Nav.tsx` pointing to `/route`

**Checkpoint**: US1 fully functional. Visit `/route` — all 8 stages display. Click any stage — detail page with Strava embed loads. No auth required.

---

## Phase 4: User Story 2 — Browse Teams & Runners (Priority: P2)

**Goal**: Any visitor can see all teams with rosters, navigate to a team detail page, click a runner to see their profile and submitted stage results.

**Independent Test**: Navigate to `/teams`. All teams display. Clicking a team shows roster. Clicking a runner shows their profile and results table (empty with "No results yet" if none).

### Tests for User Story 2

> **Write these FIRST. Confirm they FAIL before implementing.**

- [ ] T034 [P] [US2] Write integration tests for `GET /api/teams`, `GET /api/teams/[teamId]`, `GET /api/runners/[runnerId]` in `tests/integration/api/teams.test.ts`: returns teams with runnerCount, returns team with runners array, returns runner with results, returns 404 for unknown IDs
- [ ] T035 [P] [US2] Write component tests for `TeamCard` in `tests/unit/components/TeamCard.test.tsx`: renders team name, color swatch, runner count; links to team detail
- [ ] T036 [P] [US2] Write component tests for `RunnerRow` in `tests/unit/components/RunnerRow.test.tsx`: renders runner name, Strava linked badge when stravaLinked true; links to runner profile
- [ ] T037 [P] [US2] Write component test for runner profile results table in `tests/unit/components/RunnerResultsTable.test.tsx`: renders results rows; renders "No results yet" when results array is empty

### Implementation for User Story 2

- [ ] T038 [P] [US2] Create `GET /api/teams/route.ts`: query all teams with `_count: { runners: true }`, return array with `runnerCount`
- [ ] T039 [P] [US2] Create `GET /api/teams/[teamId]/route.ts`: query team with runners, return 404 if not found; include `stravaLinked: runner.stravaAthleteId !== null` per runner
- [ ] T040 [P] [US2] Create `GET /api/runners/[runnerId]/route.ts`: query runner with team and results (joined with stage for stageNumber/stageName), return 404 if not found
- [ ] T041 [P] [US2] Create `components/teams/TeamCard.tsx`: team name, color swatch strip, runner count badge, link to detail
- [ ] T042 [P] [US2] Create `components/teams/RunnerRow.tsx`: runner name, team color dot, Strava badge if linked, link to profile
- [ ] T043 [P] [US2] Create `components/results/RunnerResultsTable.tsx`: table of stage results (stageNumber, stageName, elapsedTime formatted, submittedAt); EmptyState "No results yet" when empty
- [ ] T044 [US2] Create teams list page `app/(public)/teams/page.tsx`: fetch all teams (RSC), render grid of TeamCards, page title
- [ ] T045 [US2] Create team detail page `app/(public)/teams/[teamId]/page.tsx`: fetch team with runners (RSC), render team header with color, roster of RunnerRows; 404 if not found
- [ ] T046 [US2] Create runner profile page `app/(public)/teams/runners/[runnerId]/page.tsx`: fetch runner (RSC), render name, team affiliation, RunnerResultsTable; 404 if not found
- [ ] T047 [US2] Add "Teams" link to `components/layout/Nav.tsx` pointing to `/teams`

**Checkpoint**: US2 fully functional independent of US3–US6. Strava connection not required to browse.

---

## Phase 5: User Story 3 — Connect Strava Account (Priority: P3)

**Goal**: A runner clicks "Connect with Strava," completes Strava OAuth, and is returned as an authenticated participant with their name in their team's roster.

**Independent Test**: Click "Connect with Strava." Strava authorization page opens. After authorizing, return to site — Strava name/avatar appear in header. Navigate to runner's team — their name is highlighted in the roster.

### Tests for User Story 3

> **Write these FIRST. Confirm they FAIL before implementing.**

- [ ] T048 [P] [US3] Write unit tests for Strava token refresh logic in `tests/unit/strava/tokenRefresh.test.ts`: refreshes when `expiresAt < now`, returns cached token when valid, throws on refresh API failure
- [ ] T049 [P] [US3] Write integration test for Strava OAuth callback flow in `tests/integration/auth/stravaCallback.test.ts`: upserts StravaToken record, sets `runnerId` in session when runner found by `stravaAthleteId`, handles unknown athlete gracefully
- [ ] T050 [P] [US3] Write e2e test stub in `tests/e2e/stravaAuth.spec.ts`: documents the expected OAuth redirect URL, callback behavior, and session state (mocked Strava responses)

### Implementation for User Story 3

- [ ] T051 [US3] Complete Strava OAuth2 provider in `lib/auth/config.ts`: `jwt` callback stores `access_token`, `refresh_token`, `expires_at`; looks up Runner by `stravaAthleteId`; upserts `StravaToken`; sets `runnerId` and `role: "participant"` in session
- [ ] T052 [US3] Create token refresh helper in `lib/strava/token.ts`: `refreshStravaToken(refreshToken)` — POST to Strava `/oauth/token`, return new tokens, throw typed `StravaApiError` on failure
- [ ] T053 [US3] Update `lib/auth/config.ts` jwt callback to call `refreshStravaToken` when `expires_at < Date.now() / 1000 - 300` and update `StravaToken` in DB
- [ ] T054 [US3] Update `components/layout/Header.tsx`: show Strava avatar + name when session has `runnerId`; show "Connect with Strava" button (links to NextAuth Strava sign-in) when not connected; show Strava orange brand button styling
- [ ] T055 [US3] Update team detail page `app/(public)/teams/[teamId]/page.tsx`: highlight authenticated runner's row in roster (bold name + "You" badge) when `session.user.runnerId` matches
- [ ] T056 [US3] Create Strava auth error page `app/(public)/auth/error/page.tsx`: human-readable error message for denied/failed Strava OAuth; "Try again" button per FR-015 and spec scenario 4

**Checkpoint**: US3 functional. Click "Connect with Strava" → authorize → return to site authenticated. Team roster highlights the connected runner.

---

## Phase 6: User Story 4 — Submit Stage Result (Priority: P4)

**Goal**: A connected participant opens a stage page, selects their matching Strava activity, confirms, and their time appears on the stage leaderboard.

**Independent Test**: Log in with Strava. Navigate to `/submit/1`. Your Strava activities from the stage date are listed. Select one and confirm. Time appears on `/results/1` leaderboard.

### Tests for User Story 4

> **Write these FIRST. Confirm they FAIL before implementing.**

- [ ] T057 [P] [US4] Write unit tests for Strava activity fetcher in `tests/unit/strava/activities.test.ts`: filters by Run type only, computes correct `after`/`before` unix timestamps for NY timezone, handles empty response, throws `StravaApiError` on non-200
- [ ] T058 [P] [US4] Write unit tests for result submission validation in `tests/unit/validation/result.test.ts`: valid payload passes, missing stageId fails, elapsedSeconds ≤ 0 fails
- [ ] T059 [P] [US4] Write integration tests for `POST /api/results` in `tests/integration/api/results.test.ts`: creates result on first submit (201), updates result on duplicate (200), rejects unauthenticated request (401), rejects wrong runner (403)
- [ ] T060 [P] [US4] Write integration tests for `GET /api/results/[stageNumber]` in `tests/integration/api/results.test.ts`: returns ranked leaderboard sorted by elapsedSeconds ASC, returns empty array when no results
- [ ] T061 [P] [US4] Write integration test for `GET /api/participant/activities/[stageNumber]` in `tests/integration/api/activities.test.ts`: returns activities from Strava (mocked), returns 502 when Strava is unavailable

### Implementation for User Story 4

- [ ] T062 [P] [US4] Create Strava activities fetcher in `lib/strava/activities.ts`: `getActivitiesForStageDate(accessToken, stageDate)` — GET `/athlete/activities` with computed `after`/`before`, filter `type === "Run"`, map to `StravaActivity` type, throw `StravaApiError` with status on failure
- [ ] T063 [P] [US4] Create `GET /api/participant/activities/[stageNumber]/route.ts`: verify Strava session, look up stage date, refresh token if needed, call `getActivitiesForStageDate`, return mapped array; return `[]` if no runs; return 502 if Strava unreachable
- [ ] T064 [P] [US4] Create `POST /api/results/route.ts`: validate body with `ResultSchema`; verify session `runnerId`; upsert `Result` using Prisma `upsert` on `(runnerId, stageId)` unique constraint; return 201 on create, 200 on update
- [ ] T065 [P] [US4] Create `GET /api/results/[stageNumber]/route.ts`: look up stage by number, query results with runner+team join, sort by `elapsedSeconds ASC`, return ranked leaderboard array
- [ ] T066 [P] [US4] Create `components/results/ActivityPicker.tsx`: list of StravaActivity cards (name, date, distance, elapsed time formatted as HH:MM:SS); selected state; confirm button; "No activity found" EmptyState
- [ ] T067 [P] [US4] Create `components/results/LeaderboardTable.tsx`: ranked table (rank, name, team color dot, team name, formatted time, submitted date); loading skeleton; EmptyState "No results yet"
- [ ] T068 [US4] Create result submission page `app/(participant)/submit/[stageNumber]/page.tsx`: show stage info, render ActivityPicker with activities from `/api/participant/activities/[stageNumber]`; POST to `/api/results` on confirm; redirect to `/results/[stageNumber]` on success; duplicate submission notice if already submitted
- [ ] T069 [US4] Create stage results page `app/(public)/results/[stageNumber]/page.tsx`: fetch leaderboard from `GET /api/results/[stageNumber]` (RSC), render LeaderboardTable, stage header; "Submit your result" CTA for authenticated runners who haven't submitted yet
- [ ] T070 [US4] Add "Submit Result" button to stage detail page `app/(public)/route/[stageNumber]/page.tsx`: visible only for authenticated runners, links to `/submit/[stageNumber]`

**Checkpoint**: US4 functional. Full result submission flow works. Leaderboard updates on page load after submission.

---

## Phase 7: User Story 5 — View Overall Standings (Priority: P5)

**Goal**: Any visitor can see an overall general classification ranking all participants by cumulative time across completed stages.

**Independent Test**: Open `/standings`. Participants who have submitted results are ranked by total time. Partial completers appear with incomplete indicator. No login required.

### Tests for User Story 5

> **Write these FIRST. Confirm they FAIL before implementing.**

- [ ] T071 [P] [US5] Write unit tests for standings calculation in `tests/unit/standings/calculate.test.ts`: sorts by completedStages DESC then totalSeconds ASC then name ASC; runner with 0 results appears last; tie-breaking by name works correctly; handles empty input
- [ ] T072 [P] [US5] Write integration tests for `GET /api/standings` in `tests/integration/api/standings.test.ts`: returns all runners ranked correctly, runners with more stages appear above those with fewer, completedStages count is accurate

### Implementation for User Story 5

- [ ] T073 [P] [US5] Create standings calculation function in `lib/standings/calculate.ts`: `calculateStandings(runners: RunnerWithResults[]): Standing[]` — pure function, no DB dependency, sort by completedStages DESC → totalSeconds ASC → name ASC; mark runners with incomplete stages
- [ ] T074 [P] [US5] Create `GET /api/standings/route.ts`: aggregate query via Prisma (`groupBy` or raw), map to `Standing[]`, return ranked array per api-routes.md contract
- [ ] T075 [P] [US5] Create `components/standings/GCTable.tsx`: ranked table with position, runner name link, team color dot, team name, stages completed badge, total time; leader row highlighted in race yellow; loading skeleton; EmptyState "No results have been submitted yet"
- [ ] T076 [US5] Create standings page `app/(public)/standings/page.tsx`: fetch standings (RSC), render GCTable, page title "General Classification", race context copy; add to Nav as "Standings" link

**Checkpoint**: US5 functional. `/standings` shows correct rankings. Updates on next page load after new results submitted.

---

## Phase 8: User Story 6 — Race Administrator Manages Content (Priority: P6)

**Goal**: The race organizer logs in to an admin area to create/edit stages, teams, and runners. Changes immediately appear on the public site.

**Independent Test**: Log in at `/login`. Create a stage with all required details — it appears on `/route`. Create a team and add runners — team appears on `/teams`. Access denied for unauthenticated requests to admin routes.

### Tests for User Story 6

> **Write these FIRST. Confirm they FAIL before implementing.**

- [ ] T077 [P] [US6] Write integration tests for admin stage CRUD in `tests/integration/api/admin/stages.test.ts`: POST creates stage (201), PATCH updates stage (200), DELETE removes stage (204), DELETE blocked when results exist (409), all routes return 401 without session and 403 without admin role
- [ ] T078 [P] [US6] Write integration tests for admin team and runner CRUD in `tests/integration/api/admin/teams.test.ts` and `runners.test.ts`: same auth gate pattern; DELETE team blocked when runners assigned; runner creation with valid teamId succeeds
- [ ] T079 [P] [US6] Write unit tests for admin input validation in `tests/unit/validation/admin.test.ts`: StageSchema rejects stageNumber outside 1–8, TeamSchema rejects invalid hex color, RunnerSchema requires teamId

### Implementation for User Story 6

- [ ] T080 [P] [US6] Create `POST/PATCH/DELETE /api/admin/stages/` routes in `app/api/admin/stages/route.ts` and `app/api/admin/stages/[id]/route.ts`: validate with StageSchema (Zod), enforce admin role check, block DELETE when results exist (409), return typed responses
- [ ] T081 [P] [US6] Create `POST/PATCH/DELETE /api/admin/teams/` routes in `app/api/admin/teams/route.ts` and `app/api/admin/teams/[id]/route.ts`: validate with TeamSchema, block DELETE when runners assigned (409)
- [ ] T082 [P] [US6] Create `POST/PATCH/DELETE /api/admin/runners/` routes in `app/api/admin/runners/route.ts` and `app/api/admin/runners/[id]/route.ts`: validate with RunnerSchema, cascade delete StravaToken
- [ ] T083 [US6] Create admin login page `app/(admin)/login/page.tsx`: credentials form (username + password), POST to NextAuth CredentialsProvider, redirect to `/admin/stages` on success, error message on failure
- [ ] T084 [US6] Create admin layout `app/(admin)/admin/layout.tsx`: sidebar nav (Stages, Teams, Runners), admin header, sign-out button
- [ ] T085 [P] [US6] Create `components/admin/StageForm.tsx`: form for all Stage fields (stageNumber, name, date, startLocation, endLocation, distanceKm, stageType dropdown, elevationDescription, description, stravaEmbedUrl); Zod-validated client-side; used for both create and edit
- [ ] T086 [P] [US6] Create `components/admin/TeamForm.tsx`: team name, hex color picker, logoUrl field
- [ ] T087 [P] [US6] Create `components/admin/RunnerForm.tsx`: runner name, team selector (dropdown of existing teams), stravaHandle hint field
- [ ] T088 [US6] Create admin stages page `app/(admin)/admin/stages/page.tsx`: list all stages in a table with edit/delete actions; "New Stage" button opens StageForm in a dialog; calls POST/PATCH/DELETE admin API routes
- [ ] T089 [US6] Create admin teams page `app/(admin)/admin/teams/page.tsx`: list teams with runner count; create/edit/delete via TeamForm dialog; calls team admin routes
- [ ] T090 [US6] Create admin runners page `app/(admin)/admin/runners/page.tsx`: list runners with team assignment; create/edit/delete via RunnerForm dialog; calls runner admin routes

**Checkpoint**: US6 functional. Admin can log in, create all 8 stages and teams/runners. Public site reflects changes immediately.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Mobile responsiveness, performance, accessibility, homepage hero, CI.

- [ ] T091 [P] Create homepage hero section `app/(public)/page.tsx`: full-bleed race imagery or gradient, race title overlay, countdown timer to first stage date (fetched from DB or config), "View Route" and "View Teams" CTAs — styled per letour.fr visual reference
- [ ] T092 [P] Audit and implement mobile layouts for all public pages (route list, stage detail, teams, runner profile, standings) — verify all core sections functional at 375px per SC-005
- [ ] T093 [P] Implement loading skeletons for all data-driven pages: route list, stage detail, teams list, team detail, runner profile, standings, stage leaderboard
- [ ] T094 [P] Implement error boundaries in `app/error.tsx` and `app/(public)/route/error.tsx` etc.: human-readable error messages with retry CTA per Constitution III
- [ ] T095 [P] Run axe-core accessibility audit on all public-facing pages; fix all critical and serious violations (WCAG 2.1 AA) per Constitution III quality gate
- [ ] T096 [P] Add `<meta>` tags, Open Graph metadata, and page titles to all `app/**/page.tsx` files via Next.js `generateMetadata`
- [ ] T097 Create GitHub Actions CI workflow in `.github/workflows/ci.yml`: `pnpm install` → `pnpm lint` → `pnpm test --coverage` → `pnpm build`; fail on coverage below 80%
- [ ] T098 [P] Add Prisma seed script in `prisma/seed.ts`: populate all 8 stages with placeholder data for local development and demos
- [ ] T099 [P] Validate `quickstart.md` by following it end-to-end in a clean environment; update any outdated steps
- [ ] T100 [P] Final performance check: verify public page load ≤ 2s, API response p95 ≤ 300ms (read) / 500ms (write) using network tab or Vercel analytics

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 — **BLOCKS all user story phases**
- **Phase 3 (US1)**: Requires Phase 2 — no user story dependencies
- **Phase 4 (US2)**: Requires Phase 2 — no user story dependencies (independent of US1)
- **Phase 5 (US3)**: Requires Phase 2 + Prisma `StravaToken` model from Phase 2
- **Phase 6 (US4)**: Requires Phase 2, Phase 3 (stage pages), Phase 5 (Strava session + token refresh)
- **Phase 7 (US5)**: Requires Phase 2, Phase 6 (results must exist to rank)
- **Phase 8 (US6)**: Requires Phase 2 — can be worked in parallel with US1/US2/US3
- **Final Phase**: Requires all story phases complete

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|-----------|---------------------|
| US1 – Browse Route | Phase 2 | US2, US6 |
| US2 – Browse Teams | Phase 2 | US1, US6 |
| US3 – Connect Strava | Phase 2 | US1, US2, US6 |
| US4 – Submit Result | Phase 2, US1, US3 | US6 (partial) |
| US5 – Standings | Phase 2, US4 | — |
| US6 – Admin CRUD | Phase 2 | US1, US2, US3 |

### Within Each Phase
- Tests MUST be written before implementation and MUST be confirmed failing (Red)
- Models/schemas before services
- Services/lib before API routes
- API routes before page components
- Components before full page assembly

---

## Parallel Opportunities by Phase

### Phase 2 (Foundational)
```
Parallel group A: T013 (NextAuth config) + T016 (root layout) + T020 (Zod schemas) + T021 (UI primitives) + T022 (error utils)
Parallel group B: T017 (Header) + T018 (Footer) + T019 (Nav)
Sequential: T010 → T011 → T012 (Prisma schema → migrate → client) must run in order
Then: T014 (NextAuth route) and T015 (middleware) after T013
```

### Phase 3 (US1)
```
Parallel group: T023 + T024 + T025 + T026 (all tests) — write together
Parallel group: T027 + T028 (API routes) + T029 + T030 (components) — after tests fail
Sequential: T031 (list page) → T032 (detail page) → T033 (nav link)
```

### Phase 8 (US6)
```
Parallel group: T080 + T081 + T082 (all CRUD API routes)
Parallel group: T085 + T086 + T087 (all admin forms)
Sequential: T083 (login) → T084 (layout) → T088 + T089 + T090 (admin pages)
```

---

## Implementation Strategy

### MVP Scope (US1 + US2 only — no auth)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1 — Route)
4. Complete Phase 4 (US2 — Teams & Runners)
5. **Deploy to Vercel** — fully browsable race site with no auth required

This delivers SC-001 (no login needed to browse) and SC-007 (visual design) immediately.

### Full Race-Ready Scope

6. Phase 5 (US3 — Strava connect)
7. Phase 6 (US4 — Result submission)
8. Phase 7 (US5 — Standings)
9. Phase 8 (US6 — Admin CRUD)
10. Final Phase (Polish + CI)

### Recommended First Session (MVP)

T001 → T002 → T003 → T004–T009 (parallel) → T010 → T011 → T012 → T013–T022 (parallel groups) → T023–T026 (US1 tests, confirm red) → T027–T033 (US1 impl)

---

## Summary

| Phase | Tasks | Story | Notes |
|-------|-------|-------|-------|
| Phase 1: Setup | T001–T009 | — | 9 tasks |
| Phase 2: Foundational | T010–T022 | — | 13 tasks |
| Phase 3: US1 Route | T023–T033 | US1 | 11 tasks (4 test, 7 impl) |
| Phase 4: US2 Teams | T034–T047 | US2 | 14 tasks (4 test, 10 impl) |
| Phase 5: US3 Strava Auth | T048–T056 | US3 | 9 tasks (3 test, 6 impl) |
| Phase 6: US4 Submit Result | T057–T070 | US4 | 14 tasks (5 test, 9 impl) |
| Phase 7: US5 Standings | T071–T076 | US5 | 6 tasks (2 test, 4 impl) |
| Phase 8: US6 Admin | T077–T090 | US6 | 14 tasks (3 test, 11 impl) |
| Polish | T091–T100 | — | 10 tasks |
| **Total** | **100 tasks** | | |

**Parallel opportunities**: 67 tasks marked `[P]`  
**Test tasks**: 22 tasks (all must be written before their implementation group)  
**MVP cutoff**: T033 — US1 + US2 complete = browsable race site, deployable
