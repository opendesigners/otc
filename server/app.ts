// The OTCF API. Platform-neutral: the same app runs on Cloudflare Workers
// (server/worker.ts) and on Node (server/node.ts). Keep platform specifics in
// those entry files.

import { Hono } from "hono";

const app = new Hono().basePath("/api");

// Privacy rule: log status and latency only — never question or answer text,
// never query strings, never client IPs.
app.use(async (c, next) => {
  const started = Date.now();
  await next();
  console.log(`${c.req.method} ${c.req.routePath} ${c.res.status} ${Date.now() - started}ms`);
});

app.get("/health", (c) => c.json({ ok: true }));

// POST /ask arrives in Phase 3 (keyword fallback) and Phase 4 (streamed AI answer).

export default app;
