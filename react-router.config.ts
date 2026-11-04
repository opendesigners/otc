import fs from "node:fs";
import type { Config } from "@react-router/dev/config";
import type { ContentBundle } from "./src/content/schema.ts";

export default {
  appDirectory: "src",
  // No runtime server for pages: every route is prerendered to HTML in
  // build/client at build time and served as static files. The API is a
  // separate Hono app (server/).
  ssr: false,
  async prerender({ getStaticPaths }) {
    // content:build runs before react-router build, so this is the same bundle
    // the pages read — drafts are only present when they're meant to be.
    const bundle: ContentBundle = JSON.parse(fs.readFileSync("src/generated/content.json", "utf8"));
    const docRoutes = bundle.docs.filter((d) => d.kind === "community" || d.kind === "event").map((d) => d.route);
    return [...getStaticPaths(), ...docRoutes];
  },
} satisfies Config;
