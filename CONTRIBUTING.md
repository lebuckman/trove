# Contributing

Trove is a personal project first, but issues and PRs are welcome.

## Stack

Next.js 16 (App Router, React 19) + TypeScript + Tailwind v4. Data and auth run on Supabase (Postgres, Google OAuth, private Storage), all behind row-level security. Motion handles the gesture and animation work, @dnd-kit the drag reorder, and Serwist the service worker.

## Setup

Requires Node 20+ and a Supabase project.

```bash
git clone https://github.com/lebuckman/trove.git
cd trove
npm install
```

Then wire up Supabase:

1. **Authentication → Providers:** enable Google. Create a Google Cloud OAuth client, paste its id and secret into Supabase, and add the callback URL Supabase shows to the client's authorized redirect URIs.
2. **Storage:** create a **private** bucket named `trove-media`.
3. **SQL Editor:** run `supabase/migrations/001_init.sql`, then `002_security.sql`. They create the `trove` schema, tables, RLS policies, the signup trigger, and the storage policies.
4. **Settings → API:** add `trove` to the exposed schemas.

Copy `.env.local.example` to `.env.local` and fill in your Supabase URL and anon key, then:

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build (webpack, for Serwist)
npm run lint     # eslint
npm run types    # regenerate Supabase types (needs the Supabase CLI)
```

`/dev-shell` renders the main surfaces with mock data for layout work without a session (dev builds only).

## Project layout

```
src/app/             App Router routes; (app) is the authed group, plus signin + the auth callback
src/components/       UI by area: gems, troves, tags, sheets, layout, ui primitives
src/lib/queries/      server-only reads (plus a client.ts for sheets and the lightbox)
src/lib/actions/      "use server" mutations
src/lib/supabase/     browser + server clients and the hand-typed Database
supabase/migrations/  schema, RLS, triggers, storage policies
```

Reads are Server Components calling `lib/queries`; writes are Server Actions in `lib/actions`. RLS is the security boundary: every table is scoped to `auth.uid()`, so the queries carry no explicit user filters. Uploaded media lives in a private bucket and is only reached through short-lived signed URLs minted server-side.

## Conventions

- Conventional commits with a scope when it helps (`feat(lightbox): …`, `fix(rls): …`). Brief subjects; body only when something non-obvious needs explaining.
- Linear history on `main`.
- Run `npm run lint` and a type-check before pushing.
- A few patterns look odd on purpose: the lightbox's stable key and axis-locked drag, the stat count-up that starts at 0 on the client. Check the comment next to one before "fixing" it.

## Deploying

Trove targets Vercel. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` as environment variables, then add the deployed URLs to both the Google OAuth client's authorized redirect URIs and Supabase's Authentication → URL Configuration.
