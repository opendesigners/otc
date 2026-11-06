// Prerendered to build/client/robots.txt.

import { siteConfig } from "~/config";

export function loader() {
  const body = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /*.data$

Sitemap: ${siteConfig.url}/sitemap.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
