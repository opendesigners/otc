import { type RouteConfig, index } from "@react-router/dev/routes";

// Phase 2 adds /about, /communities(/:slug), /events(/:slug), /partner,
// /privacy, /contact; Phase 3 adds /ask.
export default [index("routes/home.tsx")] satisfies RouteConfig;
