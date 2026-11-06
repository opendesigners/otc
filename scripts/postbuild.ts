// Runs after `react-router build`. Shapes build/client for static hosting:
//
// 1. Flattens about/index.html → about.html so Cloudflare Pages serves /about
//    directly instead of redirecting to /about/ (one fewer round trip on slow
//    connections; canonical URLs have no trailing slash).
// 2. Leaves 404.html at the root (from the prerendered /404 route), which
//    Cloudflare Pages serves for unknown paths. Its presence also stops Pages
//    from treating the site as a single-page app.
// 3. Deletes __spa-fallback.html. React Router requires it to be built with
//    `ssr: false`, but nothing should ever serve it.

import fs from "node:fs";
import path from "node:path";
import { loadLocalEnv } from "./lib/env.ts";

const OUT = path.resolve(import.meta.dirname, "../build/client");

// Built pages bake these in. Fine to skip locally; on a real deploy they must be set.
loadLocalEnv();
for (const key of ["SITE_URL", "OTCF_CONTACT_EMAIL"]) {
  if (!process.env[key]?.trim()) {
    console.warn(`⚠ postbuild: ${key} is not set — canonical URLs/sitemap or the OTCF email will be missing from this build.`);
  }
}

function flatten(dir: string): number {
  let moved = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "assets") continue;
    const sub = path.join(dir, entry.name);
    moved += flatten(sub);
    const index = path.join(sub, "index.html");
    if (fs.existsSync(index)) {
      fs.renameSync(index, `${sub}.html`);
      moved += 1;
      if (fs.readdirSync(sub).length === 0) fs.rmdirSync(sub);
    }
  }
  return moved;
}

const moved = flatten(OUT);
fs.rmSync(path.join(OUT, "__spa-fallback.html"), { force: true });

if (!fs.existsSync(path.join(OUT, "404.html"))) {
  console.error("✗ postbuild: build/client/404.html is missing — is the /404 route prerendered?");
  process.exit(1);
}
console.log(`✓ postbuild: flattened ${moved} pages, removed SPA fallback, 404.html in place`);
