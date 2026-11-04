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
  plainFrontmatter,
  type ContentDoc,
  type FaqItem,
} from "../../src/content/schema.ts";

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
      return { question: question.trim(), answer: rest.join("\n").trim() };
    });
  if (items.length === 0) throw new ContentError(file, `expected "## Question" sections`);
  const empty = items.find((item) => !item.answer);
  if (empty) throw new ContentError(file, `FAQ "${empty.question}" has no answer`);
  return items;
}

/** Parse one file. `file` is relative to /content, e.g. "events/devfest-ilorin-2026.md". */
export function parseContentFile(file: string, raw: string): ContentDoc {
  const { data, content } = matter(fillFacts(file, raw));
  const meta = { file, body: content.trim(), hasTodo: raw.includes(TODO) };

  const expectedSlug = path.basename(file, ".md");
  if (data.slug !== expectedSlug) {
    throw new ContentError(file, `slug "${data.slug}" must match the filename "${expectedSlug}"`);
  }

  if (file === "otcf.md") {
    return { ...validate(file, orgFrontmatter, data), ...meta, kind: "org", route: "/about" };
  }
  if (file === "faq.md") {
    const fm = validate(file, plainFrontmatter, data);
    return { ...fm, ...meta, kind: "faq", route: "/about#faq", items: faqItems(file, meta.body) };
  }
  if (file === "partner.md") {
    return { ...validate(file, plainFrontmatter, data), ...meta, kind: "partner", route: "/partner" };
  }
  if (file.startsWith("communities/")) {
    const fm = validate(file, communityFrontmatter, data);
    return { ...fm, ...meta, kind: "community", route: `/communities/${fm.slug}` };
  }
  if (file.startsWith("events/")) {
    const fm = validate(file, eventFrontmatter, data);
    return { ...fm, ...meta, kind: "event", route: `/events/${fm.slug}` };
  }
  throw new ContentError(file, "unknown content file — add it to scripts/lib/content.ts");
}

/** Every content file, drafts included. Throws on the first invalid file. */
export function loadAllContent(): ContentDoc[] {
  return listMarkdown(CONTENT_DIR).map((file) =>
    parseContentFile(file, fs.readFileSync(path.join(CONTENT_DIR, file), "utf8")),
  );
}

/**
 * Published docs must not point at routes that won't exist in production
 * (a draft or a missing community/event), or the site and the assistant would
 * hand visitors a 404.
 */
export function findDraftLinks(docs: ContentDoc[]): string[] {
  const published = new Set(docs.filter((d) => d.publish).map((d) => d.route));
  const problems: string[] = [];
  for (const doc of docs.filter((d) => d.publish)) {
    const text = JSON.stringify(doc);
    // Site-relative only: skip paths inside external URLs (".../events/details").
    for (const [route] of text.matchAll(/(?<![\w.])\/(?:communities|events)\/[a-z0-9-]+/g)) {
      if (!published.has(route)) problems.push(`content/${doc.file} links to ${route}, which is not published`);
    }
  }
  return [...new Set(problems)];
}
