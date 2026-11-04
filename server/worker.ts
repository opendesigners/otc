// Cloudflare Workers entry. Deploy with `pnpm api:deploy` (see wrangler.jsonc).
// Route the site's /api/* to this Worker so the browser calls it same-origin.

import app from "./app.ts";

export default app;
