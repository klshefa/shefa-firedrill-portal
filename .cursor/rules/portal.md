This repo is one portal in a 7-portal ecosystem sharing a single Supabase project.

Default to portal-only changes unless explicitly performing a cross-portal contract change.

Follow existing patterns in this repo for:
- Supabase client initialization
- Auth/session handling
- Middleware
- Database access helpers

Do NOT:
- Invent new Supabase client patterns
- Introduce new auth/session flows
- Change shared cookie domain behavior

Framework conventions:
- Next.js App Router only (/app)
- TypeScript throughout
- Tailwind CSS for styling

Before proposing schema, RLS, or auth changes:
- Confirm whether the change is cross-portal
- List other portals that would be impacted

When responding with implementation plans:
- Keep steps concise
- Prefer minimal backwards-compatible changes
