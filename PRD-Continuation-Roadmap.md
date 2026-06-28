# Tirbeo — Product Requirements Document: Continuation & Completion Roadmap

**Version:** v1.0 — Continuation PRD  
**Date:** June 2026  
**Document Type:** Full Roadmap PRD  
**Codebase Architecture:** Monorepo — 8 independent Vite + React 19 apps  
**Backend:** Supabase (PostgreSQL + Realtime + Auth)  
**Primary Stack:** React 19, TypeScript 6, Vite 8, Tailwind 4, Framer Motion, TipTap

---

## 1. Executive Summary

Tirbeo is a full-stack community workspace platform — a professional alternative to Discord and Slack — built as a monorepo of 8 independent Vite + React 19 applications sharing a Supabase backend. The platform targets creators, teams, and communities that need structured, intentional collaboration rather than the chaotic, real-time-first model of existing tools.

As of June 2026, the platform is architecturally sound and the supporting infrastructure (auth, admin, docs, marketing) is largely complete. The core product experience — chat, dashboard, and blog — remains significantly underdeveloped and represents the critical gap between the current state and a shippable v1.

This PRD defines the full continuation roadmap: what to build, in what order, and how to resolve the architectural debt (dual databases, missing CI/CD, exposed secrets) that will block a production launch.

### Current Completion Snapshot

| App | Complete | Status | Current State | Next Priority |
|---|---|---|---|---|
| chatlanding | 90% | STABLE | Public marketing site — 12 sections | Performance, animations, CTA optimisation |
| accounts | 95% | STABLE | Full auth flow (login, OAuth, password reset) | Session hardening, 2FA, token rotation |
| admin | 90% | STABLE | CMS with TipTap editor, audit log, 28 pages | Role-based permissions, media manager |
| docs | 95% | STABLE | Documentation reader — search, TOC, MDX | Versioning, i18n, contributor flow |
| about | 95% | STABLE | Company about page — DB-driven + fallbacks | Animation polish, team data pipeline |
| chat | 40% | IN PROGRESS | Basic real-time messaging only | Channels, threads, file sharing, reactions |
| dashboard | 15% | NEEDS BUILD | Layout shell — essentially empty | Full workspace UI, activity feeds, widgets |
| blog | 5% | NEEDS BUILD | Placeholder `<h1>` only | Full CMS-driven blog frontend |

---

## 2. Critical Issues to Resolve Before Feature Work

These are non-negotiable blockers. Shipping features on top of these issues creates compounding technical debt and security exposure. They must be addressed before any Phase 2 or later work begins.

### 2.1 Security: OAuth Secrets in .env Files

**🔴 CRITICAL SECURITY ISSUE**

- OAuth client secrets and API keys are currently checked into .env files in the repository
- If the repo is public or shared, credentials are already compromised
- All exposed secrets must be rotated immediately after migrating to a secrets manager
- No further developer access should be granted until this is resolved

**Immediate actions:**

- Audit all .env files across all 8 apps for secrets
- Rotate all exposed credentials (OAuth, Supabase service keys, API tokens)
- Move all secrets to environment-specific secret stores (Vercel Environment Variables, GitHub Actions secrets, or a dedicated vault)
- Add `.env*` (except `.env.example`) to .gitignore at the repo root
- Create `.env.example` files for each app with placeholder values and required key documentation
- Run `git-secrets` or `truffleHog` scan on full commit history to assess historical exposure

### 2.2 Architecture: Two Separate Supabase Databases

**⚠️ ARCHITECTURAL DEBT**

- The monorepo currently points to 2 separate Supabase projects — unusual and problematic
- Cross-app data queries (e.g. dashboard reading chat data) require either duplication or an API layer
- Auth sessions may not be portable across apps if projects use different JWT secrets
- Long term: increases cost, maintenance burden, and operational complexity

**Recommended resolution:**

