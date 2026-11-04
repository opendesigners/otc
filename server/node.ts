// Node entry.
// - `pnpm dev`: API only, on OTCF_API_PORT (default 8787); Vite proxies /api here.
// - `pnpm start` (VPS alternative): one process serves the prerendered site from
//   build/client and the API together, behind Caddy.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { loadLocalEnv } from "../scripts/lib/env.ts";
import api from "./app.ts";

loadLocalEnv();

const production = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? process.env.OTCF_API_PORT ?? 8787);
const STATIC_ROOT = "./build/client";

const root = new Hono();
root.route("/", api);

if (production) {
  // Pages are flattened by scripts/postbuild.ts: /about → about.html.
  root.use(
    "/*",
    serveStatic({
      root: STATIC_ROOT,
      rewriteRequestPath: (p) => (p === "/" || path.extname(p) ? p : `${p.replace(/\/$/, "")}.html`),
    }),
  );
}

root.notFound(async (c) => {
  if (!production || c.req.path.startsWith("/api/")) return c.json({ error: "Not found" }, 404);
  return c.html(await readFile(path.join(STATIC_ROOT, "404.html"), "utf8"), 404);
});

serve({ fetch: root.fetch, port }, (info) => {
  const what = production ? "site + API" : "API";
  console.log(`OTCF ${what} on http://localhost:${info.port}`);
});
