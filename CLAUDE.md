# OTCF website

The official site for Open Tech Communities Foundation: a single "front door" to Nigeria's open tech communities. The homepage is one prompt box. A visitor asks in plain language and gets a short, grounded answer plus the exact link to go next. Every other page exists to be the single source of truth the assistant answers from.

Private by design: no login, no analytics or tracking, no cookies, no conversation storage.

## Organisation context (canonical)

Treat this section as the source of truth. When it conflicts with anything else, this wins. Never invent facts beyond it; scaffold unknowns as `TODO`.

- **Open Tech Communities Foundation (OTCF)** is a Nigerian nonprofit registered on **7 May 2026** as an **Incorporated Trustee under CAC Part F**. Registered address: **1 Civil Service Road, GRA, Ilorin, Kwara State, Nigeria**. Always describe OTCF as already registered and recently founded — never "in the process of registering". The CAC IT number is not published yet; don't add one until the user confirms it.
- OTCF is the registered parent body for three independently operating tech communities: **Open Designers**, **Open Devs** and **GDG Ilorin**. Each keeps its own identity, leadership and activities; OTCF provides legal recognition, organisational backing and a shared institutional home for growth and long-term sustainability.
- Canonical analogy: **OTCF is to its communities what Alphabet is to Google.** It is **not a merger**.
- OTCF trustees (the only people listed on /about):
  - **Areous A. Ahmad** — Chairman & founder. Product designer and community builder, 7+ years of community work, Lead Organizer of GDG Ilorin, founder of Open Designers.
  - **Faith Ayomide Odetunde** — Secretary & co-trustee.
- **GDG Ilorin**: **4,600+ members** (live count on the GDG platform, rounded down; single value in `src/facts.ts` as `gdgIlorinMembers`). Join at **https://gdg.community.dev/gdg-ilorin/** (confirmed). Five organisers, all listed on /communities/gdg-ilorin: Areous A. Ahmad (Lead Organizer), Adeola Grace, Ahmed Olanrewaju, Abdulaziz Akanbi, Imam Bashir A. Public email: gdgilorincmty@gmail.com. Talk recordings go to the GDG Ilorin YouTube channel (URL not yet supplied).
- **DevFest Ilorin**: the largest tech conference in North Central Nigeria, run by GDG Ilorin, with **2,500+ attendees across past editions**.
- **DevFest Ilorin 2026**: 6–7 November 2026 at Ilorin Innovation Hub, 9a Ahmadu Bello Way, Ilorin 240212, Kwara. Friday 6 Nov = workshops across three halls (Balogun Ajikobi, Balogun Gambari, Balogun Fulani rooms). Saturday 7 Nov = conference. **Around 1,000 expected each day.** Headline sponsor: Qorelly. No 2026 site/registration URL yet — the event page has no `url` until the user supplies one. Previous edition site: 2025.devfestilorin.com.
- **Open Designers**: an open-source design initiative and community founded by Areous. **Open Devs**: the developer community under OTCF.
- Never hardcode: `SITE_URL`, `OTCF_CONTACT_EMAIL`, social links, logo files. They come from env (`src/config.ts`, allowlisted in `vite.config.ts`) or `/public/brand/`.

## Stack

- **Vite 8 + React 19 + TypeScript + Tailwind CSS 4**, **React Router 8 in framework mode** (`@react-router/dev`), `appDirectory: "src"`. pnpm. Node ≥ 22.22. No UI library, no CMS, no database.
- **Rendering:** `ssr: false` + `prerender` in `react-router.config.ts`. Every route is prerendered to HTML in `build/client`. Pages ship **zero JS** by default; a route opts in with `export const handle: RouteHandle = { hydrate: true }` (`src/root.tsx` only renders `<Scripts/>` then). Only home and `/ask` opt in. Never add hydration to other routes.
  - React Router also emits `__spa-fallback.html`; `root.tsx` detects it via `UNSAFE_FrameworkContext.isSpaMode` because the build requires it to hydrate. Never route traffic to it.
- **API:** Hono in `/server`. `server/app.ts` is platform-neutral; `server/worker.ts` (Cloudflare Workers) and `server/node.ts` (Node: dev API, or site + API on a VPS) are the only platform-specific files. In dev, Vite proxies `/api` to the Node API on `OTCF_API_PORT` (8787).
- **AI (Phase 4):** AI SDK `streamText` with `@ai-sdk/anthropic`; model from `OTCF_MODEL`, default `claude-haiku-5-5`.
- **Hosting:** static `build/client` → Cloudflare Pages; API → Cloudflare Workers (`wrangler.jsonc`), routed at `/api/*` on the same domain. Alternative: VPS where `pnpm start` serves both behind Caddy.

## Content model

