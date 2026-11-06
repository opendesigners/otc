// Markdown → HTML at build time, so pages never ship a Markdown parser.
// Content is authored in this repo, so the HTML is trusted.

import { Marked } from "marked";

const marked = new Marked({ gfm: true, async: false });

/** Site routes as written in prose, e.g. "See /about." or "(/events/devfest-ilorin-2026)". */
const SITE_ROUTE =
  /(^|[\s(])(\/(?:about|ask|communities|events|partner|privacy|contact)(?:\/[a-z0-9-]+)*(?:#[a-z0-9-]+)?)(?=$|[\s.,;:!?)])/g;

// Turn bare site routes in text into links, leaving existing links alone.
function linkSiteRoutes(html: string): string {
  let inAnchor = false;
  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        if (/^<a[\s>]/i.test(part)) inAnchor = true;
        else if (/^<\/a>/i.test(part)) inAnchor = false;
        return part;
      }
      return inAnchor ? part : part.replace(SITE_ROUTE, '$1<a href="$2">$2</a>');
    })
    .join("");
}

export function renderMarkdown(markdown: string): string {
  return linkSiteRoutes(marked.parse(markdown) as string).trim();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