- Audit which apps point to which Supabase project and why
- Define a canonical single Supabase project as the source of truth
- Migrate all tables, RLS policies, edge functions, and storage buckets into that single project
- Update all apps to use shared environment config pointing to the unified project
- If the split was intentional (e.g. staging vs prod), document it explicitly and establish a migration pipeline

### 2.3 Infrastructure: No Testing, CI/CD, or Shared Build Tooling

The monorepo has no test suite, no continuous integration, and no shared build configuration. This means every deployment is a manual, untested risk.

| Infrastructure Item | Purpose & Rationale |
|---|---|
| Shared tsconfig.json | Root-level TypeScript config extended by each app — enforce consistent compiler options |
| Shared ESLint config | Single lint ruleset across all 8 apps — consistency and code quality |
| Shared Tailwind preset | Design tokens, colour palette, and spacing scale as a shared preset to prevent drift |
| Turborepo or Nx | Monorepo task runner for parallel builds, caching, and dependency graph management |
| Vitest | Fast unit and integration testing — co-locate tests with components |
| Playwright | E2E testing for critical user journeys (auth, chat, dashboard) |
| GitHub Actions | CI pipeline: lint → type-check → test → build on every PR and push to main |
| Preview Deployments | Vercel or similar — every PR gets a deployed preview URL for review |

---

## 3. Phase 1 — Chat App: Core Product Experience (40% → 100%)

Chat is the core of a community workspace. The current implementation has only basic real-time messaging — no channels, no threads, no file sharing, no reactions. This is the highest-priority feature gap and must be completed before any community can meaningfully use Tirbeo.

### 3.1 Channel Architecture

Channels are the fundamental organisational unit. Every message must belong to a channel.

| Channel Type | Behaviour |
|---|---|
| Text channels | Standard messaging channels — the default channel type |
| Announcement channels | Admin/moderator-only write access; all members can read; used for org-wide broadcasts |
| Thread channels | A channel where every message spawns an independent thread — ideal for Q&A or async discussion |
| Private channels | Invite-only; not visible in the channel list to non-members; encrypted at rest |
| DM threads | One-to-one direct messages — stored as a private channel between exactly 2 users |
| Group DMs | Private channel between 2–10 users; upgradeable to a named private channel |

**Data model additions required:**

- `channels` table: `id, workspace_id, name, type, topic, is_private, created_by, created_at, archived_at`
- `channel_members` table: `channel_id, user_id, role (owner|admin|member), joined_at`
- `messages` table: extend with `channel_id, thread_parent_id` (nullable), `edited_at, deleted_at`

### 3.2 Threads

Threads allow structured sub-conversations inside a channel message, preventing the main channel from becoming a noisy stream of replies. This is one of Tirbeo's key differentiators vs Discord.

- Any message can be "open as thread" — spawns a right-side thread panel
- Thread reply count and last-reply preview shown inline on the parent message
- Thread participants receive notifications for new replies
- Threads are indexed and searchable independently
- Thread summary: collapse long threads to first + last 2 messages with "View all X replies"

### 3.3 File Sharing & Media

| Media Type | Behaviour |
|---|---|
| Image upload | Drag-and-drop or paste from clipboard; preview inline in message; Supabase Storage backend |
| File upload | Any file type up to 50MB; shows file card with name, size, type icon, download action |
| Video embed | YouTube/Loom/Vimeo URL auto-embeds as a player; other video files show thumbnail + download |
| Code blocks | Fenced code blocks with syntax highlighting (Shiki); copy-to-clipboard action |
| Link previews | OG tag scraping for rich URL previews (title, description, image) — worker-based, not blocking |
| Giphy integration | GIF search and inline embed via `/gif` slash command |

### 3.4 Message Interactions

