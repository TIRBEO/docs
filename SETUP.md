# Tirbeo — Development Setup & Conventions

## Architecture Overview

Monorepo of **8 independent Vite + React 19 apps** sharing a **Supabase backend**. Each app is deployed separately to Vercel. Apps communicate via Supabase (shared database), never via direct imports.

```
bishnuneup4ne chat/
├── about/          # Company about page (95%)
├── accounts/       # Auth flow (login, OAuth, password reset) (95%)
├── admin/          # CMS with TipTap editor (90%)
├── blog/           # Blog frontend — placeholder (5%)
├── chat/           # Real-time messaging app (40%)
├── chatlanding/    # Public marketing site (90%)
├── dashboard/      # User workspace hub (15%)
├── docs/           # Documentation reader (95%)
├── supabase/       # DB migrations & config
└── .gitmodules     # 7 submodules (all except chatlanding)
```

**Git submodules** — each app (except chatlanding) is its own repo under TIRBEO org:
- `github.com/TIRBEO/about.git`
- `github.com/TIRBEO/accounts-login.git`
- `github.com/TIRBEO/admin.git`
- `github.com/TIRBEO/blog.git`
- `github.com/TIRBEO/chat.git`
- `github.com/TIRBEO/dashboard.git`
- `github.com/TIRBEO/docs.git`

## Prerequisites

- Node.js 22+
- npm 10+
- Git
- Vercel CLI (for deployments)
- A Supabase account (free tier)

## Getting Started

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/TIRBEO/tirbeo.git
cd tirbeo

# Install dependencies for each app (no root package.json yet)
cd chatlanding && npm install && cd ..
cd accounts && npm install && cd ..
# ... repeat for each app
```

## Environment Variables

Each app has its own `.env` file (not committed — listed in `.gitignore`).  
Copy the example files:

```bash
cp .env.example .env   # per app
```

### Shared Supabase Configuration

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Main DB: `https://mvogfnbqpaiedkkslecn.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Main DB anon key |
| `VITE_APPS_SUPABASE_URL` | Apps DB: `https://cvbtbwmkjdocgrjnhzgb.supabase.co` (chat only) |
| `VITE_APPS_SUPABASE_ANON_KEY` | Apps DB anon key (chat only) |
| `VITE_ACCOUNTS_URL` | Accounts app URL (for cross-app redirects) |

## Development

Each app runs independently on its own port:

| App | Port |
|---|---|
| chatlanding | 5173 |
| accounts | 5174 |
| admin | 5175 |
| dashboard | 5176 |
| chat | 5177 |
| about | 5178 |
| blog | 5179 |
| docs | 5180 |

```bash
cd chatlanding && npm run dev   # → localhost:5173
cd accounts && npm run dev      # → localhost:5174
# etc.
```

All apps use `@vitejs/plugin-react` with `@tailwindcss/vite` plugin, `@/` path alias pointing to `./src`.

## Code Conventions

### File Structure (per app)
```
src/
├── components/     # App-specific components
├── pages/          # Route-level components
├── hooks/          # Custom hooks
├── lib/            # Utilities, constants, API clients
│   ├── config.ts   # App configuration (ACCOUNTS_URL, etc.)
│   ├── supabase.ts # Supabase client instance
│   ├── session.ts  # Auth session helpers
│   └── content.ts  # Content query functions
├── store/          # Zustand stores (optional)
├── types.ts        # Shared types
├── App.tsx         # Root component
├── main.tsx        # Entry point
└── styles.css      # Tailwind imports
```

### Key Rules
- **No cross-app imports** — apps share data only through Supabase
- **No magic strings** — use TypeScript enums or const objects for routes, types, roles
- **Default exports** — every component file exports exactly one component as default
- **Zod validation** — all env vars validated at startup via `env.ts`

## Deployment

Each app deployed independently to Vercel. Vercel.json config already present in each app.

```bash
# Per app
cd chatlanding && vercel --prod
```

Environment variables must be configured in Vercel dashboard for each app.

## Git Workflow

```bash
# Root repo
git add -A && git commit -m "message"

# Submodules — changes must be committed + pushed separately
cd <app> && git add -A && git commit -m "message" && git push origin master

# Then update root submodule pointer
cd .. && git add <app> && git commit -m "chore: update <app> submodule"
```

## Database Migrations

Located in `supabase/migrations/` — apply via Supabase CLI:

```bash
cd supabase
supabase migration list
supabase db push
```

## Related Documents

- `PRD-Continuation-Roadmap.md` — Full product roadmap and phasing
- `supabase/migrations/` — Database migration files
