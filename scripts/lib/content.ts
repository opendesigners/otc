// Reads, fills and validates /content. Shared by build-content, content:check
// and the dev-server watcher so every consumer applies exactly the same rules.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import { facts } from "../../src/facts.ts";
import {
  TODO,
  communityFrontmatter,
  eventFrontmatter,
  orgFrontmatter,
  photosFile,
  plainFrontmatter,
  type ContentDoc,
  type FaqItem,
  type Photo,
} from "../../src/content/schema.ts";
import { renderMarkdown, slugify } from "./markdown.ts";

// A site route anywhere in a doc (prose, frontmatter or rendered links). The
// lookbehind skips paths inside external URLs like gdg.community.dev/events/….
const ROUTE_MENTION = /(?<![\w./])\/(?:about|ask|communities|events|partner|privacy|contact)(?:\/[a-z0-9-]+)*/g;

export const CONTENT_DIR = path.resolve(import.meta.dirname, "../../content");

export class ContentError extends Error {
  constructor(file: string, message: string) {
    super(`content/${file}: ${message}`);
    this.name = "ContentError";
  }
}

function listMarkdown(dir: string, prefix = ""): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return listMarkdown(path.join(dir, entry.name), rel);
      return entry.name.endsWith(".md") ? [rel] : [];
    })
    .sort();
}

// {{gdgIlorinMembers}} → "4,600+". Unknown keys are an error, not a blank.
function fillFacts(file: string, raw: string): string {
  return raw.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    if (!(key in facts)) throw new ContentError(file, `unknown fact {{${key}}} — add it to src/facts.ts`);
    return facts[key as keyof typeof facts];
  });
}

function validate<S extends z.ZodType>(file: string, schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `"${i.path.join(".") || "(root)"}" ${i.message}`);
    throw new ContentError(file, issues.join("; "));
  }
  return result.data;
}

// "## Question" headings followed by answer paragraphs.
function faqItems(file: string, body: string): FaqItem[] {
  const items = body
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [question, ...rest] = chunk.split("\n");
      const answer = rest.join("\n").trim();
      return { question: question.trim(), answer, answerHtml: renderMarkdown(answer), id: slugify(question) };
    });
  if (items.length === 0) throw new ContentError(file, `expected "## Question" sections`);
  const empty = items.find((item) => !item.answer);
  if (empty) throw new ContentError(file, `FAQ "${empty.question}" has no answer`);
  return items;
}

// Events may end with a "## Recap" section that's shown only after endDate.
function splitRecap(body: string) {
  const [before, after] = body.split(/^## Recap[ \t]*$/m);
  const recap = after?.trim();
  return { body: before.trim(), recap: recap ? { body: recap, html: renderMarkdown(recap) } : undefined };
}

/** Parse one file. `file` is relative to /content, e.g. "events/devfest-ilorin-2026.md". */
export function parseContentFile(file: string, raw: string): ContentDoc {
  const { data, content } = matter(fillFacts(file, raw));
  const body = content.trim();
  const meta = { file, body, html: renderMarkdown(body), hasTodo: raw.includes(TODO) };

  const expectedSlug = path.basename(file, ".md");
  if (data.slug !== expectedSlug) {
    throw new ContentError(file, `slug "${data.slug}" must match the filename "${expectedSlug}"`);
  }

  if (file === "otcf.md") {
    return { ...validate(file, orgFrontmatter, data), ...meta, kind: "org", route: "/about" };
  }
  if (file === "faq.md") {
    const fm = validate(file, plainFrontmatter, data);
    return { ...fm, ...meta, kind: "faq", route: "/about#faq", items: faqItems(file, body) };
  }
  if (file === "partner.md") {
    return { ...validate(file, plainFrontmatter, data), ...meta, kind: "partner", route: "/partner" };
  }
  if (file.startsWith("pages/")) {
    const fm = validate(file, plainFrontmatter, data);
    return { ...fm, ...meta, kind: "page", route: `/${fm.slug}` };
  }
  if (file.startsWith("communities/")) {
    const fm = validate(file, communityFrontmatter, data);
    return { ...fm, ...meta, kind: "community", route: `/communities/${fm.slug}` };
  }
  if (file.startsWith("events/")) {
    const fm = validate(file, eventFrontmatter, data);
    for (const sponsor of fm.sponsors) {
      if (sponsor.logo && !fs.existsSync(path.join(SPONSORS_DIR, sponsor.logo))) {
        throw new ContentError(file, `sponsor "${sponsor.name}": public/sponsors/${sponsor.logo} does not exist`);
      }
    }
    const split = splitRecap(body);
    return {
      ...fm,
      ...meta,
      body: split.body,
      html: renderMarkdown(split.body),
      recap: split.recap,
      kind: "event",
      route: `/events/${fm.slug}`,
    };
  }
  throw new ContentError(file, "unknown content file — add it to scripts/lib/content.ts");
}

// Labels for site routes that aren't content files.
const STATIC_ROUTE_TITLES: Record<string, string> = {
  "/about": "About OTCF",
  "/communities": "Communities",
  "/events": "Events",
  "/contact": "Contact",
};

// "See <a href="/about">/about</a>" reads better as "See About OTCF". Markdown
// bodies keep the raw route so the assistant can cite it.
function titleRouteLinks(docs: ContentDoc[]): ContentDoc[] {
  const titles = new Map(Object.entries(STATIC_ROUTE_TITLES));
  for (const doc of docs) if (!titles.has(doc.route)) titles.set(doc.route, doc.title);
  const retitle = (html: string) =>
    html.replace(/<a href="(\/[^"]*)">\1<\/a>/g, (match, route: string) =>
      titles.has(route) ? `<a href="${route}">${titles.get(route)}</a>` : match,
    );
  return docs.map((doc) => {
    const next = { ...doc, html: retitle(doc.html) } as ContentDoc;
    if (next.kind === "faq") next.items = next.items.map((i) => ({ ...i, answerHtml: retitle(i.answerHtml) }));
    if (next.kind === "event" && next.recap) next.recap = { ...next.recap, html: retitle(next.recap.html) };
    return next;
  });
}

