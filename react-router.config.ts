import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src",
  // No runtime server for pages: every route is prerendered to HTML in
  // build/client at build time and served as static files. The API is a
  // separate Hono app (server/).
  ssr: false,
  // Phase 2 adds the content-driven paths (/communities/:slug, /events/:slug).
  prerender: true,
} satisfies Config;
