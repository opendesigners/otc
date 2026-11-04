# Open Tech Communities Foundation — website

The official site for Open Tech Communities Foundation (OTCF), the registered parent body for Open Designers, Open Devs and GDG Ilorin.

The homepage is a single prompt box: ask a question in plain language, get a short answer grounded in this repo's `/content`, plus the link to go next. No login, no tracking, no conversation storage. The site works fully without an AI key — the assistant falls back to keyword search.

**How it's built:** every page is prerendered to static HTML (React Router 8 + Vite) and ships no JavaScript, except the home page and `/ask`, which hydrate. A small Hono API (`/server`) answers `POST /api/ask`. Content is Markdown in `/content`, validated and compiled to JSON at build time.

## Requirements

- Node.js 22.22 or later
- pnpm 10 (`corepack enable` picks up the version pinned in `package.json`)

## Setup

```bash
pnpm install
```

```bash
cp .env.example .env.local
```

Everything in `.env.local` is optional for local development; see the comments in `.env.example`.

## Run

```bash
pnpm dev
```

This starts Vite on http://localhost:5173 and the API on port 8787 (Vite proxies `/api` to it). Drafts (`publish: false` content) are visible in dev, and editing anything in `/content` reloads the page.

## Editing content

All facts live in `/content` as Markdown with frontmatter — see `CLAUDE.md` for the full model.

- Write anything you don't know yet as `TODO` and keep that file at `publish: false`.
- Set `publish: true` once every `TODO` is gone.
- Member counts and other changing numbers live once in `src/facts.ts` and appear in content as `{{gdgIlorinMembers}}`.

Check your work:

```bash
pnpm content:check
```

`pnpm build` runs the same check and fails if a published file still contains `TODO`, links to an unpublished page, or has invalid frontmatter.

## Build

```bash
pnpm build
```

Output: static site in `build/client/`.

## Deploy (Cloudflare)

The site and the API deploy separately: static files to **Cloudflare Pages**, the API to a **Cloudflare Worker** on the same domain at `/api/*`.

### Site → Cloudflare Pages

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, and pick this repository.
2. Build settings:
   - Build command: `pnpm build`
   - Build output directory: `build/client`
3. Environment variables (Settings → Variables and Secrets):
   - `NODE_VERSION` = `22.22.0` (or newer)
   - `SITE_URL` = the public origin, e.g. `https://example.org`
   - `OTCF_CONTACT_EMAIL`, and any `OTCF_SOCIAL_*` links
   - Preview environment only: `OTCF_SHOW_DRAFTS` = `true` to review drafts on preview deployments
4. Add the custom domain under the project's **Custom domains** tab.

### API → Cloudflare Worker

```bash
pnpm exec wrangler login
```

```bash
pnpm exec wrangler secret put ANTHROPIC_API_KEY
```

In `wrangler.jsonc`, uncomment `routes` and set your domain so `example.org/api/*` reaches the Worker (the domain must be on Cloudflare). Then:

```bash
pnpm api:deploy
```

The Worker reads `ANTHROPIC_API_KEY` (secret), and optionally `OTCF_MODEL` and `OTCF_CONTACT_EMAIL` (plain variables, set in the dashboard or under `vars` in `wrangler.jsonc`). Without a key, `/api/ask` still answers with keyword-search results.

To run the API locally on the Workers runtime instead of Node, put secrets in `.dev.vars` and run:

```bash
pnpm api:dev
```

### Alternative: a single VPS

One Node process serves `build/client` and the API together. Behind Caddy:

```bash
pnpm install && pnpm build
```

```bash
PORT=8787 pnpm start
```

```
example.org {
  reverse_proxy localhost:8787
}
```

Run `pnpm start` under systemd (or similar) with the same environment variables as above.

## Project layout

```
content/             the source of truth — Markdown + frontmatter
scripts/             build-content (content → JSON) and content-check
server/              Hono API: app.ts (shared), worker.ts (Cloudflare), node.ts (Node/VPS)
src/                 the site (React Router app directory)
  config.ts          public, env-driven config (site URL, email, socials, brand files)
  facts.ts           numbers quoted in content, e.g. GDG Ilorin member count
  content/           zod schema + accessors over the generated JSON
  routes/            one file per page
public/brand/        logo marks (placeholders until final SVGs land)
```
