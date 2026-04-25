# Implementation Plan: Tour de Ridgewood Web Application

**Branch**: `master` | **Date**: April 25, 2026 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-ridgewood-race-webapp/spec.md`

---

## Summary

Build a publicly-accessible web application modeled after letour.fr that presents 8 running race stages set around Ridgewood, Queens. The core sections are **Route** (stage detail pages with embedded Strava route/segment links) and **Teams** (team rosters and runner profiles). Runners connect their Strava account via OAuth2 to submit stage results, which feed into per-stage leaderboards and an overall general classification. A single admin account manages all content via a protected admin UI. The stack is **Next.js 14 (App Router) + TypeScript**, **PostgreSQL** (hosted on Supabase), deployed to **Vercel**.

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS  
**Framework**: Next.js 14 (App Router, RSC + Server Actions)  
**Primary Dependencies**:
- `next`, `react`, `react-dom` — framework
- `next-auth` v5 — authentication (Strava OAuth2 + credentials provider for admin)
- `prisma` + `@prisma/client` — ORM for PostgreSQL
- `zod` — schema validation (API inputs, form data)
- `tailwindcss` — styling
- `@radix-ui/*` — accessible UI primitives (design system base)
- `swr` — client-side data fetching on participant-facing mutations

**Storage**: PostgreSQL 15 hosted on Supabase (connection pooling via Supabase pooler)  
**Testing**: `vitest` + `@testing-library/react` (unit/component), Playwright (e2e)  
**Target Platform**: Web — Vercel (Node.js + Edge runtimes)  
**Project Type**: Full-stack web application (monorepo, single Next.js app)  
**Performance Goals**:
- Page load ≤ 2 seconds on median device + standard connection (Constitution IV, SC-005)
- API p95 ≤ 300 ms reads / ≤ 500 ms writes (Constitution IV)
- Results reflected on standings within 60 seconds of submission (SC-003)

**Constraints**:
- All public pages (route, teams, results, standings) require zero auth prompts (SC-001)
- Mobile-first: all core sections functional at 375 px and above (SC-005)
- Strava API rate limits: 100 req/15 min, 1000 req/day — no background polling; fetch on-demand only
- ~10–30 runners, exactly 8 stages — no pagination required for v1
- Race is 1–3 months away; countdown timer must work with a real target date from DB/config

**Scale/Scope**: ~30 users max concurrent, 8 stages, 6 user stories, ~15 FR requirements

---

## Constitution Check

*Gates evaluated against the [Tour de Ridgewood Constitution](../../.specify/memory/constitution.md)*

| # | Gate | Status | Notes |
|---|------|--------|-------|
| I | Code Quality — SRP, self-documenting, no magic strings | ✅ PLANNED | Named constants for stage count/types; Prisma enums for `StageType`; no magic strings in Strava client |
| II | Testing Standards — TDD, ≥80% coverage, integration tests | ✅ PLANNED | Vitest for standings logic + validation; Playwright for Strava OAuth, result submission e2e |
| III | UX Consistency — design system, loading/empty/error states | ✅ PLANNED | Tailwind + Radix as design system; all data surfaces require loading skeleton, empty state, and error boundary |
| IV | Performance — ≤2s load, API p95 ≤300ms, no regressions | ✅ PLANNED | RSC static generation for public pages; indexed FK columns and cumulative time queries in Prisma |

**No violations detected.** All gates achievable with the chosen stack.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-ridgewood-race-webapp/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── api-routes.md    ← HTTP API contracts
│   └── strava-integration.md  ← Strava OAuth + activity fetch contract
└── tasks.md             ← Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
tour-de-ridgewood/
├── app/                              # Next.js App Router
│   ├── (public)/                     # No auth required
│   │   ├── page.tsx                  # Home / hero + countdown
│   │   ├── route/
│   │   │   ├── page.tsx              # All 8 stages list
│   │   │   └── [stageNumber]/
│   │   │       └── page.tsx          # Stage detail + Strava embed
│   │   ├── teams/
│   │   │   ├── page.tsx              # Teams list
│   │   │   ├── [teamId]/
│   │   │   │   └── page.tsx          # Team detail / roster
│   │   │   └── runners/
│   │   │       └── [runnerId]/
│   │   │           └── page.tsx      # Runner profile + results
│   │   ├── results/
│   │   │   └── [stageNumber]/
│   │   │       └── page.tsx          # Stage leaderboard
│   │   └── standings/
│   │       └── page.tsx              # Overall GC standings
│   ├── (participant)/                # Strava OAuth required
│   │   └── submit/
│   │       └── [stageNumber]/
│   │           └── page.tsx          # Activity picker + result submission
│   ├── (admin)/                      # Credentials auth required
│   │   ├── login/page.tsx
│   │   └── admin/
│   │       ├── stages/               # CRUD stages
│   │       ├── teams/                # CRUD teams
│   │       └── runners/              # CRUD runners + team assignment
│   └── api/
│       ├── auth/[...nextauth]/       # NextAuth handler
│       ├── stages/                   # Stage read/write routes
│       ├── teams/                    # Team read/write routes
│       ├── runners/                  # Runner read/write routes
│       ├── results/                  # Result submission + update
│       └── standings/                # GC standings query
├── components/
│   ├── layout/                       # Header, Footer, Nav, Mobile menu
│   ├── stages/                       # StageCard, StageMap (Strava iframe)
│   ├── teams/                        # TeamCard, RunnerRow
│   ├── results/                      # LeaderboardTable, ResultRow
│   ├── standings/                    # GCTable, StandingsRow
│   ├── admin/                        # Admin forms and data tables
│   └── ui/                           # Radix-based primitives (Button, Dialog, etc.)
├── lib/
│   ├── db/                           # Prisma client singleton
│   ├── strava/                       # OAuth token refresh, activity fetch
│   ├── auth/                         # NextAuth config, session helpers, role types
│   ├── standings/                    # Cumulative time calculation (pure, testable)
│   └── validation/                   # Zod schemas for all API inputs
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/                         # Vitest: standings calc, validation, strava helpers
│   ├── integration/                  # Vitest + test DB: API routes, Prisma queries
│   └── e2e/                          # Playwright: OAuth flow, result submission
├── public/                           # Static assets (team logos, race branding)
├── styles/                           # global.css, Tailwind config
├── middleware.ts                     # Route protection (admin + participant guards)
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── .env.local                        # DATABASE_URL, STRAVA_*, NEXTAUTH_SECRET
```

**Structure Decision**: Single Next.js App Router monorepo using route groups for auth segmentation. Public pages use RSC for fast static/ISR rendering. Business logic in `lib/` is framework-agnostic and fully unit-testable. Admin and participant sections are protected via `middleware.ts` redirects.

---

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