- Emoji reactions — quick-react panel (6 most recent + full emoji picker)
- Edit message — inline editor with edit history preserved and "(edited)" label
- Delete message — soft delete: message replaced with "This message was deleted" placeholder for 30s before hard removal
- Pin message — pinned messages accessible via channel header pin icon
- Bookmark message — user-specific; accessible in profile sidebar
- Forward message — share a message into another channel or DM with optional commentary
- Reply to message — single-level quoted reply in the same channel (not a thread)

### 3.5 Real-Time & Presence

- Supabase Realtime for message delivery — channel-based subscriptions
- Typing indicators — show "User is typing…" with 3s debounce, max 3 names then "X people typing"
- Online presence — green dot for active, yellow for idle (>5min), grey for offline
- Read receipts — per-channel "last read" cursor; unread message count badge on channel list
- Push notifications — web push via Service Worker for mentions and DMs when tab is not focused
- Sound notifications — optional notification sounds; respects OS Do Not Disturb

### 3.6 Search

- Global search across all channels the user is a member of
- Filters: From (user), In (channel), Date range, Has (file|link|reaction)
- Full-text search via Supabase `pg_trgm` or a dedicated search index
- Result highlight: show matched text in context with 2 lines before/after
- Jump to message in channel from search result

---

## 4. Phase 2 — Dashboard App: Workspace Hub (15% → 100%)

The dashboard is the logged-in home — the first screen a member sees after authentication. Currently it is a layout shell with no content. It must become the command centre for the workspace: activity overview, navigation, quick actions, and personalised insights.

### 4.1 Dashboard Layout Architecture

| Region | Content & Purpose |
|---|---|
| Left sidebar | Workspace switcher (if multi-workspace), channel list with unread counts, DM list, navigation links |
| Main content area | Activity feed, pinned content, quick links — contextual to selected workspace or channel |
| Right sidebar | Member list for current channel, thread panel (when open), user profile cards |
| Top bar | Global search, notification bell, user avatar + quick settings |
| Command palette | ⌘K / Ctrl+K — search channels, users, commands, recent messages, admin actions |

### 4.2 Activity Feed

The activity feed is the central pane of the dashboard. It surfaces recent, relevant activity across the workspace so members stay oriented without having to check every channel.

- Unified feed combining: new messages in followed channels, thread replies, reactions to user messages, @mentions, file shares, new members joining
- Feed is sorted chronologically with real-time updates
- Card-style items: avatar, user name, action description, channel context, timestamp, quick-action buttons (reply, react, jump-to)
- Filter bar: All | Mentions | Threads | Files | Reactions
- Mark all as read action
- "Catch up" mode: summarised digest when returning after >24 hours away

### 4.3 Workspace Overview Widgets

| Widget | Description |
|---|---|
| Quick stats bar | Members online now, messages today, active channels — refreshed every 60s |
| Pinned channels | User-pinned channels with latest message preview and unread count |
| Recent files | Last 10 files shared across all accessible channels; filterable by type |
| Upcoming events | Calendar widget — integrates with a future Events feature; placeholder in v1 |
| Team activity heatmap | GitHub-style contribution graph showing message volume by day/hour over 30 days |
| Member spotlight | Recently joined members card — encourages community welcome culture |

### 4.4 User Profile & Settings

- Profile page: avatar, display name, bio, role/title, joined date, recent activity summary
- Notification preferences: per-channel mute, mention-only mode, DM settings, email digest frequency
- Appearance: dark / light / system theme toggle, font size, message density (compact vs comfortable)
- Connected accounts: OAuth providers linked to the account, revoke access per provider
- Privacy: show online status, allow DMs from non-contacts, message read receipts
- Keyboard shortcuts reference panel (accessible via `?` key)

### 4.5 Workspace Administration (from Dashboard)

While the standalone admin app handles deep CMS functions, common admin tasks should also be accessible from within the dashboard context for workspace owners and admins.

- Invite members: generate invite link or send email invite
- Manage roles: assign workspace roles (Owner, Admin, Moderator, Member, Guest)
- Channel management: create, archive, rename channels; set topic; manage members
- Member management: view all members, suspend/remove, view join date and activity level
- Audit log view: last 100 admin actions (mirrored from admin app)

