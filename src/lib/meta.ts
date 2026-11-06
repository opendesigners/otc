import type { MetaDescriptor } from "react-router";
import { siteConfig } from "~/config";

/**
 * Per-page <head> tags. React Router replaces (not merges) parent meta, so
 * every route returns the full set from here.
 */
export function pageMeta({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): MetaDescriptor[] {
  const url = `${siteConfig.url}${path === "/" ? "" : path}`;
  const fullTitle = path === "/" ? title : `${title} · ${siteConfig.shortName}`;
  return [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:type", content: "website" },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:locale", content: "en_NG" },
    // Build with AI 2026 crowd photo, cropped to 1200×630 (public/og.jpg).
    { property: "og:image", content: `${siteConfig.url}/og.jpg` },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "A packed auditorium of community members cheering at Build with AI 2026" },
    { name: "twitter:card", content: "summary_large_image" },
    { tagName: "link", rel: "canonical", href: url },
    ...(noindex ? [{ name: "robots", content: "noindex" }] : []),
  ];
}
