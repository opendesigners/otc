// Node entry.
// - `pnpm dev`: API only, on OTCF_API_PORT (default 8787); Vite proxies /api here.
// - `pnpm start` (VPS alternative): one process serves the prerendered site from
//   build/client and the API together, behind Caddy.

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { loadLocalEnv } from "../scripts/lib/env.ts";
import api from "./app.ts";

loadLocalEnv();

const production = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT ?? process.env.OTCF_API_PORT ?? 8787);

const root = new Hono();
root.route("/", api);

if (production) {
  root.use("/*", serveStatic({ root: "./build/client" }));
}

serve({ fetch: root.fetch, port }, (info) => {
  const what = production ? "site + API" : "API";
  console.log(`OTCF ${what} on http://localhost:${info.port}`);
});