---

## 5. Phase 3 — Blog App: Content & SEO Engine (5% → 100%)

The blog app currently has a single `<h1>` placeholder. It must become a fully functional content platform — feeding the marketing site with SEO-optimised articles and product updates authored through the admin CMS (which already has TipTap editor and content management at 90%).

### 5.1 Blog Frontend Architecture

- Post listing page: paginated grid with cover image, title, excerpt, tags, reading time, author avatar, publish date
- Post detail page: full article render, table of contents sidebar, author bio footer, related posts
- Tag/category pages: filtered post lists
- Search: client-side Fuse.js search across post titles and excerpts; SSR search for deep content
- RSS feed: auto-generated `/rss.xml` for feed readers
- Sitemap: auto-generated `/sitemap.xml` with `lastmod` dates for SEO

### 5.2 Content Model (Supabase)

| Table | Columns |
|---|---|
| posts | `id, slug, title, excerpt, content (TipTap JSON), cover_image_url, author_id, status (draft|published|archived), published_at, reading_time_mins, seo_title, seo_description, og_image_url` |
| tags | `id, name, slug, description, color` |
| post_tags | `post_id, tag_id` (join table) |
| authors | `id, display_name, bio, avatar_url, twitter_handle, website_url` (separate from user accounts) |
| post_views | `post_id, viewed_at, session_id` — for view count analytics (no PII) |

### 5.3 Admin → Blog Pipeline

The admin app already has a TipTap-powered editor. The connection between admin authoring and blog display must be wired:

1. Admin creates/edits post in admin app using TipTap rich text editor
2. Content saved to `posts` table in Supabase as TipTap JSON
3. Admin previews post via a `/preview/:slug` route in the blog app (authenticated, draft-visible)
4. Admin sets status to "published" and sets `published_at` timestamp
5. Blog app queries only published posts with `published_at <= now()`
6. Revalidation: ISR (Incremental Static Regeneration) with 60s revalidation period

### 5.4 SEO & Performance Requirements

- Every post page must have unique `<title>`, `<meta description>`, and Open Graph tags
- Canonical URLs on all pages to prevent duplicate content penalties
- Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, FID < 100ms
- Images: next-gen formats (AVIF/WebP), lazy loading, explicit width/height to prevent layout shift
- Structured data: `Article` schema markup for Google rich results
- Reading progress indicator (scroll-based progress bar in post header)
- Social sharing: pre-populated tweet/LinkedIn share buttons on each post

---

## 6. Phase 4 — Shared Platform & Cross-App Infrastructure

Several capabilities must exist at the platform level — not inside any single app — because they are consumed by multiple apps or must work consistently across the monorepo.

### 6.1 Shared Package: `@tirbeo/ui`

A shared component library extracted from the most mature apps (accounts, admin, docs) and made available to all 8 apps as a local workspace package.

- **Design tokens:** colour scale, typography scale, spacing, border radius, shadow — as CSS custom properties and Tailwind preset
- **Primitive components:** Button, Input, Select, Checkbox, Radio, Toggle, Badge, Avatar, Tag, Tooltip, Popover
- **Layout components:** Modal, Sheet (slide-in panel), Dropdown, Tabs, Accordion
- **Feedback components:** Toast/Snackbar, Alert, Empty state, Skeleton loaders, Spinner
- **Typography components:** Heading, Body, Code, Link — with consistent scale
- **Dark/light theme:** CSS variable swap via `data-theme` attribute; no runtime JS cost

### 6.2 Shared Package: `@tirbeo/supabase`

- Single Supabase client instance factory — reads from shared env config
- Typed database schema: generated types from Supabase CLI (`supabase gen types typescript`)
- Shared query hooks: `useUser`, `useWorkspace`, `useChannel`, `usePosts` — built on TanStack Query
- Auth utilities: `getSession`, `refreshSession`, `signOut` — consistent across all apps
- RLS policy documentation: every table's Row Level Security policies documented in a single reference file