All facts live in `/content` as Markdown with frontmatter. `scripts/build-content.ts` parses them (gray-matter), validates with zod (`src/content/schema.ts`), checks `slug` = filename, fills `{{facts}}` from `src/facts.ts`, and writes `src/generated/content.json` + `content.ts` (gitignored). Pages, the assistant prompt and the keyword fallback all read that JSON through `src/content/index.ts` — never hardcode facts in components.

| File | Route | Kind |
| --- | --- | --- |
| `content/otcf.md` | `/about` | org |
| `content/communities/<slug>.md` | `/communities/<slug>` | community |
| `content/events/<slug>.md` | `/events/<slug>` | event |
| `content/faq.md` | `/about#faq` | faq (`## Question` + answer) |
| `content/partner.md` | `/partner` | partner |

- Shared frontmatter: `title`, `slug`, `summary`, `updated` (ISO date), `publish` (boolean). Unknown keys are rejected.
- Communities add `tagline`, `leads`, `joinUrl`, `links`, optional `email`. Events add `community`, `startDate`, `endDate`, `venue {name, address}`, `schedule`, `sponsors`, optional `url`, `expectedAttendance`, `recordingsUrl`.
- Numbers that change (member counts) are `{{key}}` tokens in content, defined once in `src/facts.ts`. Unknown keys fail the build.
- Unknown facts are written as the literal `TODO` (URL fields accept `TODO` or a valid URL). A file containing `TODO` must be `publish: false`.
- `pnpm content:check` (run by `pnpm build`) fails on: TODO in published files, invalid frontmatter, slug ≠ filename, unknown `{{facts}}`, and published content that links to an unpublished `/communities/*` or `/events/*` route.
- **Drafts:** included in `content.json` only for `pnpm dev` or `OTCF_SHOW_DRAFTS=true`; otherwise they never reach pages, the prerender list or the assistant.
- **Read content only in route `loader`s.** Loaders run at build time and are stripped from client bundles, so the JSON never ships to browsers.
- Event dates are interpreted in `Africa/Lagos`. Event pages switch from "upcoming" to "recap" on their own after `endDate` — never flip them by hand. (Static HTML is built once, so Phase 2 must handle the switch without a rebuild.)

## Assistant rules (Phase 4)

- System prompt is built per request from all visible content (no vector store), with each doc's slug and route.
- Answer only from content; 2–5 sentences then a link; say so when unknown and point to the contact email or relevant page; never invent dates, prices, sponsors, people or links; end with `Sources:` listing routes; reply in Yoruba, Hausa or Pidgin if the user writes in it, otherwise English; decline off-topic politely.
- Limits: 500-char input, one question per request, ~400 output tokens, per-IP rate limit behind a swappable interface (in-memory for Node; Cloudflare's rate-limiting binding is the Workers seam).
- No persistence: never log question or answer text, query strings or IPs. The API logs method, route, status and latency only (`server/app.ts`).
- No key or provider error → same endpoint returns keyword-search results; UI shows "Here's where to look". The site must be fully useful with no AI key.

## Design rules

- OTCF reads as an independent nonprofit — **never use Qorelly colours, type or the Ciscela font**.
- Rounded-full buttons, no box shadows, Solar icons (Bold = active, Outline = inactive).
- Typography-led, warm neutrals, one accent; light/dark via CSS variables (`src/app.css`), system preference by default. Heading serif is free and self-hosted (two options proposed in Phase 5 before applying).
- Only two decorative interactions: community-mark cycling and the submit arrow → OTCF mark morph. Respect `prefers-reduced-motion`.
- Mobile-first: works at 360px with 16px gutters and no horizontal scroll. Audience is largely on 3G/4G.
- Accessibility: semantic HTML, visible focus, keyboard-operable prompt and chips, live region for streamed answers, WCAG AA contrast.

## Working rules

- Build in phases and pause for review after each: 1 scaffold → 2 static pages → 3 home + `/ask` with keyword fallback → 4 AI route → 5 polish.
- Local `pnpm dev` / `pnpm build` are the verification loop for this repo.
- Work on `feat/otcf-site`; never commit directly to `main`.
- Stop and report contradictions in the facts instead of resolving them by guessing.

## Commands

```bash
pnpm dev            # content (with drafts) → Vite on :5173 + Hono API on :8787
pnpm build          # content:check → content:build → react-router build (build/client)
pnpm start          # VPS mode: Node serves build/client + /api
pnpm content:check  # validate /content; block TODOs and draft links in published files
pnpm content:build  # regenerate src/generated/content.json (add --drafts to include drafts)
pnpm typecheck
pnpm lint
pnpm api:dev        # API on workerd via wrangler (reads .dev.vars)
pnpm api:deploy     # deploy the API Worker
```
