import type { MetaDescriptor } from "react-router";
import { siteConfig } from "~/config";
import { breadcrumbLd } from "./seo";

/**
 * Per-page <head> tags. React Router replaces (not merges) parent meta, so
 * every route returns the full set from here: title, description, canonical,
 * Open Graph / Twitter, robots, and optional JSON-LD (see ./seo.ts).
 */
export function pageMeta({
  title,
  description,
  path,
  noindex = false,
  crumbs,
  jsonLd = [],
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  /** Breadcrumb trail after Home, e.g. [{ name: "Events", path: "/events" }]. */
  crumbs?: Array<{ name: string; path: string }>;
  jsonLd?: object[];
}): MetaDescriptor[] {
  const url = `${siteConfig.url}${path === "/" ? "" : path}`;
  // "About OTCF" stays as is; "Events" becomes "Events · OTCF".
  const fullTitle =
    path === "/" || title.includes(siteConfig.shortName) ? title : `${title} · ${siteConfig.shortName}`;
  const image = `${siteConfig.url}/og.jpg`;
  const imageAlt = "A packed auditorium of community members cheering at Build with AI 2026";
  return [
    { title: fullTitle },
    { name: "description", content: description },
    {
      name: "robots",
      content: noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1",
    },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:type", content: "website" },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:locale", content: "en_NG" },
    // Build with AI 2026 crowd photo, cropped to 1200×630 (public/og.jpg).
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: imageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: imageAlt },
    ...(crumbs ? [{ "script:ld+json": breadcrumbLd(crumbs) }] : []),
    ...jsonLd.map((ld) => ({ "script:ld+json": ld })),
  ];
}
