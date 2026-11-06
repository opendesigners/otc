# OTCF website

The official site for Open Tech Communities Foundation: a single "front door" to Nigeria's open tech communities. The homepage is one prompt box. A visitor asks in plain language and gets a short, grounded answer plus the exact link to go next. Every other page exists to be the single source of truth the assistant answers from.

Private by design: no login, no analytics or tracking, no cookies, no conversation storage.

## Organisation context (canonical)

Treat this section as the source of truth. When it conflicts with anything else, this wins. Never invent facts beyond it; scaffold unknowns as `TODO`.

- **Open Tech Communities Foundation (OTCF)** is a Nigerian nonprofit registered on **7 May 2026** as an **Incorporated Trustee under CAC Part F**. Registered address: **1 Civil Service Road, GRA, Ilorin, Kwara State, Nigeria**. Always describe OTCF as already registered and recently founded — never "in the process of registering". The CAC IT number is not published yet; don't add one until the user confirms it.
- OTCF is the registered parent body for three independently operating tech communities: **Open Designers**, **Open Devs** (Open Designers' own developer community — confirmed by the user on 2026-11-06; still counted and listed as one of the three) and **GDG Ilorin**. Each keeps its own identity, leadership and activities; OTCF provides legal recognition, organisational backing and a shared institutional home for growth and long-term sustainability.
- Canonical analogy: **OTCF is to its communities what Alphabet is to Google.** It is **not a merger**.
- OTCF leadership (the only people listed on /about; `leadership` in `content/otcf.md`, in this order):
  - **Areous A. Ahmad** — Chairman & founder. Product designer and community builder, 7+ years of community work, Lead Organizer of GDG Ilorin, founder of Open Designers.
  - **Imam Bashir A.** — Co-chairperson (added 2026-11-06).
  - **Ahmed Olanrewaju** — Co-chairperson (added 2026-11-06).
  - **Faith Ayomide Odetunde** — Secretary & co-trustee.
- **GDG Ilorin**: **4,600+ members** (live count on the GDG platform, rounded down; single value in `src/facts.ts` as `gdgIlorinMembers`). Join at **https://gdg.community.dev/gdg-ilorin/** (confirmed). Five organisers, all listed on /communities/gdg-ilorin, with roles supplied by the user: Areous A. Ahmad (Lead Organizer), Imam Bashir A. (Operations), Ahmed Olanrewaju (Technical), Adeola Grace (Organizer), Abdulaziz Akanbi (Organizer). Public email: gdgilorincmty@gmail.com. Talk recordings go to the GDG Ilorin YouTube channel — the URL has not been supplied, so the published page mentions the channel without linking it. Add it to `links` when it arrives; never guess it.
- **Open Designers** and **Open Devs** are published (2026-11-06), from open-designers.org. Anything listing communities (e.g. the Phase 3 home cycler) must still read published communities only, so the site never links to a draft.
- **DevFest Ilorin**: the largest tech conference in North Central Nigeria, run by GDG Ilorin, with **2,500+ attendees across past editions**.
- **DevFest Ilorin 2026**: 6–7 November 2026 at Ilorin Innovation Hub, 9a Ahmadu Bello Way, Ilorin 240212, Kwara. Friday 6 Nov = workshops across three halls (Balogun Ajikobi, Balogun Gambari, Balogun Fulani rooms). Saturday 7 Nov = conference. **Around 1,000 expected each day.** Event website **https://devfestilorin.com**; tickets **https://gdg.community.dev/events/details/google-gdg-ilorin-presents-devfest-ilorin-2026/** (both confirmed 2026-11-04). Previous edition site: 2025.devfestilorin.com.
- **DevFest Ilorin 2026 sponsors** — tiers and order exactly as on devfestilorin.com, confirmed by the user on 2026-11-04 (this **corrects** the original brief, which said Qorelly was headline): **Headline: Blaaiz. Diamond: Qorelly.** Sponsors: MalHub, Verafy, Ilorin Innovation Hub, SqaleUp, Celerlinks. Partners: Fuskar, Exploit Forge Academy, Pixel Pioneer, StartupList Africa, Unovia, CampusX. Community partners: GDSC University of Ilorin, GDSC Kwara State University, GDSC Kwara State Polytechnic, GDSC Al-Hikmah University, Open Designers, Kwarabuild. No sponsor website URLs are known — logos are not linked; never guess them.
- **Past GDG Ilorin events with photos** (albums supplied by the user): DevFest Ilorin 2025 (Day 2 at Ilorin Innovation Hub, Day 3 in a decorated hall), Google I/O Extended Ilorin 2022. Also **Build with AI 2026** — its organiser hasn't been confirmed, so its photos aren't tagged to a community.
- **Open Designers**: an open-source design and dev community founded by Areous, running since 2022; free UI kits, design systems and code, especially for designers across Africa. Website **https://open-designers.org**; join on Discord **https://discord.gg/ZWSCxZcA**; Figma Community, GitHub (`opendesigners`), LinkedIn and X (`open_designers`) links are in its frontmatter. Team as listed on open-designers.org: Areous A. Ahmad (Founder & Product designer), Daniel O. (Fullstack Dev), Cyph (Frontend Dev). Projects: open-source design files, Open Devs, PixelScout, Open Hangouts. **Open Devs**: Open Designers' developer community (components, tooling, Figma-to-code); shares Open Designers' Discord and GitHub; no separate leads listed.
- Never hardcode: `SITE_URL`, `OTCF_CONTACT_EMAIL`, social links, logo files. They come from env (`src/config.ts`, allowlisted in `vite.config.ts`) or `/public/brand/`.
- **Logos:** Open Designers (`public/brand/open-designers-mark.svg`, icon cut from the supplied vector wordmark `open-designers-logo.svg`) and GDG Ilorin (the GDG brackets, `gdg-ilorin-mark.svg`) are real. **OTCF and Open Devs are still placeholder monograms** — replace the files when the SVGs arrive. Marks are configured in `siteConfig.brand` with `invertInDark` (true for single-colour black marks, false for colour ones).

## Stack

- **Vite 8 + React 19 + TypeScript + Tailwind CSS 4**, **React Router 8 in framework mode** (`@react-router/dev`), `appDirectory: "src"`. pnpm. Node ≥ 22.22. No UI library, no CMS, no database.
- **Rendering:** `ssr: false` + `prerender` in `react-router.config.ts`. Every route is prerendered to HTML in `build/client`. Pages ship **zero JS** by default; a route opts in with `export const handle: RouteHandle = { hydrate: true }` (`src/root.tsx` only renders `<Scripts/>` then). Only home and `/ask` opt in. Never add hydration to other routes.
- **Links on static pages are plain `<a href>`**, not `<Link>` — there is no client router on those pages.
- **Postbuild** (`scripts/postbuild.ts`): flattens `about/index.html` → `about.html` so Cloudflare Pages serves `/about` without a trailing-slash redirect, keeps `404.html` (from the `/404` route) for unknown paths, and deletes `__spa-fallback.html` plus the unused `.data` files for robots, sitemap and /404. It warns if `SITE_URL` or `OTCF_CONTACT_EMAIL` is unset, and **fails on Cloudflare Pages (`CF_PAGES`) when `SITE_URL` is unset**, since every canonical, sitemap and JSON-LD URL would say localhost.

### React Router internals we depend on

- `src/root.tsx` reads `UNSAFE_FrameworkContext.isSpaMode` to tell the SPA fallback shell (which React Router insists can hydrate) apart from real prerendered pages (which must not load scripts). `UNSAFE_` exports can change in any release.
- Therefore `react-router` and `@react-router/dev` are pinned to **major 8** (`^8.5.1`). Before moving to a new major — or if a minor upgrade misbehaves — rebuild and confirm: the build succeeds, `build/client/index.html` and the other non-hydrating pages contain **no** `<script type="module">`, and a page with `handle.hydrate` does. If `isSpaMode` disappears, the build fails with "SPA Mode: Did you forget to include `<Scripts/>`" rather than shipping something wrong.
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
| `content/pages/<slug>.md` | `/<slug>` (e.g. `/privacy`) | page (each needs a small route file, see `src/routes/privacy.tsx`) |

- Shared frontmatter: `title`, `slug`, `summary`, `updated` (ISO date), `publish` (boolean). Unknown keys are rejected.
- Communities add `tagline`, `leads`, `joinUrl`, `links`, optional `email`. Events add `community`, `startDate`, `endDate`, `venue {name, address}`, `schedule`, `sponsors`, optional `url`, `expectedAttendance`, `recordingsUrl`.
- Markdown is rendered to HTML at build time (`marked`, in `scripts/lib/markdown.ts`); pages never ship a Markdown parser. Site routes written in prose ("See /about.") become links titled with the target page's title; the Markdown keeps the raw route for the assistant to cite.
- Structured facts (schedule, sponsors, leads, email) render from frontmatter, so don't repeat them as body sections — the page would show them twice.
- An event may end with a `## Recap` section: it's split out of the body and shown only after `endDate`.
- Numbers that change (member counts) are `{{key}}` tokens in content, defined once in `src/facts.ts`. Unknown keys fail the build.
- Unknown facts are written as the literal `TODO` (URL fields accept `TODO` or a valid URL). A file containing `TODO` must be `publish: false`.
- `pnpm content:check` (run by `pnpm build`) fails on: TODO in published files, invalid frontmatter, slug ≠ filename, unknown `{{facts}}`, and published content that links to an unpublished route.
- **Drafts:** included in `content.json` only for `pnpm dev` or `OTCF_SHOW_DRAFTS=true`; otherwise they never reach pages, the prerender list, the sitemap or the assistant.
- The bundle also carries `communities`: every community (drafts included) as name + tagline, with `route` only when published — so the UI can truthfully show all three while never linking to a draft (`getCommunitySummaries()`).
- **Read content only in route `loader`s.** Loaders run at build time and are stripped from client bundles, so the JSON never ships to browsers.
- **Date-aware events:** dates are interpreted in `Africa/Lagos`. Pages are built once, so each event wrapper carries `data-event-start/end` and a build-day `data-event-state` (`upcoming` | `live` | `past`); CSS shows the matching `.when-*` blocks, and a ~500-byte inline script (`src/components/EventState.tsx`, no React) recomputes the state from today's Lagos date on load. Without JS, the build-day state stays. Never flip events by hand.
- **`content/pages/privacy.md` describes the real infrastructure** (Cloudflare hosting, Anthropic as AI provider, what the API logs, how rate limiting counts). If any of those change — e.g. moving to the VPS option or another AI provider — update that page in the same change.

## Assistant rules (Phase 4)

- System prompt is built per request from all visible content (no vector store), with each doc's slug and route.
- Answer only from content; 2–5 sentences then a link; say so when unknown and point to the contact email or relevant page; never invent dates, prices, sponsors, people or links; end with `Sources:` listing routes; reply in Yoruba, Hausa or Pidgin if the user writes in it, otherwise English; decline off-topic politely.
- Limits: 500-char input, one question per request, ~400 output tokens, per-IP rate limit behind a swappable interface (in-memory for Node; Cloudflare's rate-limiting binding `ASK_LIMITER` on Workers — see README → "Rate limiting on Cloudflare").
- No persistence: never log question or answer text, query strings or IPs. The API logs method, route, status and latency only (`server/app.ts`).
- No key or provider error → same endpoint returns keyword-search results; UI shows "Here's where to look". The site must be fully useful with no AI key.

## SEO

- Every route's `meta` returns `pageMeta()` (`src/lib/meta.ts`): title (`· OTCF` appended unless the title already says OTCF), description, canonical, robots (`max-image-preview:large`; `noindex` only for /404), Open Graph/Twitter with `public/og.jpg`, plus optional `crumbs` (BreadcrumbList) and `jsonLd`.
- JSON-LD builders live in `src/lib/seo.ts` and are emitted with React Router's `{ "script:ld+json": … }` meta descriptor (escaped, in the prerendered HTML): NGO + WebSite on home, NGO + FAQPage on /about, Organization (with `parentOrganization` OTCF) on community pages, Event on event pages. They only restate content — no invented prices, images, URLs or claims. Build the home page's objects in its `loader`, so once it hydrates it ships those small objects rather than whole docs.
- `robots.txt` disallows `/api/` and `*.data`; `sitemap.xml` lists published pages with `updated` as `lastmod`. `public/_headers` sets Cloudflare Pages security headers and caching (`/assets/*` immutable, other static folders one week).

## Design rules

- OTCF reads as an independent nonprofit — **never use Qorelly colours, type or the Ciscela font**.
- Rounded-full buttons, no box shadows, Solar icons (Bold = active, Outline = inactive). Icons live in `src/components/icons.tsx`, copied per icon from `@iconify-json/solar` so only used icons ship. Solar is CC BY 4.0 — keep the footer credit.
- **Design language: america.gov's, with OTCF's own identity** (decided 2026-11-04). Borrowed: a rounded hero panel (full viewport width, inset by the same gutter on top and sides — 8px on phones, 16px from `sm`; header and menu are uncapped to match) with an oversized serif greeting and muted one-line subhead; the "Ask anything…" pill overlapping a rounded photo panel; a single "Menu" pill opening a full-screen list of big serif links; image/text feature rows; centred serif page titles ending in a full stop (`withStop()`); a narrow column of large muted body text; soft grey rounded cards; a floating ask pill on inner pages, which on home docks at the bottom once the hero prompt scrolls away; a footer of big serif links, an edge-to-edge serif wordmark and small credits. **Never** borrow US-government cues (flags, seals, "official website" banner, navy-as-identity).
- **Brand personality:** open, credible, warm. Users are Nigerian designers, developers and students (largely on phones over 3G/4G), plus sponsors, partners and speakers.
- **Tokens** (OKLCH, `src/app.css`): `page` white / `panel` cool grey / `ink` near-black green / `muted` / `line`; `accent` deep green for buttons, links and focus; `brand` for large green surfaces (same as accent in light mode, deeper in dark mode so big areas stay calm). Light/dark follow the system. All text pairs verified ≥ 4.5:1 in both themes — re-check when changing tokens.
- **Type:** headings in **Newsreader** (OFL) — one self-hosted static display instance (opsz 72, wght 400, Latin subset incl. ₦ and Yoruba ẹ/ọ, ~19 KB) at `public/fonts/newsreader-display.woff2`, preloaded, with a metric-matched Georgia fallback. Body text is the system sans. Use the `type-*` classes (display, title, section, feature, lede); feature headings are sans 600 like america.gov's. Tracking never tighter than -0.04em.
- **Shape:** panels `--radius-panel` (2.5rem), cards `--radius-card` (2rem), every button and chip `rounded-full`. No box shadows anywhere — separate with panels, 1px borders, or the ask bar's page-coloured fade.
- **Layout switches** per route via `handle` (`src/root.tsx` → `RouteHandle`): `ownHeader` (home draws the header inside its hero panel), `askBar` (default shown; `false` hides it; `"dock"` — home — keeps it hidden until `.hero-prompt` scrolls off the top, via a CSS view timeline + `timeline-scope`, see `.ask-dock` in `src/app.css`; browsers without scroll timelines just show it), `hydrate`.
- **Menu** is the native popover API (`SiteMenu`), so it works with zero JS; the footer repeats every link for browsers without popover support.
- **Photos:** real community photos only (never stock of strangers presented as members). Each is listed in `content/photos.json` with `alt` (describe the actual scene), `width`, `height`, `event` (shown as the caption), optional `community`, `hero` / `feature` flags and `credit`; files live in `public/photos/` as WebP with EXIF stripped. Add `<name>-640.webp` and `<name>-960.webp` copies and they're picked up for `srcset` automatically. The build fails over 150 KB per file (aim ~80 KB; the hero is 1440px wide). `hero` → home hero; `feature` → the "Three communities" row; everything else → galleries on `/events` and on the tagged community's page.
- **Sponsor logos** live in `public/sponsors/` and are referenced by `logo` on an event's `sponsors` entries (tiers: `Headline sponsor`, `Diamond sponsor`, `Sponsor`, `Partner`, `Community partner` — order in `src/content/tiers.ts`). Third-party logos keep their colours, so they always sit on a light `.logo-tile`, even in dark mode. Sponsors appear on the event page (by tier), as "Backed by" on home and on `/partner` (`getBackers()`).
- **Never import runtime values from `~/content` or `~/content/schema` into components** — that would ship zod and the content JSON to browsers on hydrated pages. Components import types only; shared constants go in tiny standalone modules like `src/content/tiers.ts`.
- **Motion** (added at the user's request, 2026-11-04) is **CSS only** — no animation libraries, no JS on static pages. All of it lives in the "Motion" section of `src/app.css` and runs only under `prefers-reduced-motion: no-preference`; content is never hidden unless the animation can run.
  - Home: one choreographed entrance (~1.1s) — headline words rise in turn (`.hero-word` with `--i`), the photo panel opens (`.hero-media`), then prompt, chips, community marks and stats arrive (`.enter` / `.enter-pop` with `--d` in ms). Inner pages: a quieter title/lede entrance in `PageHero`.
  - Feedback: the send arrow morphs into the OTCF mark on hover/focus (`.morph`, a brief requirement); menu links stagger in (`@starting-style`); FAQ answers slide open; live events pulse (`.live-dot`).
  - Scroll-driven (`animation-timeline: view()`, skipped where unsupported): feature tiles open (`.tile-reveal`), photo and logo grid items rise (`.rise-in`), the footer wordmark rises, and on home the ask bar fades in (rising, when motion is allowed) as the hero prompt leaves (`.ask-dock`; it's `visibility: hidden` until then, so it can't be focused).
  - Don't add fade-and-rise to whole sections — it reads as template. The community-mark cycling (Phase 3) remains the one planned JS interaction.
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
pnpm build          # content:check → content:build → react-router build → postbuild (build/client)
pnpm start          # VPS mode: Node serves build/client + /api
pnpm content:check  # validate /content; block TODOs and draft links in published files
pnpm content:build  # regenerate src/generated/content.json (add --drafts to include drafts)
pnpm typecheck
pnpm lint
pnpm api:dev        # API on workerd via wrangler (reads .dev.vars)
pnpm api:deploy     # deploy the API Worker
```