/** Every content file, drafts included. Throws on the first invalid file. */
export function loadAllContent(): ContentDoc[] {
  const docs = listMarkdown(CONTENT_DIR).map((file) =>
    parseContentFile(file, fs.readFileSync(path.join(CONTENT_DIR, file), "utf8")),
  );
  return titleRouteLinks(docs);
}

const PHOTOS_DIR = path.resolve(CONTENT_DIR, "../public/photos");
const SPONSORS_DIR = path.resolve(CONTENT_DIR, "../public/sponsors");
const VARIANT_WIDTHS = [640, 960];

/**
 * content/photos.json, validated: every listed file must exist in public/photos/,
 * stay under the size budget, and name a real community. Smaller copies
 * ("<name>-640.webp", "<name>-960.webp") are found automatically for srcset.
 */
export function loadPhotos(): Photo[] {
  const file = path.join(CONTENT_DIR, "photos.json");
  if (!fs.existsSync(file)) return [];
  const { photos } = validate("photos.json", photosFile, JSON.parse(fs.readFileSync(file, "utf8")));
  const communities = new Set(listMarkdown(path.join(CONTENT_DIR, "communities")).map((f) => path.basename(f, ".md")));

  return photos.map((photo) => {
    const full = path.join(PHOTOS_DIR, photo.file);
    if (!fs.existsSync(full)) {
      throw new ContentError("photos.json", `public/photos/${photo.file} does not exist`);
    }
    // Much of the audience is on 3G/4G: aim for ~80 KB, hard stop at 150 KB.
    const kb = Math.round(fs.statSync(full).size / 1024);
    if (kb > 150) {
      throw new ContentError("photos.json", `public/photos/${photo.file} is ${kb} KB — compress it under 150 KB (aim for ~80 KB)`);
    }
    if (photo.community && !communities.has(photo.community)) {
      throw new ContentError("photos.json", `${photo.file}: unknown community "${photo.community}"`);
    }
    const ext = path.extname(photo.file);
    const stem = photo.file.slice(0, -ext.length);
    const variants = VARIANT_WIDTHS.filter((w) => w < photo.width && fs.existsSync(path.join(PHOTOS_DIR, `${stem}-${w}${ext}`)));
    const srcSet = [...variants.map((w) => `/photos/${stem}-${w}${ext} ${w}w`), `/photos/${photo.file} ${photo.width}w`].join(", ");
    return { ...photo, src: `/photos/${photo.file}`, srcSet };
  });
}

/**
 * Published docs must not point at routes that won't exist in production
 * (a draft, or a community/event with no file), or the site and the assistant
 * would hand visitors a 404.
 */
export function findDraftLinks(docs: ContentDoc[]): string[] {
  const published = new Set(docs.filter((d) => d.publish).map((d) => d.route));
  const drafts = new Set(docs.filter((d) => !d.publish).map((d) => d.route));
  const problems: string[] = [];
  for (const doc of docs.filter((d) => d.publish)) {
    for (const [route] of JSON.stringify(doc).matchAll(ROUTE_MENTION)) {
      const isDocRoute = /^\/(communities|events)\/[a-z0-9-]+$/.test(route);
      if (drafts.has(route) || (isDocRoute && !published.has(route))) {
        problems.push(`content/${doc.file} links to ${route}, which is not published`);
      }
    }
  }
  return [...new Set(problems)];
}
