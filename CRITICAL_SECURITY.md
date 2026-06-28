# 🔴 CRITICAL: Exposed Secrets Must Be Rotated

## Summary

OAuth client secrets, API keys, and database credentials are currently committed to `.env` files in the repository. These credentials must be **rotated immediately** and moved to a secure secrets manager (Vercel Environment Variables, GitHub Actions Secrets).

## Exposed Credentials

### accounts/.env

| Secret | Type |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `GITHUB_CLIENT_ID` | OAuth client ID |
| `GITHUB_CLIENT_SECRET` | OAuth client secret |
| `DISCORD_CLIENT_ID` | OAuth client ID |
| `DISCORD_CLIENT_SECRET` | OAuth client secret |
| `EMAIL_PASSWORD` (Resend API key) | Email service key |
| `SENTRY_DSN` | Monitoring DSN |
| `POSTHOG_API_KEY` | Analytics API key |
| `DATABASE_URL` | Full database connection string with password |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

### about/.env, admin/.env, chat/.env, chatlanding/.env, docs/.env

| Secret | Type |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

## Immediate Actions Required

1. **Rotate all OAuth secrets** — Generate new client secrets in Google Cloud Console, GitHub OAuth Apps, Discord Developer Portal
2. **Rotate Resend API key** — Generate new key in Resend dashboard
3. **Rotate Supabase anon keys** — If needed for security, generate new keys in Supabase dashboard
4. **Remove .env files from git tracking** — Already in `.gitignore`, but verify with `git rm --cached` if previously tracked
5. **Add secrets to Vercel** — For each app's Vercel project, add the required env vars in the dashboard
6. **Scan git history** — Run `trufflehog` or `git-secrets` to assess historical exposure

## Prevention

- `.env` files are now in `.gitignore` at root and each sub-app level
- `.env.example` files exist for all 8 apps with placeholder values
- CI pipeline should include a secrets leak check (see `.github/workflows/ci.yml`)
- Consider pre-commit hooks with `detect-secrets` or similar
