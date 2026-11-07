// Prerendered to build/client/sitemap.xml. Only published content is in the
// production bundle, so drafts never appear here.

import { siteConfig } from "~/config";
import { getContent } from "~/content";

const STATIC_ROUTES = ["/", "/about", "/communities", "/projects", "/impact", "/events", "/partner", "/contact"];

export function loader() {
  const docs = getContent().filter((d) => !d.route.includes("#") && !STATIC_ROUTES.includes(d.route));
  const updatedFor = (route: string) => getContent().find((d) => d.route === route)?.updated;

  const urls = [
    ...STATIC_ROUTES.map((route) => ({ route, updated: updatedFor(route) })),
    ...docs.map((d) => ({ route: d.route, updated: d.updated })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ route, updated }) =>
      `  <url><loc>${siteConfig.url}${route === "/" ? "/" : route}</loc>${updated ? `<lastmod>${updated}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