### 6.3 Notifications System

| Type | Description |
|---|---|
| In-app notifications | Bell icon in dashboard/chat top bar; notification feed with read/unread state; mark all read |
| Push notifications | Web Push API via Service Worker; requires user permission; for mentions, DMs, and thread replies |
| Email notifications | Supabase Edge Functions + Resend or Postmark; for daily digest, @mentions, new DMs when offline |
| Notification preferences | Per-channel and per-workspace granularity; global mute; scheduled quiet hours |
| Notification grouping | Multiple events in the same channel grouped: "5 new messages in #general" |

### 6.4 Search Infrastructure

- Global search via Supabase full-text search (tsvector columns on messages, posts, users, channels)
- Search results unified across entity types with type labels and jump-to links
- Recent searches saved to localStorage; cleared on sign-out
- Keyboard-navigable results list (arrow keys + Enter)
- Empty state: "No results for X" with suggested alternative queries

---

## 7. Phase 5 — Remaining App Polish (90–95% → Production)

The five apps already at 90–95% completion are not production-ready. Each has specific remaining work before they can be considered stable for launch.

### 7.1 chatlanding (90% → 100%)

- Performance audit: Lighthouse score ≥ 90 on mobile and desktop for all 12 sections
- Animation polish: ensure Framer Motion animations are GPU-accelerated; reduce layout thrash
- CTA validation: A/B test primary CTA copy ("Join the community" vs "Start for free")
- Cookie consent banner: GDPR-compliant; blocks analytics until consent given
- Broken link audit: all nav links, footer links, and CTA buttons point to correct destinations

### 7.2 accounts (95% → 100%)

- 2FA: TOTP-based two-factor authentication (authenticator app) via Supabase Auth MFA
- Session management: view active sessions, revoke individual sessions from profile settings
- Token rotation: implement rolling refresh token rotation; revoke on suspicious activity
- Rate limiting: brute-force protection on login (5 attempts → 15min lockout)
- Account deletion: full data deletion flow with 30-day grace period and confirmation email

### 7.3 admin (90% → 100%)

- Role-based access control: Admin, Editor, Viewer roles — scope UI and API access accordingly
- Media manager: upload, browse, and insert images from a centralised media library in TipTap
- Bulk actions: bulk delete, bulk publish, bulk tag assignment in content lists
- Audit log improvements: filterable by user, action type, and date range; exportable to CSV
- Admin API security: all admin endpoints must validate JWT + admin role claim server-side

### 7.4 docs (95% → 100%)

- Versioned docs: `/docs/v1/`, `/docs/v2/` path structure with version switcher dropdown
- Contributor flow: "Edit this page on GitHub" link on every doc page
- i18n scaffolding: i18n-ready URL structure (`/en/`, `/es/`) even if only English content in v1
- Last updated timestamp: pulled from Git commit date, displayed in doc page footer

### 7.5 about (95% → 100%)

- Animation: Framer Motion entrance animations for team cards and values section
- Team data pipeline: admin-editable team member profiles (name, photo, title, bio, socials)
- Press kit section: logo downloads, brand colours, media contact email

---

## 8. Master Roadmap & Phasing

