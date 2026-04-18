# Tonight — movie recommendation web app

A production-style app for indecisive viewers: mood-led preferences, a **short curated shortlist** from TMDb, and a personal **watchlist / watched log** backed by **Supabase** (auth + Postgres + RLS). The UI is **Next.js 15** (App Router) in the `web/` directory, designed for **Vercel**.

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com/) project
- A [TMDb](https://www.themoviedb.org/settings/api) API key

## 1. Database (Supabase)

1. Create a project in the Supabase dashboard.
2. Run the SQL migration in the SQL editor (or via Supabase CLI):

   - File: [supabase/migrations/20250417000000_initial_schema.sql](supabase/migrations/20250417000000_initial_schema.sql)

3. Authentication → URL configuration: add site URLs:

   - `http://localhost:3000/**` (local)
   - Your production URL (e.g. `https://your-app.vercel.app/**`)

4. Copy **Project URL** and the **anon / public** key from **Project Settings → API** for env vars below.  
   If the dashboard shows a **publishable** key (`sb_publishable_…`) and sign-in fails, use the **legacy anon** JWT (`eyJ…`) in `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead — the JS client must match what your project expects.

## 2. Local app

```bash
cd web
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_*, TMDB_API_KEY, NEXT_PUBLIC_SITE_URL
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 3. Vercel deployment

> **Important:** This repo’s Next.js app lives in **`web/`**, not the Git repository root.  
> If **Root Directory** is not set to `web`, you will get **`404: NOT_FOUND`** on `*.vercel.app` (builds may look “successful” in a few seconds because almost nothing ran).  
> Fix: [Vercel → Project → **Settings** → **General** → **Root Directory**](https://vercel.com/docs/deployments/configure-a-build#root-directory) → enter **`web`** → **Save** → **Redeploy**.

1. Import the Git repository in Vercel.
2. Set **Root Directory** to **`web`** (step above — do not skip).
3. In **Vercel → Project → Settings → Environment Variables**, add **all** of the following for **Production** (and **Preview** if you use preview deploys):

| Name | Environments | Notes |
|------|----------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Your Supabase project URL, e.g. `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Public anon / publishable key from Supabase **API** settings |
| `NEXT_PUBLIC_SITE_URL` | Production (required), Preview (optional) | **No trailing slash.** Production: `https://your-domain.vercel.app` (or your custom domain). For preview branches you can set the Vercel preview URL pattern or your default preview URL. |
| `TMDB_READ_ACCESS_TOKEN` *or* `TMDB_API_KEY` | Production, Preview, Development | **Sensitive** — **do not** use `NEXT_PUBLIC_`. The app prefers **`TMDB_READ_ACCESS_TOKEN`** (Bearer, from TMDb **API Read Access Token**). If unset, it uses **`TMDB_API_KEY`** (v3 key in the query string). Set at least one. |

You do **not** need `SUPABASE_SERVICE_ROLE_KEY` for the current app: all writes go through the logged-in user and RLS with the **anon** key.

4. Redeploy after adding or changing variables (or use **Deployments → … → Redeploy**).

**Still 404?** Confirm **Root Directory** is `web`, clear any custom **Output Directory** override under Build settings (Next.js should use the default), and open the deployment **Build Logs** — you should see `next build` running from the `web` package, not an empty install at repo root.

**Supabase Auth:** Under **Authentication → URL configuration**, add your production site URL and Vercel preview URLs to **Redirect URLs** so email confirmation and OAuth return to your app.

## Project layout

| Path | Purpose |
|------|---------|
| [web/](web/) | Next.js application (UI, API routes, server actions) |
| [supabase/migrations/](supabase/migrations/) | Postgres schema, RLS, profile trigger |
| [archive/backend-fastapi/](archive/backend-fastapi/) | Legacy FastAPI stack (reference only) |

## Features

- **Anonymous recommendations** — mood / tone / genres / runtime / era / streaming filters; results stored in `sessionStorage` until refresh.
- **Signed-in users** — watchlist, watched, dismissed titles stored in Supabase; recommendations exclude watched + dismissed; optional session logging.
- **TMDb** — all movie calls go through the server (`TMDB_API_KEY` never exposed to the browser).

## Scripts (from `web/`)

```bash
npm run dev      # development with Turbopack
npm run build    # production build
npm run start    # run production server
npm run lint     # ESLint
```

## Legal

This product uses the TMDb API but is not endorsed or certified by TMDb.
