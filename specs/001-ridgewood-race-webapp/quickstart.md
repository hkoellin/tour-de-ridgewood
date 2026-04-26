# Quickstart: Tour de Ridgewood Web Application

**Date**: April 25, 2026  
**Plan**: [plan.md](plan.md) | **API Contracts**: [contracts/api-routes.md](contracts/api-routes.md)

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS | https://nodejs.org |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Git | any | https://git-scm.com |
| PostgreSQL | 15 (remote) | Supabase free tier |

You also need:
- A **Supabase** project (free tier) for the database — https://supabase.com
- Your existing **Strava API app** credentials (`client_id` and `client_secret`)

---

## 1. Clone and Install

```bash
git clone https://github.com/hkoellin/tour-de-ridgewood.git
cd tour-de-ridgewood
pnpm install
```

---

## 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

`.env.local` values to set:

```env
# Database (Supabase)
DATABASE_URL="postgres://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Strava OAuth (your existing app)
STRAVA_CLIENT_ID="your_strava_client_id"
STRAVA_CLIENT_SECRET="your_strava_client_secret"

# Admin credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="bcrypt-hash-of-your-password"
# Generate hash: node -e "const b=require('bcryptjs'); console.log(b.hashSync('yourpassword', 12))"

# Race configuration — ISO 8601, used for homepage countdown
NEXT_PUBLIC_RACE_START_DATE="2025-09-06T09:00:00-04:00"
```

---

## 3. Database Setup

Run Prisma migrations to create the schema:

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

Seed the database with the 8 stages and placeholder teams:

```bash
pnpm prisma db seed
```

Verify the connection:

```bash
pnpm prisma studio
```

This opens a browser UI at `localhost:5555` to browse your tables.

---

## 4. Run the Development Server

```bash
pnpm dev
```

App runs at http://localhost:3000.

---

## 5. Set Up Strava OAuth Callback

In your Strava API settings (https://www.strava.com/settings/api), set the **Authorization Callback Domain** to:
- Development: `localhost`
- Production: your Vercel domain, e.g., `tour-de-ridgewood.vercel.app`

---

## 6. Create Initial Data (Admin)

After seeding (`pnpm prisma db seed`), all 8 stages and 4 placeholder teams are pre-populated.

1. Navigate to http://localhost:3000/login (admin login)
2. Sign in with `ADMIN_USERNAME` / unhashed password
3. Go to `/admin/stages` → Review or edit stages as needed
4. Go to `/admin/teams` → Edit placeholder teams or create new ones
5. Go to `/admin/runners` → Add runners and assign to teams

---

## 7. Test Strava Connection (as a Runner)

1. From the home page, click **Connect with Strava**
2. Authorize the app on Strava
3. You'll be redirected back and recognized as a participant
4. Your name should appear highlighted in your team's roster

---

## 8. Run Tests

```bash
# Unit + integration tests
pnpm test

# E2E tests (requires running dev server)
pnpm dev &
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

Coverage threshold: ≥ 80% line coverage on `lib/` (enforced in CI).

---

## 9. Deploy to Vercel

```bash
pnpm build  # verify build locally first
```

Then deploy:
1. Push to GitHub
2. Import the repo in Vercel
3. Set all environment variables from `.env.local` in the Vercel dashboard
4. Set `NEXTAUTH_URL` to your production URL (e.g., `https://tour-de-ridgewood.vercel.app`)
5. Vercel auto-deploys on every push to `master`

---

## Key URLs (local development)

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Home page |
| http://localhost:3000/route | Stage list |
| http://localhost:3000/route/1 | Stage 1 detail |
| http://localhost:3000/teams | Teams list |
| http://localhost:3000/standings | Overall GC |
| http://localhost:3000/login | Admin login |
| http://localhost:3000/admin/stages | Admin: manage stages |
| http://localhost:3000/admin/teams | Admin: manage teams |
| http://localhost:3000/admin/runners | Admin: manage runners |
| http://localhost:5555 | Prisma Studio (DB browser) |