| Phase | Duration | Focus Area | Key Deliverables |
|---|---|---|---|
| Phase 0 | Week 1–2 | Security & Infra Foundations | Rotate all exposed OAuth secrets and API keys; Migrate to single Supabase project (audit + consolidate); Set up Turborepo with shared tsconfig, ESLint, Tailwind preset; GitHub Actions CI: lint + type-check + build on all PRs; Add .env.example for all 8 apps; secrets to Vercel env vars; Deploy preview environments via Vercel per PR |
| Phase 1 | Week 3–8 | Chat App: Core Features | Channel architecture (text, announcement, thread, private channels); Thread system with right-side thread panel; File and media upload (images, files, code blocks, link previews); Message interactions (reactions, edit, delete, pin, bookmark); Real-time presence and typing indicators; Read receipts and unread counts; Full-text message search with filters |
| Phase 2 | Week 9–14 | Dashboard App: Workspace Hub | Three-panel layout (sidebar + main + right rail); Activity feed with real-time updates and filter bar; Workspace overview widgets (stats, pinned channels, recent files); User profile and notification preferences; Workspace admin actions (invite, roles, channel management); Command palette (⌘K) with global navigation |
| Phase 3 | Week 15–18 | Blog App: Content Platform | Post listing page with pagination, tags, and search; Post detail page with TOC sidebar and author bio; Admin → blog pipeline (TipTap → published post flow); RSS feed and sitemap generation; SEO meta tags and Open Graph on all post pages; Reading progress indicator and social share buttons |
| Phase 4 | Week 19–22 | Shared Platform Infrastructure | @tirbeo/ui shared component library (primitives + layout + feedback); @tirbeo/supabase shared client + typed schema + query hooks; Unified notifications system (in-app + push + email); Global cross-app search with unified result types; Vitest unit tests — target 70% coverage on shared packages; Playwright E2E tests for auth, chat, dashboard critical paths |
| Phase 5 | Week 23–26 | 90–95% App Polish & Launch Prep | 2FA + session management in accounts app; RBAC + media manager in admin app; Versioned docs + contributor links in docs app; Lighthouse ≥ 90 performance on chatlanding; Cookie consent, privacy policy, terms of service pages; Load testing: 1,000 concurrent WebSocket connections; Soft launch: invite-only beta with 50 communities |

---

## 9. Technical Decisions & Open Questions

### 9.1 Monorepo Management

| Decision Area | Recommendation |
|---|---|
| Task runner | Adopt Turborepo — lightest-weight option, native Vite support, excellent caching. Alternative: Nx (more features, more overhead). |
| Package linking | Use npm/pnpm workspaces for `@tirbeo/*` packages. pnpm preferred for stricter dependency hoisting. |
| Versioning | Fixed versioning for shared packages in v1 (all packages share a single version number). Switch to independent versioning post-launch. |

### 9.2 Real-Time Architecture

| Area | Decision & Rationale |
|---|---|
| WebSocket provider | Supabase Realtime is the default choice (already integrated). For scale > 10k concurrent users, evaluate migrating to Ably or Pusher. |
| Message ordering | Use Supabase insertion order (`created_at` + sequential id). For distributed writes at scale, evaluate Hybrid Logical Clocks. |
| Optimistic updates | Messages should appear instantly in the UI before server confirmation. On failure, show error state and "retry" option. |
| Reconnection | Implement exponential backoff reconnection logic in the Supabase Realtime client wrapper. Surface connection status to the user. |

### 9.3 State Management

| State Domain | Approach |
|---|---|
| Server state | TanStack Query for all Supabase data — caching, background refetch, optimistic updates, pagination. |
| Client UI state | React context for theme and auth session. Zustand for complex cross-component state (e.g. open thread panel ID, command palette state). |
| Form state | React Hook Form with Zod validation — standardise across all apps. |
| Real-time state | Supabase Realtime subscriptions wrapped in custom hooks; update TanStack Query cache on incoming events. |

---

## 10. Non-Functional Requirements

### 10.1 Performance Targets

| Metric | Target |
|---|---|
| Chat message delivery | < 200ms end-to-end latency (client send → all recipients receive) under normal load |
| Dashboard initial load | Time to interactive < 3s on 4G mobile; < 1.5s on desktop broadband |
| Blog post load | LCP < 2.5s; CLS < 0.1; INP < 200ms (Core Web Vitals green thresholds) |
| Search results | < 500ms from keystroke to results displayed (with 300ms debounce) |
| WebSocket connections | Support 1,000 concurrent connections per Supabase Realtime channel in v1 |
| File upload | Progress bar shown for any upload > 1MB; 50MB max file size; chunked upload for > 10MB |

