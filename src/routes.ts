import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Every path here is prerendered to static HTML (see react-router.config.ts).
// Phase 3 adds /ask.
export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("communities", "routes/communities.tsx"),
  route("communities/:slug", "routes/community.tsx"),
  route("projects", "routes/projects.tsx"),
  route("impact", "routes/impact.tsx"),
  route("events", "routes/events.tsx"),
  route("events/:slug", "routes/event.tsx"),
  route("partner", "routes/partner.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("contact", "routes/contact.tsx"),
  // Prerendered to 404.html, which Cloudflare Pages and server/node.ts serve for unknown paths.
  route("404", "routes/not-found.tsx"),
  route("sitemap.xml", "routes/sitemap.ts"),
  route("robots.txt", "routes/robots.ts"),
] satisfies RouteConfig;