### 10.2 Accessibility

- WCAG 2.1 AA compliance across all 8 apps
- Keyboard navigability: all interactive elements reachable and operable via keyboard
- Focus management: focus trapped correctly in modals; restored to trigger element on close
- Screen reader: semantic HTML, ARIA labels on icon-only buttons, live regions for real-time updates
- Colour contrast: minimum 4.5:1 for body text, 3:1 for large text in both themes
- Reduced motion: all animations respect `prefers-reduced-motion` media query

### 10.3 Security Baseline

- All Supabase tables must have Row Level Security (RLS) enabled — no public tables without explicit intent
- Content Security Policy (CSP) headers on all apps to prevent XSS
- CORS: restrict origins to known app domains only
- Input sanitisation: all user-generated content sanitised server-side before storage (TipTap output via DOMPurify)
- Rate limiting: auth endpoints (5 req/min), API endpoints (100 req/min per user), file uploads (10 req/min)
- Dependency audit: `npm audit` run in CI; no high or critical severity vulnerabilities allowed to ship

---

## 11. Success Metrics & Definition of Done

### 11.1 Per-App Definition of Done

| Scope | Definition of Done |
|---|---|
| All apps | Zero TypeScript errors; ESLint passing; Lighthouse ≥ 85 mobile; WCAG AA; E2E tests for critical paths |
| chat | Channels, threads, file sharing, reactions, search all functional; < 200ms message latency |
| dashboard | Activity feed live-updating; all widgets rendering real data; command palette functional |
| blog | Posts renderable from Supabase; RSS + sitemap auto-generated; OG tags present |
| chatlanding | All 12 sections rendering; Lighthouse ≥ 90; cookie consent functional |
| accounts | 2FA working; session management; rate limiting on auth endpoints |
| admin | RBAC enforced; media manager working; audit log exportable |

### 11.2 Platform-Level Success Metrics (Soft Launch)

- Time-to-first-message < 3 minutes from account creation for a new user
- Day-7 retention ≥ 40% for beta communities (users returning 7 days after first message)
- Zero P0 security incidents in first 30 days post-launch
- Blog: 3 posts published at launch; ≥ 500 organic visits in first 30 days
- Error rate < 0.1% on all API endpoints (measured via Supabase logs + Sentry)

---

## 12. Appendix: Suggested File Structure Conventions

Each app in the monorepo should follow a consistent internal structure to reduce cognitive overhead when switching between apps:

| Path | Contents |
|---|---|
| `apps/<name>/src/components/` | App-specific components (never import from other apps) |
| `apps/<name>/src/pages/` or `routes/` | Route-level components / TanStack Router route files |
| `apps/<name>/src/hooks/` | App-specific custom hooks |
| `apps/<name>/src/lib/` | Utility functions, constants, API client instances |
| `apps/<name>/src/store/` | Zustand stores (if used in that app) |
| `packages/ui/src/` | Shared component library (`@tirbeo/ui`) |
| `packages/supabase/src/` | Shared Supabase client + types + hooks (`@tirbeo/supabase`) |
| `packages/config/` | Shared tsconfig, eslint config, tailwind preset |
| `.github/workflows/` | CI/CD pipeline definitions |
| `supabase/` | Supabase CLI config, migrations, seed files, edge functions |

**Key conventions:**

- No cross-app imports — apps communicate only via Supabase (shared database) or shared packages
- Every component file exports exactly one component as the default export
- All types exported from a `types.ts` file at the package root
- All environment variables accessed through a validated `env.ts` module (using Zod to validate at startup)
- No magic strings — all route paths, channel types, user roles as TypeScript enums or const objects
